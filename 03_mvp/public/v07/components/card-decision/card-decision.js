// card-decision.js — refonte parite Claude Design + S6.12 (kind dispatch)
import { ComponentLoader } from '../../shared/component-loader.js';

const STATUS_RAIL_TONE = {
  active: 'active',
  open: 'warning',
  pending: 'info',
  decided: 'success',
  validated: 'success',
  frozen: 'neutral',
  gelee: 'neutral',
  reportee: 'rare',
  reported: 'rare'
};

function fmtDay(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  if (sameDay) return "Aujourd'hui";
  const yesterday = new Date(today.getTime() - 86400000);
  if (d.toDateString() === yesterday.toDateString()) return 'Hier';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}
function fmtHM(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}
function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
function escapeJsonAttr(s) {
  return String(s).replace(/'/g, '&#39;');
}

export default {
  mount(el, props = {}) {
    const root = el.querySelector('[data-region="cd-root"]') || el.firstElementChild;
    const status = (props.status || 'active').toLowerCase();
    const tone = STATUS_RAIL_TONE[status] || 'neutral';
    if (root) root.dataset.tone = tone;
    // S6.29 : auto-wire modal-detail sur la card root si props.id present.
    // Si props.kind defini (project/task/event/review/big-rock/info), respecte-le.
    if (root && props.id) {
      if (props.kind === 'project') {
        root.style.cursor = 'pointer';
        root.dataset.projectId = props.id;
        root.addEventListener('click', function(ev) {
          if (ev.target.closest('a, button[data-action], [data-no-md]')) return;
          window.location.href = 'projet.html?id=' + encodeURIComponent(props.id);
        });
      } else {
        root.dataset.mdKind = props.kind || 'decision';
        root.dataset.mdId = props.id;
        root.style.cursor = 'pointer';
      }
    }

    const timeEl = el.querySelector('[data-region="cd-time"]');
    if (timeEl) {
      const day = timeEl.querySelector('.cd-time-day');
      const hm = timeEl.querySelector('.cd-time-hm');
      const iso = props.created_at || props.date || props.updated_at;
      if (day) day.textContent = fmtDay(iso);
      if (hm) hm.textContent = fmtHM(iso);
    }

    const metaEl = el.querySelector('[data-region="cd-meta"]');
    if (metaEl) {
      const parts = [];
      // S6.39 : axes (domaine + societe) en premier sur les cards projet
      if (props.kind === 'project' && props.domain_label) {
        const dc = props.domain_color || '#7C3AED';
        parts.push('<span class="cd-axis-chip" style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:11px;background:' + dc + '22;color:' + dc + ';font-size:11px;font-weight:600;border:1px solid ' + dc + '40">' + (props.domain_icon || '\u25CB') + ' ' + escapeHtml(props.domain_label) + '</span>');
      }
      if (props.kind === 'project' && props.company_label) {
        const cc = props.company_color || '#0F172A';
        parts.push('<span class="cd-axis-chip" style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:11px;background:' + cc + '15;color:' + cc + ';font-size:11px;font-weight:600;border:1px solid ' + cc + '30">' + (props.company_icon || '\ud83c\udfe2') + ' ' + escapeHtml(props.company_label) + '</span>');
      }
      if (props.project || props.project_name) {
        const projectName = props.project_name || props.project;
        parts.push(`<div data-component="pill-project" data-props='${escapeJsonAttr(JSON.stringify({ name: projectName, color: props.project_color }))}'></div>`);
      }
      if (props.type) {
        parts.push(`<div data-component="pill-type" data-props='${escapeJsonAttr(JSON.stringify({ type: props.type }))}'></div>`);
      }
      parts.push(`<div data-component="pill-status" data-props='${escapeJsonAttr(JSON.stringify({ status }))}'></div>`);
      if (props.pinned) {
        parts.push(`<div data-component="pill-status" data-props='${escapeJsonAttr(JSON.stringify({ status: 'pinned' }))}'></div>`);
      }
      metaEl.innerHTML = parts.join('');
      ComponentLoader.refresh(metaEl);
    }

    const title = el.querySelector('[data-region="cd-title"]');
    if (title) title.textContent = props.title || '(sans titre)';

    const ctx = el.querySelector('[data-region="cd-context"]');
    if (ctx) {
      const text = props.context || props.description || '';
      const safe = escapeHtml(text).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      ctx.innerHTML = safe;
      ctx.hidden = !text;
    }

    const grid = el.querySelector('[data-region="cd-grid"]');
    if (grid) {
      const isPositive = ['decided', 'validated'].includes(status);
      const slotA = props.slot_a || (isPositive
        ? { label: 'VALIDEE', value: props.validated_count || '' }
        : { label: 'EFFET PROJETE', value: props.effect || props.expected_effect || '' });
      const slotB = props.slot_b || (isPositive
        ? { label: 'RISQUE RESIDUEL', value: props.residual_risk || '' }
        : { label: 'A REVISITER', value: props.revisit || props.review_when || '' });
      const slots = [slotA, slotB].filter(s => s && s.value);
      grid.innerHTML = slots.map(s => `
        <div class="cd-slot">
          <div class="cd-slot-label">${escapeHtml(s.label)}</div>
          <div class="cd-slot-value">${escapeHtml(s.value)}</div>
        </div>
      `).join('');
      grid.hidden = slots.length === 0;
    }

    const src = el.querySelector('[data-region="cd-source"]');
    if (src) {
      if (props.source) {
        src.innerHTML = `Source : <a href="#" class="cd-source-link">${escapeHtml(props.source)}</a>`;
      } else if (props.source_label) {
        src.textContent = `Source : ${props.source_label}`;
      } else {
        const iso = props.created_at || props.date || '';
        if (iso) {
          const d = new Date(iso);
          if (!isNaN(d.getTime())) {
            src.textContent = `Posee le ${d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}`;
          } else {
            src.textContent = 'Source : decision interne';
          }
        } else {
          src.textContent = 'Source : decision interne';
        }
      }
    }

    const aiLink = el.querySelector('[data-region="cd-ai-link"]');
    if (aiLink) {
      // S6.31 : sur decisions ouvertes/reportees, transformer le lien en bouton "Recommander avec Claude"
      const isOpenDec = props.kind === 'decision' && ['active', 'open', 'ouverte', 'pending', 'reportee'].includes(status);
      const isOpenGeneric = ['active', 'open', 'pending'].includes(status);
      if (isOpenDec && props.id) {
        aiLink.hidden = false;
        aiLink.href = '#';
        aiLink.dataset.action = 'recommend-decision';
        aiLink.dataset.decisionId = props.id;
        aiLink.classList.add('cd-recommend');
        var span = aiLink.querySelector('span');
        if (span) span.textContent = 'Recommander avec Claude';
      } else if (isOpenGeneric && props.id) {
        aiLink.hidden = false;
        var titleParam = props.title ? '&title=' + encodeURIComponent(props.title) : '';
        aiLink.href = 'assistant.html?context=' + (props.kind || 'decision') + ':' + encodeURIComponent(props.id) + titleParam;
      } else {
        aiLink.hidden = true;
      }
    }

    const btn = el.querySelector('[data-action="open"]');
    if (btn) {
      // S6.12 : kind dispatch (project/contact/task/event/review/decision par defaut)
      const kind = props.kind || 'decision';
      btn.addEventListener('click', () => {
        const detail = { id: props.id };
        detail[kind] = props;
        el.dispatchEvent(new CustomEvent(kind + ':open', {
          bubbles: true,
          detail: detail
        }));
      });
    }
  }
};
