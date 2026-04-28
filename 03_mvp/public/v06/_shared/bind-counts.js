/* bind-counts.js — Auto-câblage générique des counts dynamiques (S6.8 PoC)
 *
 * Pattern : tout élément avec attribut `data-count="route:field"` reçoit
 * automatiquement la valeur du fetch API au chargement.
 *
 * Exemples d'usage HTML :
 *   <span data-count="/api/decisions/stats:count_open">12</span>
 *   <span data-count="/api/contacts:length">14</span>
 *   <span data-count="/api/tasks?filter=today:length">3</span>
 *
 * Le contenu HTML actuel (12, 14, 3) sert de fallback démo si l'API échoue
 * ou est absente. Pas de breaking change : si le data-count est absent,
 * la valeur démo reste affichée.
 *
 * S6.8 — pattern générique réutilisable, complète bind-cockpit.js, bind-decisions.js, etc.
 */
(function () {
  'use strict';

  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /**
   * Lit un sous-champ depuis un objet JSON via dot-notation.
   * extractField({ count_open: 12 }, 'count_open') → 12
   * extractField([1,2,3], 'length') → 3
   * extractField({ a: { b: 5 } }, 'a.b') → 5
   */
  function extractField(data, fieldPath) {
    if (!fieldPath) return data;
    if (fieldPath === 'length' && Array.isArray(data)) return data.length;
    if (fieldPath === 'length' && data && typeof data === 'object' && Array.isArray(data.items)) return data.items.length;
    var parts = fieldPath.split('.');
    var cur = data;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return null;
      cur = cur[parts[i]];
    }
    return cur;
  }

  async function fetchAndUpdate(els) {
    // Regrouper par route pour éviter les fetch répétés
    var byRoute = {};
    els.forEach(function (el) {
      var spec = el.getAttribute('data-count');
      if (!spec) return;
      var parts = spec.split(':');
      var route = parts[0];
      var field = parts[1] || 'length';
      if (!byRoute[route]) byRoute[route] = [];
      byRoute[route].push({ el: el, field: field });
    });

    Object.keys(byRoute).forEach(function (route) {
      fetch(route, { headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (data) {
          byRoute[route].forEach(function (entry) {
            var val = extractField(data, entry.field);
            if (val != null && val !== undefined) {
              entry.el.textContent = String(val);
              entry.el.setAttribute('data-count-loaded', '1');
            }
          });
        })
        .catch(function (e) {
          // Silencieux : on garde la valeur démo en place
          if (window.DEBUG_AICEO) console.warn('[bind-counts] fetch fail for', route, e.message);
        });
    });
  }

  function init() {
    var els = $$('[data-count]');
    if (els.length === 0) return;
    if (window.DEBUG_AICEO) console.log('[bind-counts] auto-câblage de', els.length, 'éléments');
    fetchAndUpdate(els);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
