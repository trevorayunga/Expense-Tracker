import { fetchRates } from './api.js';
import * as store from './state.js';
import { render, populateSelect, CATEGORIES } from './ui.js';

const COMMON_CURRENCIES = ['KES', 'USD', 'EUR', 'GBP', 'JPY', 'INR', 'ZAR', 'NGN', 'CAD', 'AUD'];
const $ = (id) => document.getElementById(id);

async function loadRates() {
  store.setLoading();
  try {
    const rates = await fetchRates(store.getState().homeCurrency);
    store.setRates(rates);
  } catch (err) {
    store.setError(err.message);
  }
}

const handlers = { onDelete: store.removeExpense };

function init() {
  const { homeCurrency } = store.getState();
  populateSelect($('currency'), COMMON_CURRENCIES, 'USD');
  populateSelect($('category'), CATEGORIES, CATEGORIES[0]);
  populateSelect($('home-currency'), COMMON_CURRENCIES, homeCurrency);
  populateSelect($('filter'), ['All', ...CATEGORIES], 'All');

  store.subscribe((state) => render(state, handlers));

  $('expense-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const amount = parseFloat($('amount').value);
    const description = $('description').value.trim();
    if (!description || !Number.isFinite(amount) || amount <= 0) return;
    store.addExpense({
      description,
      amount,
      currency: $('currency').value,
      category: $('category').value
    });
    event.target.reset();
    $('description').focus();
  });

  $('filter').addEventListener('change', (e) => store.setFilter(e.target.value));
  $('home-currency').addEventListener('change', (e) => {
    store.setHomeCurrency(e.target.value);
    loadRates();
  });
  $('status').addEventListener('click', (e) => {
    if (e.target.id === 'retry') loadRates();
  });

  render(store.getState(), handlers);
  loadRates();
}

init();