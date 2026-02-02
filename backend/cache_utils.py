import time

class SimpleCache:
    def __init__(self):
        self.cache = {}
        self.expiry = {}
    def get(self, key):
        if key in self.cache and self.expiry.get(key, 0) > time.time():
            return self.cache[key]
        return None
    def set(self, key, value, ttl=10):
        self.cache[key] = value
        self.expiry[key] = time.time() + ttl

def cached(cache, key, compute_fn, ttl=10):
    val = cache.get(key)
    if val is not None:
        return val
    val = compute_fn()
    cache.set(key, val, ttl)
    return val
