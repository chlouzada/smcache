type CacheItem = {
  data: unknown;
  expires: number;
};

const DEFAULTS = {
  clone: true,
  ttl: 1000 * 60 * 60 * 24,
};

type Options = {
  clone?: boolean;
  ttl?: number;
};

class SMCache {
  #cache = new Map<string | number | object, CacheItem>();
  readonly #clone: boolean;
  readonly #ttl: number;

  private constructor(opts?: Options) {
    this.#clone = opts?.clone || DEFAULTS.clone;
    this.#ttl = opts?.ttl || DEFAULTS.ttl;
  }

  #wrapper(data: unknown) {
    const _data: unknown = this.#clone
      ? JSON.parse(JSON.stringify(data))
      : data;
    return { data: _data, expires: Date.now() + this.#ttl };
  }

  get(key: string) {
    const now = Date.now();
    const item = this.#cache.get(key);
    if (item && item.expires > now) {
      return item.data;
    }
    this.#cache.delete(key);
    return undefined;
  }

  set(key: string, data: unknown) {
    this.#cache.set(key, this.#wrapper(data));
  }

  delete(key: string) {
    this.#cache.delete(key);
  }

  static create(opts?: Options) {
    return new SMCache(opts);
  }
}

export const create = SMCache.create;
export default SMCache.create();
