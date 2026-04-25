# ADR S3.10 — Spike Service Windows (template à remplir au issue du POC)

> Template à insérer en tête de `00_BOUSSOLE/DECISIONS.md` SI le POC `node-windows` ouvre une question structurelle (sinon, pas d'ADR — silencieux = OK).

## YYYY-MM-DD · S3.10 — Spike Service Windows : POC node-windows [VERT|ROUGE]

**Contexte** : Sprint S3 a réservé 1,5 j de time-box strict pour évaluer node-windows comme wrapper service Windows pour `server.js` (cible S5 cutover). Le POC a été exécuté sur le poste CEO Windows en mode admin avec `npm install --no-save node-windows && node scripts/service-windows/install-service.js install`.

**Résultat POC** :

- [ ] Install OK
- [ ] `sc query aiCEO` → `RUNNING`
- [ ] `curl http://localhost:3001/api/health` 200 sans terminal
- [ ] Reboot → redémarrage auto
- [ ] Outlook COM accessible depuis le contexte service (LocalSystem ou compte CEO)
- [ ] Uninstall propre

**Décision** :

[ ] **Variante A — node-windows retenu pour S5** : POC vert, on parts sur cette base. S5 ajoute rotation logs winston + scripts `update.cmd` / `run-as-admin.cmd`.

[ ] **Variante B — Pivot NSSM** : node-windows pose des problèmes (LocalSystem incompatible Outlook COM, ou crashes inattendus). NSSM (Non-Sucking Service Manager) est plus simple, lance `node server.js` comme service avec compte interactif CEO.

[ ] **Variante C — Scheduled Task au boot** : pas de service mais une tâche Windows `schtasks /create aiCEO-Server /sc ONSTART /ru CEO /it`. Plus simple, moins robuste pour les redémarrages, OK pour le dogfood pré-V1.

[ ] **Variante D — Docker Desktop** : containeriser le serveur dans Docker Desktop avec auto-start. Lourd pour un poste CEO, à reconsidérer si on déploie chez plusieurs utilisateurs.

**Conséquences** :

- (à remplir selon variante)

**Sources** : `03_mvp/scripts/service-windows/README-service.md`, output de l'install POC, `04_docs/DOSSIER-SPRINT-S3.md` §3 (S3.10) §5.5.
