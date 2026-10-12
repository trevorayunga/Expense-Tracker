import { describe, test, expect } from '@jest/globals';
import { convertAmount, calculateTotal, filterByCategory } from '../src/utils.js';

const rates = { USD: 1, KES: 100, EUR: 0.5 };
const expenses = [
  { id: '1', description: 'Lunch', amount: 10, currency: 'USD', category: 'Food' },
  { id: '2', description: 'Bus', amount: 500, currency: 'KES', category: 'Transport' },
  { id: '3', description: 'Shirt', amount: 20, currency: 'EUR', category: 'Shopping' }
];

describe('convertAmount', () => {
  test('converts between two non-base currencies', () => {
    expect(convertAmount(500, 'KES', 'EUR', rates)).toBeCloseTo(2.5);
  });
  test('same currency returns the same amount', () => {
    expect(convertAmount(42, 'USD', 'USD', rates)).toBe(42);
  });
  test('zero amount converts to zero', () => {
    expect(convertAmount(0, 'USD', 'KES', rates)).toBe(0);
  });
  test('returns null when a rate is missing or rates are absent', () => {
    expect(convertAmount(10, 'XXX', 'USD', rates)).toBeNull();
    expect(convertAmount(10, 'USD', 'KES', null)).toBeNull();
  });
});

describe('calculateTotal', () => {
  test('sums converted values in the home currency', () => {
    // 10 USD + 500 KES (=5 USD) + 20 EUR (=40 USD) = 55 USD
    expect(calculateTotal(expenses, 'USD', rates)).toEqual({ total: 55, skipped: 0 });
  });
  test('empty list totals zero', () => {
    expect(calculateTotal([], 'USD', rates)).toEqual({ total: 0, skipped: 0 });
  });
  test('skips and counts expenses with missing rates', () => {
    const odd = [...expenses, { id: '4', description: 'X', amount: 5, currency: 'ZZZ', category: 'Other' }];
    expect(calculateTotal(odd, 'USD', rates)).toEqual({ total: 55, skipped: 1 });
  });
});

describe('filterByCategory', () => {
  test('returns only matching category', () => {
    expect(filterByCategory(expenses, 'Food')).toHaveLength(1);
  });
  test('"All" returns everything', () => {
    expect(filterByCategory(expenses, 'All')).toHaveLength(3);
  });
  test('unknown category returns empty array', () => {
    expect(filterByCategory(expenses, 'Travel')).toEqual([]);
  });
});