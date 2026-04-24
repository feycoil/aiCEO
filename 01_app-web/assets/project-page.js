/* aiCEO — Page projet v4 : intention hero + cockpit calme + drawer source */
(function(){
  const A = window.AICEO;

  A.renderProjectPage = function(projectId){
    const p = A.getProject(projectId);
    if (!p){
      document.getElementById("app-root").innerHTML = '<div style="padding:40px;text-align:center">Projet introuvable : ' + A.escHtml(projectId) + '</div>';
      return;
    }
    const g = A.getGroup(p.group);
    const gc = A.GROUP_COLOR[p.group];

    const allTasks = A.TASKS_ALL().filter(t => t.project === projectId);
    const open = allTasks.filter(t => !t.done);
    const done = allTasks.filter(t => t.done);
    const overdue = open.filter(t => t.due && A.daysUntil(t.due) < 0);
    const starred = open.filter(t => t.starred);
    const aiCapable = open.filter(t => t.aiCapable);
    const totalMin = open.reduce((a,t)=>a+(t.estimatedMin||0),0);

    const decisions = A.DECISIONS_ALL().filter(d => d.project === projectId);
    const decToExecute = decisions.filter(d => d.status === "to-execute");

    const events = (A.EVENTS||[]).filter(e => e.project === projectId && new Date(e.date) >= new Date()).sort((a,b)=>new Date(a.date)-new Date(b.date));

    let content = "";

    // Coach strip contextuel
    const coach = A.coachMessage({ overdue: overdue.length });
    content += `<div class="coach-strip" style="margin-bottom:16px"><span class="coach-dot">AI</span><span><em>Copilote ·</em> ${A.escHtml(coach)}</span></div>`;

    // Intention hero — teinté par la couleur de groupe
    content += `
      <div class="intention-hero" style="background:${gc.bg}">
        <div class="intention-hero-left">
          <div class="intention-hero-eyebrow" style="color:${gc.fg}">${g.icon} ${A.escHtml(g.name)} · ${p.icon} Projet</div>
          <h1 class="intention-hero-title">${A.escHtml(p.name)}</h1>
          <div class="intention-hero-sub">${A.escHtml(p.tagline)}</div>
          <div style="margin-top:12px;display:flex;gap:6px;flex-wrap:wrap">
            <span class="pill status ${p.status}">${p.status}</span>
            <span class="pill outline small">${p.progress}% progression</span>
            ${(p.companies||[]).map(c => `<span class="pill outline small">${A.escHtml(c)}</span>`).join("")}
          </div>
        </div>
        <div class="intention-hero-right">
          <button class="btn primary" onclick="AICEO.openQuickAdd({project:'${p.id}'})">+ Tâche</button>
        </div>
      </div>
      <div class="week-gauge" style="margin:-4px 0 18px">
        <div class="week-gauge-track"><div class="week-gauge-fill" style="width:${p.progress}%;background:${gc.accent}"></div></div>
      </div>
    `;

    // Cockpit 4 cartes — tonalité calme
    content += `
      <div class="grid-4" style="margin-bottom:18px">
        <div class="kpi tinted sky"><div class="kpi-label">Tâches ouvertes</div><div class="kpi-value tnum">${open.length}</div><div class="kpi-sub">${starred.length} étoilée${starred.length>1?'s':''}</div></div>
        <div class="kpi tinted amber"><div class="kpi-label">À rattraper</div><div class="kpi-value tnum">${overdue.length}</div><div class="kpi-sub">${overdue.length?"sans urgence":"tout à jour"}</div></div>
        <div class="kpi tinted violet"><div class="kpi-label">Charge</div><div class="kpi-value tnum">${A.formatMin(totalMin)}</div><div class="kpi-sub">restante</div></div>
        <div class="kpi tinted sage"><div class="kpi-label">Copilote IA</div><div class="kpi-value tnum">${aiCapable.length}</div><div class="kpi-sub">automatisables</div></div>
      </div>
    `;

    // Widget spécifique par groupe (inchangé fonctionnellement, tons adoucis)
    content += renderGroupWidget(p, g, allTasks, decisions, events, gc);

    // Décisions à exécuter — calme (amber)
    if (decToExecute.length){
      content += `
        <div class="card panel" style="margin-bottom:16px">
          <div class="card-header"><h3 class="card-title">Décisions à exécuter · ${decToExecute.length}</h3></div>
          ${decToExecute.map(d => {
            const src = A._sourceOfDecision(d);
            const overdueD = d.deadline && A.daysUntil(d.deadline) < 0;
            return `
              <div data-open-decision="${d.id}" role="button" tabindex="0" style="padding:10px 12px;border-radius:10px;background:var(--surface);margin-bottom:6px;cursor:pointer">
                <div style="display:flex;gap:8px;align-items:flex-start">
                  <div style="flex:1;min-width:0">
                    <div style="font-weight:600;font-size:13.5px">${A.escHtml(d.title)}</div>
                    <div class="small muted">${A.escHtml(d.outcome||"")}</div>
                    <div class="small" style="margin-top:4px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
                      ${d.deadline ? `<span style="${overdueD?'color:var(--amber-800);font-weight:600':''}">🎯 ${overdueD?"À rattraper · ":""}${A.formatDate(d.deadline)}</span>` : ""}
                      ${A.renderSourcePill(src)}
                    </div>
                  </div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `;
    }

    // Tâches + événements côte à côte
    content += `
      <div class="grid-2" style="margin-bottom:16px">
        <div class="card panel">
          <div class="card-header"><h3 class="card-title">Tâches ouvertes · ${open.length}</h3></div>
          ${open.length ? open.map(t => A.taskRow(t)).join("") : '<div class="empty small">Rien en cours — belle respiration.</div>'}
        </div>
        <div class="card panel">
          <div class="card-header"><h3 class="card-title">Prochains rdv · ${events.length}</h3></div>
          ${events.length ? events.slice(0,6).map(e => {
            const d = new Date(e.date);
            const srcPill = A.renderSourcePill({ type:"event", icon:"📅", detail:"Outlook", subject:e.title, href:`../agenda.html#${e.id}` });
            return `
              <div class="event-row" data-open-event="${e.id}" role="button" tabindex="0" style="cursor:pointer">
                <div class="event-time">${d.toLocaleDateString("fr-FR",{weekday:"short",day:"numeric"})}<br>${d.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</div>
                <div class="event-body">
                  <div class="event-title">${A.escHtml(e.title)}</div>
                  <div class="event-meta" style="display:flex;flex-wrap:wrap;gap:6px;align-items:center">
                    <span>⏱ ${A.formatMin(e.duration_min)}</span>
                    ${e.prep_needed?'<span style="color:var(--amber-800)">· 📋 prép.</span>':''}
                    ${srcPill}
                  </div>
                </div>
              </div>
            `;
          }).join("") : '<div class="empty small">Aucun RDV à venir</div>'}
        </div>
      </div>
    `;

    // Historique soldés (replié par défaut, ton calme)
    if (done.length){
      content += `
        <details class="card panel" style="margin-bottom:16px">
          <summary class="card-header" style="cursor:pointer;list-style:none">
            <h3 class="card-title" style="display:inline">✓ Soldées · ${done.length}</h3>
            <span class="card-sub" style="margin-left:auto">cliquer pour déplier</span>
          </summary>
          <div style="display:grid;gap:4px;margin-top:8px">
            ${done.map(t => `<div class="small" style="padding:6px 10px;background:var(--emerald-bg);border-radius:8px;color:var(--emerald-800)">✓ ${A.escHtml(t.title)}</div>`).join("")}
          </div>
        </details>
      `;
    }

    A.mount({ page:"projects", title: p.name, breadcrumb: `${g.name} · ${p.name}`, rel:"../", content });
  };

  // ========= Widget par groupe =========
  function renderGroupWidget(p, g, tasks, decisions, events, gc){
    if (g.id === "adabu"){
      return `
        <div class="card panel" style="margin-bottom:16px">
          <div class="card-header"><h3 class="card-title">🗺 Roadmap tech</h3></div>
          <div class="grid-3" style="margin-top:8px">
            <div style="padding:12px;background:var(--surface);border-radius:10px">
              <div class="nav-section-title" style="padding:0;margin:0 0 6px">Jalon en cours</div>
              <div style="font-weight:600;font-size:13px">${p.progress<50?'Cadrage':'Mise en œuvre'}</div>
              <div class="small muted">${p.progress}% parcouru</div>
            </div>
            <div style="padding:12px;background:var(--surface);border-radius:10px">
              <div class="nav-section-title" style="padding:0;margin:0 0 6px">KPI tech</div>
              <div style="font-weight:600;font-size:13px">SLA 99.5%</div>
              <div class="small muted">Supervision OK</div>
            </div>
            <div style="padding:12px;background:var(--surface);border-radius:10px">
              <div class="nav-section-title" style="padding:0;margin:0 0 6px">Prochain jalon</div>
              <div style="font-weight:600;font-size:13px">${events[0]?A.escHtml(events[0].title):'—'}</div>
              <div class="small muted">${events[0]?A.formatDate(events[0].date):''}</div>
            </div>
          </div>
        </div>
      `;
    }
    if (g.id === "amani"){
      return `
        <div class="card panel" style="margin-bottom:16px">
          <div class="card-header"><h3 class="card-title">🏗 Timeline chantier</h3></div>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:12px">
            ${["Cadrage","Structure","FF&E","Ouverture"].map((stage,i) => {
              const pct = [25,50,75,100][i];
              const reached = p.progress >= pct;
              const current = !reached && (i===0 || p.progress >= [0,25,50,75][i]);
              return `
                <div style="text-align:center;padding:12px;background:${current?gc.bg:reached?'var(--emerald-bg)':'var(--surface)'};border-radius:10px;border:${current?'2px solid '+gc.accent:'1px solid var(--border)'}">
                  <div style="font-size:18px">${reached?'✓':current?'●':'○'}</div>
                  <div style="font-size:12px;font-weight:600;margin-top:4px">${stage}</div>
                  <div class="small muted">${pct}%</div>
                </div>
              `;
            }).join("")}
          </div>
          <div style="margin-top:14px;padding:12px;background:var(--surface);border-radius:10px">
            <div class="nav-section-title" style="padding:0;margin:0 0 6px">Contraintes BREEAM</div>
            <div class="small">Matériaux locaux ≥ 40% · Certification en cours · Audit prévu T3 2026</div>
          </div>
        </div>
      `;
    }
    if (g.id === "terres-rouges"){
      const decsTotal = decisions.length;
      const decsOpen = decisions.filter(d => d.status === "to-execute").length;
      return `
        <div class="card panel" style="margin-bottom:16px">
          <div class="card-header"><h3 class="card-title">⚖︎ Tableau juridique & financier</h3></div>
          <div class="grid-3" style="margin-top:8px">
            <div style="padding:12px;background:var(--surface);border-radius:10px">
              <div class="nav-section-title" style="padding:0;margin:0 0 6px">Dossiers</div>
              <div style="font-weight:600;font-size:13px">${decsOpen} à pousser</div>
              <div class="small muted">${decsTotal} au total</div>
            </div>
            <div style="padding:12px;background:var(--surface);border-radius:10px">
              <div class="nav-section-title" style="padding:0;margin:0 0 6px">Exposition</div>
              <div style="font-weight:600;font-size:13px">${p.id==='honoraires'?'Trésorerie':'Patrimoine'}</div>
              <div class="small muted">${p.id==='honoraires'?'Flux 30/04':'Long terme'}</div>
            </div>
            <div style="padding:12px;background:var(--surface);border-radius:10px">
              <div class="nav-section-title" style="padding:0;margin:0 0 6px">Prochain rdv</div>
              <div style="font-weight:600;font-size:13px">${events[0]?A.escHtml(events[0].title):'—'}</div>
              <div class="small muted">${events[0]?A.formatDate(events[0].date):''}</div>
            </div>
          </div>
        </div>
      `;
    }
    return "";
  }
})();
