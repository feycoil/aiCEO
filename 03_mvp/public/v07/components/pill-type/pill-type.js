// pill-type.js — pill type décision (Stratégique / Opérationnelle / Posture)
const TYPE_LABELS = {
  strategique: 'Stratégique',
  strategic: 'Stratégique',
  operationnelle: 'Opérationnelle',
  operationnel: 'Opérationnelle',
  operational: 'Opérationnelle',
  posture: 'Posture'
};

export default {
  mount(el, props = {}) {
    const label = el.querySelector('[data-region="pt-label"]');
    const raw = (props.type || props.label || '').toLowerCase().trim();
    const display = TYPE_LABELS[raw] || (props.type || props.label || 'Type');
    if (label) label.textContent = display;
    el.firstElementChild.dataset.type = raw;
  }
};
