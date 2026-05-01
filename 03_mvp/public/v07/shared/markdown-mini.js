// markdown-mini.js — Mini-renderer Markdown pour bulles assistant (S6.31)
// Couvre : **bold** *italic* `code` ## headings - lists 1. ordered
// Pas de safety stricte : on reescape HTML d'abord, puis on re-injecte les balises.

export function mdToHtml(s) {
  if (!s) return '';
  // 1. Escape HTML d'abord
  var out = String(s).replace(/[&<>"']/g, function (c) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]);
  });
  // 2. Code inline (avant gras pour ne pas confondre)
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  // 3. Headings (lignes commencant par ## ou ###)
  out = out.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  out = out.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  out = out.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  // 4. Gras et italique
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  // 5. Listes : detecter blocks consecutifs `- xxx` ou `1. xxx`
  out = out.replace(/(?:^[-*] .+(?:\n|$))+/gm, function (m) {
    var items = m.trim().split(/\n/).map(function (l) {
      return '<li>' + l.replace(/^[-*] /, '') + '</li>';
    });
    return '<ul>' + items.join('') + '</ul>';
  });
  out = out.replace(/(?:^\d+\. .+(?:\n|$))+/gm, function (m) {
    var items = m.trim().split(/\n/).map(function (l) {
      return '<li>' + l.replace(/^\d+\. /, '') + '</li>';
    });
    return '<ol>' + items.join('') + '</ol>';
  });
  // 6. Lignes restantes : remplacer \n par <br>
  out = out.replace(/\n/g, '<br>');
  return out;
}
