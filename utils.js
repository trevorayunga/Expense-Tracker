/**
 * Pure helper functions. No DOM, no network, no shared state.
 * `rates` is an object like { USD: 1, KES: 129.1, EUR: 0.92 } where every value
 * is expressed relative to the same base currency.
 */

/**
 * Convert an amount between two currencies using a rates table.
 * @returns {number|null} converted amount, or null if a rate is missing/invalid.
 */
export function convertAmount(amount, from, to, rates) {
  if (!rates || typeof amount !== 'number' || Number.isNaN(amount)) return null;
  const fromRate = rates[from];
  const toRate = rates[to];
  if (!fromRate || !toRate) return null; // missing, zero or undefined
  return (amount / fromRate) * toRate;
}

/**
 * Sum expenses in the home currency. Expenses that cannot be converted
 * (missing rate) are skipped and counted so the UI can warn the user.
 * @returns {{ total: number, skipped: number }}
 */
export function calculateTotal(expenses, homeCurrency, rates) {
  return expenses.reduce(
    (acc, expense) => {
      const converted = convertAmount(expense.amount, expense.currency, homeCurrency, rates);
      return converted === null
        ? { ...acc, skipped: acc.skipped + 1 }
        : { ...acc, total: acc.total + converted };
    },
    { total: 0, skipped: 0 }
  );
}

/** Filter by category; "All" (or empty) returns every expense. */
export function filterByCategory(expenses, category) {
  if (!category || category === 'All') return expenses;
  return expenses.filter((expense) => expense.category === category);
}

/** Format a number as money using Intl; falls back gracefully on bad codes. */
export function formatMoney(amount, currency) {
  try {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

/** Unique-enough id for client-side items. */
export function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}