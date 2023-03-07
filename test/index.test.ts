import { test, expect, vi, beforeEach, describe } from 'vitest';

import { create } from '../src';

describe('mod key function', () => {
  const cache = create();

  test('undefined key and setting', () => {
    const data = cache.get('key');
    expect(data).toBeUndefined();
    cache.set('key', 'value');
    const value = cache.get('key');
    expect(value).toBe('value');
  });

  test('delete key', () => {
    expect(cache.get('key')).toBe('value');
    cache.delete('key');
    expect(cache.get('key')).toBeUndefined();
  });

  test('string and number keys', () => {
    cache.set('key', 'string value');
    cache.set(1, 'number value');
    expect(cache.get('key')).toBe('string value');
    expect(cache.get(1)).toBe('number value');
  });
});

describe('expiration', () => {
  const opts = { ttl: 1000 * 60 * 60 * 24 };

  let cache = create(opts);

  beforeEach(() => {
    vi.useFakeTimers();
    cache = create(opts);
  });

  test('get an expired value', () => {
    cache.set('key', 'value');

    vi.advanceTimersByTime(1000 * 60 * 60 * 24 + 1);

    const value = cache.get('key');
    expect(value).toBeUndefined();
  });

  test('get a non-expired value', () => {
    cache.set('key', 'value');

    const value = cache.get('key');
    expect(value).toBe('value');
  });
});

describe('mod key function', () => {
  test('fixed key', () => {
    const cache = create({
      fnKey: () => 1,
    });

    cache.set('some key', 'value');
    const value = cache.get('key');
    expect(value).toBe('value');

    cache.set('other key', 'other value');
    expect(cache.get('key')).toBe('other value');
  });

  test('string and number keys should match', () => {
    const cache = create({
      fnKey(key) {
        return String(key).toUpperCase();
      },
    });
    cache.set(1, 'number value');
    expect(cache.get('1')).toBe('number value');
  });
});
