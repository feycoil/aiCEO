// toast.js — Toast feedback standardise (S6.30)
// Usage : import { showToast } from '../shared/toast.js';
//         showToast('Message', 'success'); // success | error | warning | info

export function showToast(message, kind = 'info', durationMs = 3000) {
  const div = document.createElement('div');
  div.className = 'toast is-' + kind;
  div.textContent = message;
  document.body.appendChild(div);
  // Force reflow then animate in
  // eslint-disable-next-line no-unused-expressions
  div.offsetHeight;
  div.classList.add('is-visible');
  setTimeout(() => {
    div.classList.remove('is-visible');
    setTimeout(() => div.remove(), 300);
  }, durationMs);
}
