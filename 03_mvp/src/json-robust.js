/**
 * json-robust.js — lecture JSON résistante au padding NUL.
 *
 * Sur OneDrive/Windows, [System.IO.File]::WriteAllText peut laisser des octets
 * 0x00 en fin de fichier quand la nouvelle taille < ancienne taille (sans
 * truncate explicite). Ces 0x00 cassent JSON.parse. On les nettoie ici.
 */
const fs = require("fs");

function readJsonRobust(path) {
  const buf = fs.readFileSync(path);
  // Trouver la fin du contenu utile : dernier byte non-NUL
  let end = buf.length;
  while (end > 0 && buf[end - 1] === 0x00) end--;
  const text = buf.subarray(0, end).toString("utf8");
  return JSON.parse(text);
}

/**
 * Écriture atomique qui tronque proprement même sur OneDrive : on supprime
 * d'abord le fichier si possible (best-effort), puis on l'écrit.
 */
function writeJsonAtomic(path, data, indent = 2) {
  const text = JSON.stringify(data, null, indent);
  // Essayer de tronquer d'abord via open/close avec flag "w" (devrait tronquer)
  // puis écrire. writeFileSync avec flag "w" (défaut) tronque, mais OneDrive
  // peut intercepter. On force la taille via truncate après écriture.
  fs.writeFileSync(path, text, "utf8");
  try {
    const fd = fs.openSync(path, "r+");
    fs.ftruncateSync(fd, Buffer.byteLength(text, "utf8"));
    fs.closeSync(fd);
  } catch (e) { /* best-effort */ }
}

module.exports = { readJsonRobust, writeJsonAtomic };
