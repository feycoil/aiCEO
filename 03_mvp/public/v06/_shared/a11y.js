/* a11y.js — Focus trap modals + aria-labels auto + role wiring */
(function () {
  'use strict';
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  // ── Focus trap pour les modals (.aiceo-modal, .aiceo-modal-backdrop, .aiceo-cmdk-backdrop, .aiceo-confirm-backdrop) ──
  function setupFocusTrap() {
    const TRAPS = '.aiceo-modal-backdrop, .aiceo-cmdk-backdrop, .aiceo-confirm-backdrop';
    let lastFocused = null;

    new MutationObserver((mutations) => {
      mutations.forEach(m => {
        // Modal ouvert
        m.addedNodes.forEach(node => {
          if (node.nodeType !== 1) return;
          if (node.matches && node.matches(TRAPS)) {
            lastFocused = document.activeElement;
            const focusables = node.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusables.length) focusables[0].focus();
          }
        });
        // Modal fermé
        m.removedNodes.forEach(node => {
          if (node.nodeType !== 1) return;
          if (node.matches && node.matches(TRAPS)) {
            if (lastFocused && document.body.contains(lastFocused)) {
              try { lastFocused.focus(); } catch {}
            }
          }
        });
      });
    }).observe(document.body, { childList: true, subtree: false });

    // Trap Tab dans les modals ouverts
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const modal = document.querySelector(TRAPS);
      if (!modal) return;
      const focusables = modal.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  // ── Auto-aria-labels sur boutons icon-only ─────────────────────
  function autoAriaLabels() {
    const ICON_TO_LABEL = {
      'i-x': 'Fermer',
      'i-check': 'Valider',
      'i-edit': 'Modifier',
      'i-trash': 'Supprimer',
      'i-plus': 'Ajouter',
      'i-search': 'Rechercher',
      'i-bell': 'Notifications',
      'i-settings': 'Réglages',
      'i-more-h': 'Plus d\'options',
      'i-chevron-down': 'Déplier',
      'i-chevron-left': 'Précédent',
      'i-chevron-right': 'Suivant',
      'i-arrow-right': 'Continuer',
      'i-arrow-up-right': 'Ouvrir',
      'i-mic': 'Capter à la voix',
      'i-globe': 'Langue',
      'i-eye': 'Aperçu',
      'i-info': 'Information',
      'i-warning': 'Avertissement'
    };

    function scan() {
      $$('button, a').forEach(btn => {
        if (btn.getAttribute('aria-label')) return;
        const txt = (btn.textContent || '').trim();
        if (txt.length > 0) return; // a déjà du texte visible
        // Cherche l'icône SVG
        const useEl = btn.querySelector('svg use');
        if (!useEl) return;
        const href = useEl.getAttribute('href') || useEl.getAttribute('xlink:href') || '';
        const iconId = href.replace(/^#/, '');
        const label = ICON_TO_LABEL[iconId];
        if (label) btn.setAttribute('aria-label', label);
        else btn.setAttribute('aria-label', 'Action');
      });
    }
    scan();
    new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
  }

  // ── role/aria sur Cmd+K palette (combobox) ─────────────────────
  function enhanceCmdKPalette() {
    new MutationObserver(() => {
      const cmdk = document.querySelector('.aiceo-cmdk');
      if (!cmdk || cmdk.dataset.aiceoEnhanced) return;
      cmdk.dataset.aiceoEnhanced = '1';
      cmdk.setAttribute('role', 'dialog');
      cmdk.setAttribute('aria-modal', 'true');
      cmdk.setAttribute('aria-labelledby', 'aiceo-cmdk-title');
      const input = cmdk.querySelector('.aiceo-cmdk-input');
      if (input) {
        input.setAttribute('role', 'combobox');
        input.setAttribute('aria-autocomplete', 'list');
        input.setAttribute('aria-expanded', 'true');
        input.setAttribute('aria-controls', 'aiceo-cmdk-list');
      }
      const list = cmdk.querySelector('.aiceo-cmdk-list');
      if (list) {
        list.id = 'aiceo-cmdk-list';
        list.setAttribute('role', 'listbox');
      }
      cmdk.querySelectorAll('.aiceo-cmdk-item').forEach((item, idx) => {
        item.setAttribute('role', 'option');
        item.id = 'aiceo-cmdk-opt-' + idx;
      });
    }).observe(document.body, { childList: true, subtree: true });
  }

  // ── Skip-link "to content" amélioration (focus visible) ────────
  function enhanceSkipLink() {
    $$('.skip-link').forEach(link => {
      link.style.cssText += ';transition:transform .2s,opacity .2s';
      link.addEventListener('focus', () => link.style.transform = 'translateY(0)');
      link.addEventListener('blur', () => link.style.transform = 'translateY(-100%)');
    });
  }

  // ── Améliorer contrastes pages preview ────────────────────────
  function fixPreviewContrast() {
    const PREVIEW = ['connaissance', 'coaching'];
    if (!PREVIEW.includes(document.body.dataset.route || '')) return;
    // Réduire le filter qui peut casser le contraste WCAG
    const main = document.querySelector('main, .app-main');
    if (main) main.style.filter = 'opacity(0.85)'; // sans grayscale qui dégrade les contrastes
  }

  function init() {
    setupFocusTrap();
    autoAriaLabels();
    enhanceCmdKPalette();
    enhanceSkipLink();
    fixPreviewContrast();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
