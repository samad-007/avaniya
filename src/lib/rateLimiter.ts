/**
 * In-memory sliding window rate limiter for Next.js API route handlers.
 * Prevents credential stuffing, brute force attacks, and spam requests.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up expired IP keys periodically every 5 minutes
if (typeof setInterval !== "undefined") {
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetAt) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);

  // Prevent background timer from hanging process termination
  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }
}

/**
 * Check if a client IP has exceeded the allowed rate limit within the time window.
 *
 * @param identifier Client IP address or unique requester string
 * @param maxRequests Maximum allowed requests in the window (default: 10)
 * @param windowMs Window duration in milliseconds (default: 60,000ms = 1 minute)
 * @returns { allowed: boolean; remaining: number; resetInMs: number }
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetInMs: windowMs,
    };
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetInMs: Math.max(0, record.resetAt - now),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetInMs: Math.max(0, record.resetAt - now),
  };
}
