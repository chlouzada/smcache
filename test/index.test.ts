import { test, expect, vi, beforeEach, describe } from 'vitest';

import { create } from '../src';

test('set and get', () => {
  const cache = create();
  const data = cache.get('key');
  expect(data).toBeUndefined();
  cache.set('key', 'value');
  const value = cache.get('key');
  expect(value).toBe('value');
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

    // expire the value using vitest
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
