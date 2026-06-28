const encoder = new TextEncoder();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required.");
}

async function getCryptoKey() {
  const keyData = encoder.encode(JWT_SECRET);
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

// Convert a binary buffer to base64url string
function base64UrlEncode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Decode base64url string to string
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return decodeURIComponent(escape(atob(base64)));
}

export interface UserSessionPayload {
  id: string;
  name: string;
  email: string;
  role: string;
}

export async function signToken(payload: UserSessionPayload): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  
  const payloadWithExp = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 24 hours expiry
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payloadWithExp));
  
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  const key = await getCryptoKey();
  
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(signatureInput)
  );
  
  const signatureBytes = new Uint8Array(signatureBuffer);
  let binarySig = '';
  for (let i = 0; i < signatureBytes.byteLength; i++) {
    binarySig += String.fromCharCode(signatureBytes[i]);
  }
  
  const signature = btoa(binarySig)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
    
  return `${signatureInput}.${signature}`;
}

export async function verifyToken(token: string): Promise<UserSessionPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;
    
    const key = await getCryptoKey();
    const signatureInput = `${header}.${payload}`;
    
    // Decode base64url signature back to bytes
    let base64Sig = signature.replace(/-/g, '+').replace(/_/g, '/');
    while (base64Sig.length % 4) {
      base64Sig += '=';
    }
    const binarySig = atob(base64Sig);
    const sigBytes = new Uint8Array(binarySig.length);
    for (let i = 0; i < binarySig.length; i++) {
      sigBytes[i] = binarySig.charCodeAt(i);
    }
    
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      encoder.encode(signatureInput)
    );
    
    if (!isValid) return null;
    
    const decodedPayload = JSON.parse(base64UrlDecode(payload));
    
    // Check expiry
    if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return {
      id: decodedPayload.id,
      name: decodedPayload.name,
      email: decodedPayload.email,
      role: decodedPayload.role,
    };
  } catch {
    return null;
  }
}
