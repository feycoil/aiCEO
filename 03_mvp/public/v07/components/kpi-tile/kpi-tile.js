// kpi-tile.js
export default {
  mount(el, props = {}) {
    const label = el.querySelector('[data-region="kt-label"]');
    const value = el.querySelector('[data-region="kt-value"]');
    const trend = el.querySelector('[data-region="kt-trend"]');
    if (label) label.textContent = props.label || '';
    if (value) value.textContent = (props.value !== undefined && props.value !== null) ? String(props.value) : '—';
    if (trend && props.trend) {
      trend.textContent = props.trend;
      trend.hidden = false;
      trend.dataset.dir = props.trendDir || 'flat';
    }
    if (props.tone) el.firstElementChild.dataset.tone = props.tone;
  }
};
