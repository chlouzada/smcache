type Key = string | number;

type CacheItem = {
  data: unknown;
  expires: number;
  key?: Key;
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
  readonly #fnKey: ((key: Key) => string | number) | undefined;

  private constructor(opts?: Options) {
    this.#clone = opts?.clone ?? DEFAULTS.clone;
    this.#ttl = opts?.ttl ?? DEFAULTS.ttl;
    this.#fnKey = opts?.fnKey;

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

  #wrapper({ data, ttl, key }: { data: unknown; ttl?: number; key?: Key }) {
    const _data: unknown = this.#clone
      ? JSON.parse(JSON.stringify(data))
      : data;
    const _ttl = ttl ?? Date.now() + this.#ttl;
    return { data: _data, expires: _ttl, key: key };
  }

  #unwrapper_keys(key: Key, item: CacheItem) {
    if (!this.#fnKey) return item;

    if (item.key !== key) {
      return undefined;
    }

    return item;
  }

  #unwrapper_expiration(key: Key, item: CacheItem) {
    if (item.expires > Date.now()) {
      return item;
    }

    if (item.data) {
      this.#cache.delete(key);
    }
  }

  get(key: Key) {
    let item = this.#cache.get(key);
    if (!item) return undefined;

    item = this.#unwrapper_keys(key, item);
    if (!item) return undefined;

    item = this.#unwrapper_expiration(key, item);
    if (!item) return undefined;

    return item.data;
  }

  set(key: Key, data: unknown, opts?: { ttl?: number }) {
    this.#cache.set(
      key,
      this.#wrapper({ data, ...opts, key: this.#fnKey ? key : undefined }),
    );
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
