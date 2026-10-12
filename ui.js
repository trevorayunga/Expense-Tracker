import { convertAmount, calculateTotal, filterByCategory, formatMoney } from './utils.js';

export const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Other'];
const $ = (id) => document.getElementById(id);

/** Fill a <select> with options (idempotent). */
export function populateSelect(select, values, selected) {
  select.replaceChildren(
    ...values.map((value) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      option.selected = value === selected;
      return option;
    })
  );
}

function renderStatus(state) {
  const banner = $('status');
  banner.className = `status status--${state.status}`;
  banner.hidden = state.status === 'idle' || state.status === 'ready';
  if (state.status === 'loading') banner.textContent = 'Loading live exchange rates…';
  if (state.status === 'error') {
    banner.textContent = `${state.error} Conversions are unavailable until rates load. `;
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.id = 'retry';
    retry.textContent = 'Retry';
    banner.append(retry);
  }
}

function renderList(state, handlers) {
  const list = $('expense-list');
  const visible = filterByCategory(state.expenses, state.filter);
  $('empty').hidden = visible.length > 0;

  list.replaceChildren(
    ...visible.map((expense) => {
      const converted = convertAmount(expense.amount, expense.currency, state.homeCurrency, state.rates);
      const li = document.createElement('li');
      li.className = 'expense';

      const info = document.createElement('div');
      const title = document.createElement('strong');
      title.textContent = expense.description;
      const meta = document.createElement('span');
      meta.className = 'meta';
      meta.textContent = expense.category;
      info.append(title, meta);

      const original = document.createElement('span');
      original.className = 'original';
      original.textContent = formatMoney(expense.amount, expense.currency);

      const home = document.createElement('span');
      home.className = 'converted';
      home.textContent = converted === null ? '—' : formatMoney(converted, state.homeCurrency);

      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'delete';
      del.textContent = 'Delete';
      del.setAttribute('aria-label', `Delete ${expense.description}`);
      del.addEventListener('click', () => handlers.onDelete(expense.id));

      li.append(info, original, home, del);
      return li;
    })
  );
}

function renderTotal(state) {
  const visible = filterByCategory(state.expenses, state.filter);
  const { total, skipped } = calculateTotal(visible, state.homeCurrency, state.rates);
  $('total').textContent = formatMoney(total, state.homeCurrency);
  $('total-warning').textContent =
    skipped > 0 ? `${skipped} expense(s) not included: no exchange rate available.` : '';
}

export function render(state, handlers) {
  renderStatus(state);
  renderList(state, handlers);
  renderTotal(state);
}