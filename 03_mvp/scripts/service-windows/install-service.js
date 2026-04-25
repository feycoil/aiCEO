/**
 * scripts/service-windows/install-service.js — POC node-windows (S3.10).
 *
 * Time-box 1,5 j strict. Ce code est un POC, pas un livrable de production :
 * il est exerce pour valider la faisabilite d'un service Windows pour le serveur
 * aiCEO en S5 (cutover). Ne pas activer en production sans revue ADR.
 *
 * Usage (Windows, droits admin) :
 *
 *   npm install --no-save node-windows
 *   node scripts/service-windows/install-service.js install
 *   node scripts/service-windows/install-service.js start
 *   node scripts/service-windows/install-service.js stop
 *   node scripts/service-windows/install-service.js uninstall
 *
 * Limites connues du POC :
 *   - Necessite droits admin Windows pour install/uninstall.
 *   - Service tourne sous LocalSystem par defaut. Acces COM Outlook
 *     non garanti dans ce contexte (a tester en S5).
 *   - Logs vont dans daemon\aiCEO.{out,err,wrapper}.log dans le repertoire
 *     du service (cf. node-windows doc).
 *   - Pas teste sur Windows Server 2019 (env CEO en cours).
 */
const path = require('node:path');
const action = process.argv[2] || 'help';

const scriptPath = path.resolve(__dirname, '..', '..', 'server.js');
const cwd = path.resolve(__dirname, '..', '..');

let Service;
try {
  Service = require('node-windows').Service;
} catch (e) {
  console.error('[install-service] node-windows non installé. Lance : npm install --no-save node-windows');
  process.exit(1);
}

const svc = new Service({
  name: 'aiCEO',
  description: 'aiCEO copilote executif — serveur local Node + SQLite (port 3001 par defaut).',
  script: scriptPath,
  workingDirectory: cwd,
  nodeOptions: ['--enable-source-maps'],
  env: [
    { name: 'NODE_ENV', value: 'production' },
    { name: 'PORT', value: process.env.PORT || '3001' },
  ],
});

svc.on('install', () => {
  console.log('[install-service] service installe. Demarrage...');
  svc.start();
});
svc.on('start', () => console.log('[install-service] service demarre.'));
svc.on('stop', () => console.log('[install-service] service arrete.'));
svc.on('uninstall', () => console.log('[install-service] service desinstalle.'));
svc.on('error', (e) => console.error('[install-service] erreur :', e));

switch (action) {
  case 'install':
    svc.install();
    break;
  case 'start':
    svc.start();
    break;
  case 'stop':
    svc.stop();
    break;
  case 'uninstall':
    svc.uninstall();
    break;
  case 'status':
    console.log('[install-service] status check non implemente (cf. sc query aiCEO).');
    break;
  default:
    console.log('Usage: node scripts/service-windows/install-service.js {install|start|stop|uninstall|status}');
    process.exit(0);
}
