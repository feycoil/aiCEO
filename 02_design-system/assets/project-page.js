/* aiCEO Platform — Project detail page renderer
   Takes a project id, renders the full detail view.
*/

(function() {
  const A = window.AICEO;

  A.renderProjectPage = function(projectId) {
    const p = (A.PROJECTS || []).find(x => x.id === projectId);
    if (!p) {
      document.getElementById("app-root").innerHTML = `<p style="padding:40px">Projet introuvable : ${projectId}</p>`;
      return;
    }
    const tasks = A.getTasks().filter(t => t.project === projectId);
    const openTasks = tasks.filter(t => !t.done);
    const doneTasks = tasks.filter(t => t.done);
    const decisions = (A.DECISIONS || []).filter(d => d.project === projectId);
    const events = (A.EVENTS || []).filter(e => e.project === projectId).filter(e => new Date(e.end) >= new Date(new Date().getTime() - 24*3600*1000));
    const c = A.PROJECT_COLOR[p.color] || A.PROJECT_COLOR.indigo;

    const headerBg = `linear-gradient(135deg, ${c.bg} 0%, #ffffff 100%)`;

    let content = "";

    // Hero
    content += `
      <div class="card" style="background:${headerBg};border-color:${c.bg};padding:28px;margin-bottom:20px">
        <div style="display:flex;gap:16px;align-items:flex-start">
          <div class="project-icon" style="background:white;color:${c.fg};width:56px;height:56px;font-size:28px;box-shadow:var(--shadow-sm)">${p.icon}</div>
          <div style="flex:1;min-width:0">
            <div class="row" style="margin-bottom:4px">
              ${A.statusBadge(p.status)}
              ${A.companyChips(p.companies)}
            </div>
            <h1 class="page-title" style="margin-bottom:4px">${A.escHtml(p.name)}</h1>
            <div class="page-subtitle">${A.escHtml(p.phase)} · Jalon : ${A.escHtml(p.milestone)} · Porteur : ${A.escHtml(p.owner)}</div>
            <p style="margin:12px 0 0;color:var(--text-2);line-height:1.6">${A.escHtml(p.description)}</p>
          </div>
        </div>
      </div>`;

    // KPI row
    content += `
      <div class="grid grid-4" style="margin-bottom:20px">
        <div class="kpi indigo"><div class="kpi-accent"></div><div class="kpi-label">Tâches ouvertes</div><div class="kpi-value">${openTasks.length}</div></div>
        <div class="kpi rose"><div class="kpi-accent"></div><div class="kpi-label">En retard</div><div class="kpi-value">${openTasks.filter(t => t.overdue).length}</div></div>
        <div class="kpi emerald"><div class="kpi-accent"></div><div class="kpi-label">Décisions actées</div><div class="kpi-value">${decisions.length}</div></div>
        <div class="kpi amber"><div class="kpi-accent"></div><div class="kpi-label">Progression</div><div class="kpi-value">${p.kpi.progress}%</div><div style="margin-top:6px"><div class="progress"><div class="progress-fill" style="width:${p.kpi.progress}%"></div></div></div></div>
      </div>`;

    // Two-column: tasks + events/workstreams
    content += `
      <div class="grid grid-2" style="margin-bottom:20px">
        <div class="card">
          <div class="card-head">
            <h3 class="card-title">📋 Tâches ouvertes (${openTasks.length})</h3>
            <a href="../taches.html?project=${p.id}" class="btn ghost tiny">Tout voir →</a>
          </div>
          <div class="stack" style="gap:2px">
            ${openTasks.length === 0 ? '<p class="muted small">Aucune tâche ouverte.</p>' : openTasks.map(t => A.taskRow(t, { rel:"../" })).join("")}
          </div>
          ${doneTasks.length > 0 ? `
            <details style="margin-top:16px">
              <summary class="small muted" style="cursor:pointer">${doneTasks.length} tâche${doneTasks.length>1?"s":""} terminée${doneTasks.length>1?"s":""}</summary>
              <div class="stack" style="gap:2px;margin-top:8px">
                ${doneTasks.map(t => A.taskRow(t, { rel:"../" })).join("")}
              </div>
            </details>` : ""}
        </div>

        <div class="card">
          <div class="card-head">
            <h3 class="card-title">🗂️ Workstreams (${(p.workstreams||[]).length})</h3>
          </div>
          <div class="stack-md">
            ${(p.workstreams || []).map(ws => `
              <div>
                <div class="small strong" style="margin-bottom:6px">${A.escHtml(ws.name)}</div>
                <ul style="margin:0;padding-left:18px;font-size:12.5px;color:var(--text-2);line-height:1.7">
                  ${ws.items.map(i => `<li>${A.escHtml(i)}</li>`).join("")}
                </ul>
              </div>
            `).join("")}
          </div>
        </div>
      </div>`;

    // Events + Decisions
    content += `
      <div class="grid grid-2" style="margin-bottom:20px">
        <div class="card">
          <div class="card-head">
            <h3 class="card-title">📅 Événements à venir (${events.length})</h3>
            <a href="../agenda.html?project=${p.id}" class="btn ghost tiny">Agenda projet →</a>
          </div>
          <div class="stack" style="gap:4px">
            ${events.length === 0 ? '<p class="muted small">Aucun événement agenda à venir.</p>' : events.slice(0,6).map(e => `
              <div style="display:flex;gap:10px;padding:8px;border-radius:8px;align-items:flex-start">
                <div style="flex-shrink:0;text-align:center;background:var(--surface-2);padding:6px 8px;border-radius:8px;min-width:60px">
                  <div class="tiny muted strong" style="text-transform:uppercase">${["dim","lun","mar","mer","jeu","ven","sam"][new Date(e.start).getDay()]}</div>
                  <div style="font-size:18px;font-weight:700">${new Date(e.start).getDate()}</div>
                  <div class="tiny muted" style="font-variant-numeric:tabular-nums">${e.allDay?"—":A.fmtTime(e.start)}</div>
                </div>
                <div style="flex:1;min-width:0">
                  <div class="small strong" style="line-height:1.35">${A.escHtml(e.subject)}</div>
                  <div class="tiny muted">${e.teams?"Teams · ":""}${e.organizer?`Organisé par ${A.escHtml(e.organizer.split('@')[0])}`:""}</div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

        <div class="card">
          <div class="card-head">
            <h3 class="card-title">✅ Décisions actées (${decisions.length})</h3>
            <a href="../decisions.html?project=${p.id}" class="btn ghost tiny">Toutes →</a>
          </div>
          <div class="stack" style="gap:6px">
            ${decisions.length === 0 ? '<p class="muted small">Aucune décision actée pour le moment.</p>' : decisions.slice().reverse().slice(0,6).map(d => `
              <div class="decision">
                <div class="decision-head">
                  <div class="decision-title">${A.escHtml(d.title)}</div>
                  <div class="decision-date">${A.fmtDate(d.date)}</div>
                </div>
                <div class="decision-meta"><span class="parties">${A.escHtml(d.parties||"—")}</span>${d.note?` · ${A.escHtml(d.note)}`:""}</div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>`;

    // Contacts + Review link
    content += `
      <div class="grid grid-2">
        <div class="card">
          <div class="card-head">
            <h3 class="card-title">👥 Contacts clés (${(p.contacts||[]).length})</h3>
          </div>
          <table class="tbl">
            <thead><tr><th>Nom</th><th>Rôle</th><th>Organisation</th></tr></thead>
            <tbody>
              ${(p.contacts||[]).map(ct => `
                <tr>
                  <td class="strong">${A.escHtml(ct.name)}${ct.email?` <a href="mailto:${A.escHtml(ct.email)}" class="tiny">✉</a>`:""}</td>
                  <td class="small muted">${A.escHtml(ct.role)}</td>
                  <td class="small muted">${A.escHtml(ct.org)}</td>
                </tr>`).join("")}
            </tbody>
          </table>
        </div>

        <div class="card">
          <div class="card-head">
            <h3 class="card-title">🗓️ Dernières revues hebdo</h3>
          </div>
          <div class="stack" style="gap:6px">
            ${(A.REVIEWS||[]).map(r => `
              <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border:1px solid var(--border);border-radius:10px">
                <div>
                  <div class="small strong">${r.iso} · ${A.escHtml(r.dateRange)}</div>
                  <div class="tiny muted">${r.status==="current"?"Semaine en cours":"Archivée"} · ${r.progress}%</div>
                </div>
                <div class="row">
                  <a href="../${r.mdPath}" class="btn tiny">Markdown</a>
                  <a href="../${r.widgetPath}" class="btn primary tiny">Widget</a>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>`;

    A.mount({
      page: "projects",
      title: p.name,
      breadcrumb: [
        { label:"Projets", href:"../projets.html" },
        { label:p.name.split("—")[0].trim() }
      ],
      rel: "../",
      content,
    });
  };
})();
