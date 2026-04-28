// card-decision.js
const STATUS_LABELS = {
  open: 'À trancher',
  pending: 'En attente',
  decided: 'Tranchée',
  frozen: 'Gelée',
  reportee: 'Reportée'
};
const STATUS_TONES = {
  open: 'warning',
  pending: 'info',
  decided: 'success',
  frozen: 'neutral',
  reportee: 'rare'
};

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

export default {
  mount(el, props = {}) {
    const status = (props.status || 'open').toLowerCase();
    const statusEl = el.querySelector('[data-region="cd-status"]');
    if (statusEl) {
      statusEl.textContent = STATUS_LABELS[status] || status;
      statusEl.classList.add(`pill-${STATUS_TONES[status] || 'neutral'}`);
    }
    const dateEl = el.querySelector('[data-region="cd-date"]');
    if (dateEl) dateEl.textContent = fmtDate(props.created_at || props.date);

    const title = el.querySelector('[data-region="cd-title"]');
    if (title) title.textContent = props.title || '(sans titre)';

    const ctx = el.querySelector('[data-region="cd-context"]');
    if (ctx) {
      const text = props.context || props.description || '';
      ctx.innerHTML = escapeHtml(text).slice(0, 280) + (text.length > 280 ? '…' : '');
      ctx.hidden = !text;
    }

    const meta = el.querySelector('[data-region="cd-meta"]');
    if (meta) {
      const bits = [];
      if (props.type) bits.push(props.type);
      if (props.project) bits.push(props.project);
      meta.textContent = bits.join(' · ');
    }

    const btn = el.querySelector('[data-action="open"]');
    if (btn) {
      btn.addEventListener('click', () => {
        el.dispatchEvent(new CustomEvent('decision:open', {
          bubbles: true,
          detail: { id: props.id, decision: props }
        }));
      });
    }
  }
};
