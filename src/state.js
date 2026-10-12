import { generateId } from './utils.js';

let state = {
  expenses: [],
  filter: 'All',
  homeCurrency: 'KES',
  rates: null,
  status: 'idle', // idle | loading | ready | error
  error: null
};

const listeners = [];

export const getState = () => state;

export function subscribe(listener) {
  listeners.push(listener);
}

/** Replace state immutably and notify subscribers. */
function setState(patch) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener(state));
}

export function addExpense({ description, amount, currency, category }) {
  const newExpense = { id: generateId(), description, amount, currency, category };
  setState({ expenses: [...state.expenses, newExpense] });
}

export function removeExpense(id) {
  setState({ expenses: state.expenses.filter((e) => e.id !== id) });
}

export function updateCategory(id, newCategory) {
  setState({
    expenses: state.expenses.map((e) => (e.id === id ? { ...e, category: newCategory } : e))
  });
}

export const setFilter = (filter) => setState({ filter });
export const setHomeCurrency = (homeCurrency) => setState({ homeCurrency });
export const setLoading = () => setState({ status: 'loading', error: null });
export const setRates = (rates) => setState({ rates, status: 'ready', error: null });
export const setError = (message) => setState({ status: 'error', error: message });