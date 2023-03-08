type Key = string | number;

type CacheItem = {
  data: unknown;
  expires: number;
};

const DEFAULTS = {
  clone: true,
  ttl: 1000 * 60 * 60 * 24,
};

export type Options = {
  clone?: boolean;
  ttl?: number;
  fnKey?: (key: Key) => string | number;
};

class SMCache {
  #cache = new Map<Key, CacheItem>();
  readonly #clone: boolean;
  readonly #ttl: number;

  private constructor(opts?: Options) {
    this.#clone = opts?.clone ?? DEFAULTS.clone;
    this.#ttl = opts?.ttl ?? DEFAULTS.ttl;

    if (opts?.fnKey) {
      const fn = opts.fnKey;
      const _get = this.#cache.get;
      const _set = this.#cache.set;
      const _delete = this.#cache.delete;
      this.#cache.get = (k: Key) => _get.call(this.#cache, fn(k));
      this.#cache.set = (k: Key, v: CacheItem) =>
        _set.call(this.#cache, fn(k), v);
      this.#cache.delete = (k: Key) => _delete.call(this.#cache, fn(k));
    }
  }

  #wrapper({ data, ttl }: { data: unknown; ttl?: number }) {
    const _data: unknown = this.#clone
      ? JSON.parse(JSON.stringify(data))
      : data;
    const _ttl = ttl ?? Date.now() + this.#ttl;
    return { data: _data, expires: _ttl };
  }

  get(key: Key) {
    const item = this.#cache.get(key);

    if (item && item.expires > Date.now()) {
      return item.data;
    }

    if (item) {
      this.#cache.delete(key);
    }

    return undefined;
  }

  set(key: Key, data: unknown, opts?: { ttl?: number }) {
    this.#cache.set(key, this.#wrapper({ data, ...opts }));
  }

  delete(key: Key) {
    this.#cache.delete(key);
  }

  static create(opts?: Options) {
    return new SMCache(opts);
  }
}

export const create = SMCache.create;
export default SMCache.create();
