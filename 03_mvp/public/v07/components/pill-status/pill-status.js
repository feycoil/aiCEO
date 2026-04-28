// pill-status.js — pill status décision (ACTIVE / VALIDÉE / FROZEN / REPORTÉE / EPINGLEE)
const STATUS_MAP = {
  active:    { label: 'ACTIVE',     tone: 'active' },
  open:      { label: 'À TRANCHER', tone: 'warning' },
  pending:   { label: 'EN ATTENTE', tone: 'info' },
  decided:   { label: 'VALIDÉE',    tone: 'success' },
  validated: { label: 'VALIDÉE',    tone: 'success' },
  frozen:    { label: 'GELÉE',      tone: 'neutral' },
  gelee:     { label: 'GELÉE',      tone: 'neutral' },
  reportee:  { label: 'REPORTÉE',   tone: 'rare' },
  reported:  { label: 'REPORTÉE',   tone: 'rare' },
  pinned:    { label: 'ÉPINGLÉE',   tone: 'pinned' },
  epinglee:  { label: 'ÉPINGLÉE',   tone: 'pinned' }
};

export default {
  mount(el, props = {}) {
    const raw = (props.status || props.value || '').toLowerCase().trim();
    const m = STATUS_MAP[raw] || { label: (props.label || raw || 'STATUS').toUpperCase(), tone: 'neutral' };
    const label = el.querySelector('[data-region="ps-label"]');
    if (label) label.textContent = m.label;
    el.firstElementChild.dataset.tone = m.tone;
  }
};
