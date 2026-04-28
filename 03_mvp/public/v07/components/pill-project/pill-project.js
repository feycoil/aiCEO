// pill-project.js — pill projet avec dot couleur
// Couleur dérivée déterministe du nom (hash → palette) si pas de couleur fournie.
const PALETTE = ['#2d7a4d', '#b8842b', '#2c6c9e', '#8a3d8a', '#6b4dff', '#c14a4a'];

function hashCode(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export default {
  mount(el, props = {}) {
    const dot = el.querySelector('[data-region="pp-dot"]');
    const label = el.querySelector('[data-region="pp-label"]');
    const name = props.name || props.label || 'Projet';
    if (label) label.textContent = name;
    if (dot) {
      const color = props.color || PALETTE[hashCode(name) % PALETTE.length];
      dot.style.background = color;
    }
  }
};
