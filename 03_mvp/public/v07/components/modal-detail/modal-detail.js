// modal-detail.js
function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

export default {
  mount(el, props = {}) {
    const root = el.querySelector('.md') || el.firstElementChild;
    if (!root) return;
    const close = () => { root.hidden = true; document.body.style.overflow = ''; };

    root.addEventListener('click', (e) => {
      if (e.target.matches('[data-action="close"]')) close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !root.hidden) close();
    });

    // API publique attachée à l'élément racine
    el.openWith = (data) => {
      const title = root.querySelector('[data-region="md-title"]');
      const body = root.querySelector('[data-region="md-body"]');
      const foot = root.querySelector('[data-region="md-foot"]');
      if (title) title.textContent = data.title || 'Détail';
      if (body) {
        const ctx = data.context || data.description || '';
        const meta = [];
        if (data.type) meta.push(`<dt>Type</dt><dd>${escapeHtml(data.type)}</dd>`);
        if (data.status) meta.push(`<dt>Statut</dt><dd>${escapeHtml(data.status)}</dd>`);
        if (data.created_at) meta.push(`<dt>Créée</dt><dd>${escapeHtml(new Date(data.created_at).toLocaleString('fr-FR'))}</dd>`);
        body.innerHTML = `
          ${meta.length ? `<dl class="md-meta">${meta.join('')}</dl>` : ''}
          ${ctx ? `<div class="md-context"><p>${escapeHtml(ctx).replace(/\n/g, '<br>')}</p></div>` : ''}
        `;
      }
      if (foot) {
        foot.innerHTML = `
          <button class="btn btn-sec" data-action="close">Fermer</button>
        `;
      }
      root.hidden = false;
      document.body.style.overflow = 'hidden';
    };

    // Listener global : decision:open propagé depuis card-decision
    document.addEventListener('decision:open', (e) => {
      if (e.detail && e.detail.decision) el.openWith(e.detail.decision);
    });
  }
};
