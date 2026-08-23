class RedisCacheService {
  private client: any = null;
  private memoryCache: Map<string, { value: any; expiresAt: number | null }> = new Map();
  private isRedisConnected: boolean = false;

  constructor() {
    if (typeof window === 'undefined') {
      const redisUrl = process.env.REDIS_URL;
      if (redisUrl) {
        try {
          const Redis = eval("require('ioredis')");
          this.client = new Redis(redisUrl, {
            lazyConnect: true,
            maxRetriesPerRequest: 1,
            connectTimeout: 2000,
          });

          this.client.on('connect', () => {
            this.isRedisConnected = true;
            console.log('[Redis Cache] Connected to live Redis instance');
          });

          this.client.on('error', (err: any) => {
            this.isRedisConnected = false;
            console.warn('[Redis Cache] Live Redis fallback to memory:', err?.message);
          });

          this.client.connect().catch(() => {
            this.isRedisConnected = false;
          });
        } catch {
          this.isRedisConnected = false;
        }
      }
    }
  }

  // GET cached value
  async get<T>(key: string): Promise<T | null> {
    if (this.isRedisConnected && this.client) {
      try {
        const data = await this.client.get(key);
        if (data) return JSON.parse(data) as T;
      } catch (err) {
        console.warn(`[Redis Cache] GET error for key ${key}:`, err);
      }
    }

    // memory cache
    const entry = this.memoryCache.get(key);
    if (!entry) return null;

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  // SET cached value
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);

    if (this.isRedisConnected && this.client) {
      try {
        if (ttlSeconds) {
          await this.client.set(key, serialized, 'EX', ttlSeconds);
        } else {
          await this.client.set(key, serialized);
        }
      } catch (err) {
        console.warn(`[Redis Cache] SET error for key ${key}:`, err);
      }
    }

    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.memoryCache.set(key, { value, expiresAt });
  }

  // DEL cached key
  async del(key: string): Promise<void> {
    if (this.isRedisConnected && this.client) {
      try {
        await this.client.del(key);
      } catch (err) {
        console.warn(`[Redis Cache] DEL error for key ${key}:`, err);
      }
    }
    this.memoryCache.delete(key);
  }

  // invalidate all keys matching pattern
  async invalidatePattern(pattern: string): Promise<void> {
    if (this.isRedisConnected && this.client) {
      try {
        const keys = await this.client.keys(`*${pattern}*`);
        if (keys.length > 0) {
          await this.client.del(...keys);
        }
      } catch (err) {
        console.warn('[Redis Cache] Pattern deletion error:', err);
      }
    }

    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key);
      }
    }
  }

  // flush entire cache
  async flush(): Promise<void> {
    if (this.isRedisConnected && this.client) {
      try {
        await this.client.flushdb();
      } catch (err) {
        console.warn('[Redis Cache] Flush error:', err);
      }
    }
    this.memoryCache.clear();
  }
}

export const redisCache = new RedisCacheService();
