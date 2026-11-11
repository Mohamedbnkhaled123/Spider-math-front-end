import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, Subscription } from 'rxjs';

export interface SwrCacheEntry<T> {
  version: number;
  timestamp: number;
  data: T;
}

export interface SwrCallbacks<T> {
  onData: (data: T, fromCache: boolean) => void;
  onError?: (err: any) => void;
  onFinally?: () => void;
}

const SWR_PREFIX = 'spider_swr_';
const SWR_VERSION = 1;
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

@Injectable({
  providedIn: 'root'
})
export class SwrCacheService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly memoryCache = new Map<string, SwrCacheEntry<any>>();

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Retrieves cached data synchronously in 0ms.
   * Checks in-memory cache first, then persistent localStorage.
   */
  get<T>(key: string, ttlMs: number = DEFAULT_TTL_MS): T | null {
    const fullKey = `${SWR_PREFIX}${key}`;

    // 1. Memory check (fastest)
    if (this.memoryCache.has(fullKey)) {
      const entry = this.memoryCache.get(fullKey) as SwrCacheEntry<T>;
      if (entry && (Date.now() - entry.timestamp <= ttlMs)) {
        return entry.data;
      }
    }

    if (!this.isBrowser) {
      return null;
    }

    // 2. Persistent localStorage check
    try {
      const raw = localStorage.getItem(fullKey);
      if (!raw) return null;

      const entry: SwrCacheEntry<T> = JSON.parse(raw);
      if (!entry || entry.version !== SWR_VERSION) {
        localStorage.removeItem(fullKey);
        return null;
      }

      if (Date.now() - entry.timestamp > ttlMs) {
        // Stale data is still valid for SWR revalidation, but if expired beyond TTL, we purge
        localStorage.removeItem(fullKey);
        return null;
      }

      // Populate memory cache
      this.memoryCache.set(fullKey, entry);
      return entry.data;
    } catch {
      return null;
    }
  }

  /**
   * Persists data to both in-memory cache and persistent localStorage.
   */
  set<T>(key: string, data: T): void {
    const fullKey = `${SWR_PREFIX}${key}`;
    const entry: SwrCacheEntry<T> = {
      version: SWR_VERSION,
      timestamp: Date.now(),
      data
    };

    // Store in memory
    this.memoryCache.set(fullKey, entry);

    if (!this.isBrowser) return;

    try {
      localStorage.setItem(fullKey, JSON.stringify(entry));
    } catch (e: any) {
      // Storage quota exceeded: prune stale SWR keys
      this.pruneOldestEntries();
      try {
        localStorage.setItem(fullKey, JSON.stringify(entry));
      } catch {}
    }
  }

  /**
   * Checks whether valid cached data exists for key.
   */
  has(key: string, ttlMs: number = DEFAULT_TTL_MS): boolean {
    return this.get(key, ttlMs) !== null;
  }

  /**
   * Removes cached data for key.
   */
  remove(key: string): void {
    const fullKey = `${SWR_PREFIX}${key}`;
    this.memoryCache.delete(fullKey);
    if (this.isBrowser) {
      try {
        localStorage.removeItem(fullKey);
      } catch {}
    }
  }

  /**
   * Executes Stale-While-Revalidate pattern:
   * 1. Synchronously delivers cached data in 0ms (if available).
   * 2. Silently executes network fetch in the background.
   * 3. On network response, smoothly updates UI and updates cache.
   */
  execute<T>(
    key: string,
    fetcher$: Observable<T>,
    callbacks: SwrCallbacks<T>,
    ttlMs: number = DEFAULT_TTL_MS
  ): Subscription {
    let deliveredFromCache = false;

    // Phase 1: Stale (Immediate 0ms)
    const cached = this.get<T>(key, ttlMs);
    if (cached !== null && cached !== undefined) {
      deliveredFromCache = true;
      try {
        callbacks.onData(cached, true);
      } catch (err) {
        console.warn(`[SWR] Error applying cached data for ${key}:`, err);
      }
    }

    // Phase 2: Revalidate (Silent network update)
    return fetcher$.subscribe({
      next: (freshData) => {
        this.set(key, freshData);
        try {
          callbacks.onData(freshData, false);
        } catch (err) {
          console.warn(`[SWR] Error applying fresh data for ${key}:`, err);
        }
        if (callbacks.onFinally) callbacks.onFinally();
      },
      error: (err) => {
        // If data was delivered from cache, error is silent to prevent flashing empty UI
        if (!deliveredFromCache && callbacks.onError) {
          callbacks.onError(err);
        }
        if (callbacks.onFinally) callbacks.onFinally();
      }
    });
  }

  /**
   * Removes oldest SWR entries if quota is reached.
   */
  private pruneOldestEntries(): void {
    if (!this.isBrowser) return;
    try {
      const swrKeys: { key: string; timestamp: number }[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(SWR_PREFIX)) {
          try {
            const parsed = JSON.parse(localStorage.getItem(k) || '{}');
            swrKeys.push({ key: k, timestamp: parsed.timestamp || 0 });
          } catch {
            swrKeys.push({ key: k, timestamp: 0 });
          }
        }
      }

      // Sort oldest first and remove oldest half
      swrKeys.sort((a, b) => a.timestamp - b.timestamp);
      const toRemove = Math.max(1, Math.floor(swrKeys.length / 2));
      for (let i = 0; i < toRemove; i++) {
        localStorage.removeItem(swrKeys[i].key);
        this.memoryCache.delete(swrKeys[i].key);
      }
    } catch {}
  }
}
