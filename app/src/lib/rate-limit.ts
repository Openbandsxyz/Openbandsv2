/**
 * OpenBands v2 - Rate Limiting Utility
 * 
 * Simple in-memory rate limiter using LRU cache.
 * For production, consider Redis or Vercel KV for distributed rate limiting.
 */

import { LRUCache } from 'lru-cache';

type RateLimitOptions = {
  interval: number; // milliseconds
  uniqueTokenPerInterval: number;
};

export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new LRUCache<string, number[]>({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000,
  });

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = tokenCache.get(token) || [0];
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount);
        }
        tokenCount[0] += 1;

        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage >= limit;

        return isRateLimited ? reject(new Error('Rate limit exceeded')) : resolve();
      }),
  };
}

// Preset rate limiters
export const communityCreationLimiter = rateLimit({ 
  interval: 3600000, // 1 hour
  uniqueTokenPerInterval: 500 
});

export const joinCommunityLimiter = rateLimit({ 
  interval: 60000, // 1 minute
  uniqueTokenPerInterval: 500 
});

export const postCreationLimiter = rateLimit({ 
  interval: 3600000, // 1 hour
  uniqueTokenPerInterval: 500 
});

export const commentCreationLimiter = rateLimit({ 
  interval: 3600000, // 1 hour
  uniqueTokenPerInterval: 500 
});

