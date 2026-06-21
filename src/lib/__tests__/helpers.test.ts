import { describe, it, expect, beforeAll } from 'vitest';
import { rateLimit } from '../rateLimit';

let hashPassword: any;
let comparePassword: any;
let signToken: any;
let verifyToken: any;

beforeAll(async () => {
  // Set the secret before loading the module to prevent the load-time fail-fast check from throwing
  process.env.JWT_SECRET = 'test-jwt-secret-value-minimum-32-characters';
  
  const passwordModule = await import('../password');
  const authModule = await import('../auth');
  
  hashPassword = passwordModule.hashPassword;
  comparePassword = passwordModule.comparePassword;
  signToken = authModule.signToken;
  verifyToken = authModule.verifyToken;
});

describe('Password Helper (Bcrypt)', () => {
  it('should successfully hash and verify a password', async () => {
    const plainText = 'my-secure-password';
    const hash = await hashPassword(plainText);
    expect(hash).not.toBe(plainText);

    const isMatch = await comparePassword(plainText, hash);
    expect(isMatch).toBe(true);

    const isFail = await comparePassword('wrong-password', hash);
    expect(isFail).toBe(false);
  });
});

describe('JWT Auth Helper (Web Crypto)', () => {
  it('should sign and verify tokens properly', async () => {
    const payload = { id: 'agent-1', name: 'James', role: 'ADMIN', email: 'test@ctfforge.io' };
    const token = await signToken(payload);
    expect(token).toBeDefined();

    const verifiedPayload = await verifyToken(token);
    expect(verifiedPayload).toBeDefined();
    expect(verifiedPayload?.id).toBe(payload.id);
    expect(verifiedPayload?.name).toBe(payload.name);
    expect(verifiedPayload?.role).toBe(payload.role);
  });

  it('should fail verification for corrupted tokens', async () => {
    const payload = { id: 'agent-1', name: 'James', role: 'ADMIN', email: 'test@ctfforge.io' };
    const token = await signToken(payload);
    const corruptedToken = token + 'corrupted';

    const result = await verifyToken(corruptedToken);
    expect(result).toBeNull();
  });
});

describe('In-Memory Rate Limiter', () => {
  it('should allow requests within limit and block when exceeded', () => {
    const key = 'test_limiter_key';
    const limit = 3;

    // 1st request
    const res1 = rateLimit(key, limit, 10000);
    expect(res1.allowed).toBe(true);
    expect(res1.count).toBe(1);

    // 2nd request
    const res2 = rateLimit(key, limit, 10000);
    expect(res2.allowed).toBe(true);
    expect(res2.count).toBe(2);

    // 3rd request
    const res3 = rateLimit(key, limit, 10000);
    expect(res3.allowed).toBe(true);
    expect(res3.count).toBe(3);

    // 4th request (should be blocked)
    const res4 = rateLimit(key, limit, 10000);
    expect(res4.allowed).toBe(false);
    expect(res4.retryAfter).toBeGreaterThan(0);
  });
});
