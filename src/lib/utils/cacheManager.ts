export const cacheManager = {
  get: <T>(key: string, maxAgeMs: number): T | null => {
    if (typeof localStorage === "undefined") return null;
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;
      const parsed = JSON.parse(stored) as { timestamp?: number; data?: T };
      if (typeof parsed?.timestamp !== "number" || !("data" in parsed)) {
        localStorage.removeItem(key);
        return null;
      }
      if (Date.now() - parsed.timestamp < maxAgeMs) {
        return parsed.data as T;
      }
      localStorage.removeItem(key);
      return null;
    } catch {
      return null;
    }
  },
  
  set: <T>(key: string, data: T): void => {
    if (typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(key, JSON.stringify({
        timestamp: Date.now(),
        data
      }));
    } catch (e) {
      console.warn("Could not set cache for key", key, e);
    }
  }
};
