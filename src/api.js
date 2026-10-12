const BASE_URL = 'https://open.er-api.com/v6/latest';

/**
 * Fetch live exchange rates for a base currency.
 * Throws an Error with a human-readable message on any failure.
 * @returns {Promise<Object<string, number>>} rates relative to `base`
 */
export async function fetchRates(base = 'USD') {
  let response;
  try {
    response = await fetch(`${BASE_URL}/${encodeURIComponent(base)}`);
  } catch {
    throw new Error('Network error: could not reach the exchange rate service.');
  }

  if (!response.ok) {
    throw new Error(`Exchange rate service returned an error (HTTP ${response.status}).`);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Exchange rate service returned an unreadable response.');
  }

  if (data.result !== 'success' || !data.rates) {
    throw new Error('Exchange rate service did not return valid rates.');
  }
  return data.rates;
}