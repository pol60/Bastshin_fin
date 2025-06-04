// src/lib/redis.ts
export const redisClient = {
    get: async <T>(key: string): Promise<T | null> => {
      try {
        const response = await fetch(`/api/redis/${encodeURIComponent(key)}`);
        return await response.json();
      } catch (error) {
        console.error('Redis Client Error:', error);
        return null;
      }
    },
  
    setex: async <T>(key: string, ttl: number, value: T): Promise<void> => {
      try {
        await fetch(`/api/redis/${encodeURIComponent(key)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value, ttl }),
        });
      } catch (error) {
        console.error('Redis Client Error:', error);
      }
    },
  
    del: async (pattern: string): Promise<void> => {
      try {
        await fetch(`/api/redis?pattern=${encodeURIComponent(pattern)}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.error('Redis Client Error:', error);
      }
    }
  };