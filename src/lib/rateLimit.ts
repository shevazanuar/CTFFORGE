const bucket = new Map<string, { count: number; resetAt: number }>();

// Periodically clean up expired entries from memory to prevent memory leaks
function cleanup() {
  const now = Date.now();
  for (const [key, val] of bucket.entries()) {
    if (val.resetAt < now) {
      bucket.delete(key);
    }
  }
}

// Clean up every 5 minutes if running in Node.js/browser environment
if (typeof global !== 'undefined' && !(global as any).__rateLimitInterval) {
  (global as any).__rateLimitInterval = setInterval(cleanup, 5 * 60 * 1000);
}

/**
 * Basic in-memory rate limiter.
 * @param key Unique identifier (e.g., IP address + endpoint name)
 * @param limit Maximum allowed requests within the time window
 * @param windowMs Time window in milliseconds (default: 60,000ms / 1 minute)
 */
export function rateLimit(key: string, limit = 5, windowMs = 60_000) {
  const now = Date.now();
  const current = bucket.get(key);

  if (!current || current.resetAt < now) {
    bucket.set(key, { count: 1, resetAt: now + windowMs });
    return { 
      allowed: true, 
      count: 1, 
      limit, 
      resetAt: now + windowMs,
      retryAfter: 0 
    };
  }

  if (current.count >= limit) {
    return { 
      allowed: false, 
      count: current.count, 
      limit, 
      resetAt: current.resetAt, 
      retryAfter: Math.max(0, current.resetAt - now) 
    };
  }

  current.count += 1;
  bucket.set(key, current);

  return { 
    allowed: true, 
    count: current.count, 
    limit, 
    resetAt: current.resetAt,
    retryAfter: 0 
  };
}
