# Internationalisation (i18n) — aiCEO v0.5

## 1. Architecture

### Stack

- **Format** : JSON par langue (`fr.json`, `en.json`, etc.)
- **Helper** : fonction `t(key, vars?)` globale
- **Détection** : `navigator.language` au premier load, persisté en `localStorage["aiCEO.uiPrefs.locale"]`
- **Fallback** : EN si key manquante en FR (et inverse)

### Structure de fichier

```
_shared/i18n/
  fr.json
  en.json
  es.json   (V1)
  de.json   (V1)
  ar.json   (V1, RTL)
```

### Convention naming des clés

`{page}.{section}.{element}` — kebab-case.

Exemples :
- `cockpit.greeting.morning_good_mood`
- `arbitrage.bucket.faire.title`
- `evening.streak.label_days`
- `common.actions.save`
- `common.errors.network_offline`

## 2. Langues supportées

### v0.5 (lancement)

- **FR** (français) — défaut
- **EN** (anglais international)

### V1 (roadmap)

- **ES** (espagnol)
- **DE** (allemand)
- **PT** (portugais)
- **IT** (italien)

### V2 (RTL)

- **AR** (arabe)
- **HE** (hébreu)

## 3. Dictionnaires (extraits FR + EN)

### `common.json` (FR)

```json
{
  "actions": {
    "save": "Enregistrer",
    "cancel": "Annuler",
    "delete": "Supprimer",
    "edit": "Modifier",
    "create": "Créer",
    "validate": "Valider",
    "confirm": "Confirmer",
    "close": "Fermer",
    "back": "Retour",
    "next": "Suivant",
    "previous": "Précédent",
    "skip": "Passer",
    "retry": "Réessayer",
    "refresh": "Rafraîchir",
    "search": "Rechercher",
    "filter": "Filtrer",
    "sort": "Trier",
    "export": "Exporter",
    "import": "Importer",
    "settings": "Réglages",
    "help": "Aide",
    "logout": "Se déconnecter"
  },
  "states": {
    "loading": "Chargement…",
    "saving": "Enregistrement…",
    "saved": "Enregistré",
    "error": "Erreur",
    "offline": "Hors-ligne",
    "online": "En ligne"
  },
  "time": {
    "today": "aujourd'hui",
    "yesterday": "hier",
    "tomorrow": "demain",
    "now": "maintenant",
    "in_minutes_one": "dans {n} min",
    "in_minutes_other": "dans {n} min",
    "in_hours_one": "dans {n} h",
    "in_hours_other": "dans {n} h",
    "in_days_one": "dans {n} j",
    "in_days_other": "dans {n} j",
    "ago_minutes_one": "il y a {n} min",
    "ago_minutes_other": "il y a {n} min",
    "ago_hours_one": "il y a {n} h",
    "ago_hours_other": "il y a {n} h",
    "ago_days_one": "il y a {n} j",
    "ago_days_other": "il y a {n} j"
  },
  "tasks": {
    "count_zero": "0 tâche",
    "count_one": "1 tâche",
    "count_other": "{n} tâches"
  },
  "decisions": {
    "count_zero": "0 décision",
    "count_one": "1 décision",
    "count_other": "{n} décisions"
  },
  "events": {
    "count_zero": "0 RDV",
    "count_one": "1 RDV",
    "count_other": "{n} RDV"
  },
  "errors": {
    "network_offline": "Hors-ligne. Tes actions seront synchronisées au retour du réseau.",
    "network_timeout": "Outlook n'a pas répondu en 30 s.",
    "ai_quota_reached": "Quota IA atteint pour ce mois. Le mode rule-based prend le relais.",
    "sync_conflict": "Conflit détecté avec un autre appareil. Quelle version garder ?",
    "crash_recovery": "Quelque chose s'est cassé.",
    "session_expired": "Session expirée. Reconnexion nécessaire."
  }
}
```

### `common.json` (EN)

```json
{
  "actions": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "create": "Create",
    "validate": "Confirm",
    "close": "Close",
    "back": "Back",
    "next": "Next",
    "previous": "Previous",
    "skip": "Skip",
    "retry": "Retry",
    "refresh": "Refresh",
    "search": "Search",
    "filter": "Filter",
    "sort": "Sort",
    "export": "Export",
    "import": "Import",
    "settings": "Settings",
    "help": "Help",
    "logout": "Sign out"
  },
  "states": {
    "loading": "Loading…",
    "saving": "Saving…",
    "saved": "Saved",
    "error": "Error",
    "offline": "Offline",
    "online": "Online"
  },
  "time": {
    "today": "today",
    "yesterday": "yesterday",
    "tomorrow": "tomorrow",
    "in_minutes_one": "in {n} min",
    "in_minutes_other": "in {n} min",
    "in_days_one": "in {n} day",
    "in_days_other": "in {n} days",
    "ago_minutes_one": "{n} min ago",
    "ago_minutes_other": "{n} min ago",
    "ago_days_one": "{n} day ago",
    "ago_days_other": "{n} days ago"
  },
  "tasks": {
    "count_zero": "0 tasks",
    "count_one": "1 task",
    "count_other": "{n} tasks"
  },
  "errors": {
    "network_offline": "Offline. Changes will sync when back online.",
    "network_timeout": "Outlook didn't respond in 30s.",
    "ai_quota_reached": "AI quota reached this month. Falling back to rule-based mode.",
    "sync_conflict": "Conflict detected. Which version to keep?",
    "crash_recovery": "Something broke.",
    "session_expired": "Session expired. Please sign in again."
  }
}
```

### `cockpit.json` (FR)

```json
{
  "title": "Cockpit",
  "greeting": {
    "morning_good_mood": "Bon retour, {name}.",
    "morning_default": "Bonjour {name}.",
    "morning_low_mood": "Bonjour {name}. On reprend en douceur.",
    "morning_streak_break": "Bonjour {name}. Pas grave, on reprend.",
    "afternoon": "Bonne après-midi, {name}.",
    "evening": "Belle fin de journée, {name}."
  },
  "morning_card": {
    "title_pending": "Arbitrage à faire",
    "title_done": "Top 3 du jour",
    "subtitle_pending_zero": "0 tâche en attente. Profite.",
    "subtitle_pending_other": "{n} tâches en attente",
    "cta_pending": "Lancer l'arbitrage",
    "cta_done": "Voir les détails"
  },
  "evening_card": {
    "title_pending": "Boucle du soir",
    "title_done": "Bilan fait",
    "subtitle_pending": "Prends 2 minutes pour clore la journée",
    "cta_pending": "Boucler la journée"
  },
  "big_rocks": {
    "title": "Big Rocks de la semaine",
    "empty": "Définis 1 à 3 objectifs pour la semaine.",
    "cta_add": "+ Ajouter"
  },
  "alerts": {
    "title": "Alertes",
    "outlook_stale": "Outlook synchronisé il y a {time}",
    "overdue_count": "{n} tâches en retard",
    "big_rocks_orphan": "Big Rock #{n} sans tâche associée"
  },
  "counters": {
    "title": "Compteurs du jour",
    "tasks_label": "Tâches",
    "decisions_label": "Décisions",
    "meetings_label": "RDV",
    "mails_label": "Mails"
  },
  "footer": {
    "version_label": "Version",
    "last_sync_label": "Dernière sync",
    "ai_cost_label": "Coût IA aujourd'hui",
    "monthly_question_prefix": "Question du mois :"
  }
}
```

### `cockpit.json` (EN)

```json
{
  "title": "Cockpit",
  "greeting": {
    "morning_good_mood": "Welcome back, {name}.",
    "morning_default": "Good morning, {name}.",
    "morning_low_mood": "Good morning, {name}. Let's ease back in.",
    "morning_streak_break": "Good morning, {name}. No worries, let's continue.",
    "afternoon": "Good afternoon, {name}.",
    "evening": "Good evening, {name}."
  },
  "morning_card": {
    "title_pending": "Triage pending",
    "title_done": "Today's top 3",
    "subtitle_pending_zero": "0 tasks pending. Enjoy.",
    "subtitle_pending_one": "1 task pending",
    "subtitle_pending_other": "{n} tasks pending",
    "cta_pending": "Start triage",
    "cta_done": "View details"
  },
  "evening_card": {
    "title_pending": "Evening close",
    "title_done": "Closed",
    "subtitle_pending": "Take 2 minutes to wrap up the day",
    "cta_pending": "Close the day"
  },
  "big_rocks": {
    "title": "Big Rocks this week",
    "empty": "Set 1-3 goals for the week.",
    "cta_add": "+ Add"
  }
}
```

## 4. Pluralization rules

Utilisation de `Intl.PluralRules` natif :

```javascript
const pr = new Intl.PluralRules('fr');
function t(key, vars = {}) {
  if ('n' in vars) {
    const rule = pr.select(vars.n); // "zero", "one", "two", "few", "many", "other"
    const pluralKey = `${key}_${rule}`;
    if (translations[pluralKey]) {
      return interpolate(translations[pluralKey], vars);
    }
  }
  return interpolate(translations[key] || key, vars);
}
```

### Règles spécifiques

**FR** : `_zero`, `_one`, `_other` (1 et 0 = singulier, ≥2 = pluriel).
**EN** : `_one`, `_other` (1 = singulier, 0 et ≥2 = pluriel).
**AR** : `_zero`, `_one`, `_two`, `_few`, `_many`, `_other` (6 catégories).

### Exemple "0 tâche"

FR : "0 tâche" (singulier en FR pour 0)
EN : "0 tasks" (pluriel en EN pour 0)

C'est exactement pour ça qu'on utilise `Intl.PluralRules`.

## 5. RTL support (V1+ mais préparation v0.5)

### CSS prep

Utiliser **logical properties** :

```css
/* ❌ Évite */
.card { margin-left: 16px; padding-right: 24px; }

/* ✅ Préfère */
.card { margin-inline-start: 16px; padding-inline-end: 24px; }
```

### Switching `dir`

```html
<html lang="ar" dir="rtl">
```

Toutes les flexbox `flex-direction: row` se inversent automatiquement.

### Icônes directionnelles

Flippées en RTL :

```css
[dir="rtl"] .icon-chevron-right { transform: scaleX(-1); }
[dir="rtl"] .icon-arrow-right { transform: scaleX(-1); }
[dir="rtl"] .icon-back { transform: scaleX(-1); }
```

### Drawer en RTL

Drawer côté droit en RTL (au lieu de gauche). Sticky `inset-inline-start: 0` se résout automatiquement.

### Démo dans maquette

Settings page : 1 vue avec switcher locale, et 1 vue mockée en RTL (avec un placeholder hébreu/arabe générique).

## 6. Formats par locale

### Date

```javascript
new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(date);
// → "26 avril 2026"

new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(date);
// → "April 26, 2026"

new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' }).format(date);
// → "26 April 2026"
```

### Heure

```javascript
new Intl.DateTimeFormat('fr-FR', { timeStyle: 'short' }).format(date);
// → "14:30"  (mais en FR aiCEO on utilise "h", à override : "14h30")

new Intl.DateTimeFormat('en-US', { timeStyle: 'short' }).format(date);
// → "2:30 PM"
```

### Nombre

```javascript
new Intl.NumberFormat('fr-FR').format(15000);
// → "15 000"

new Intl.NumberFormat('en-US').format(15000);
// → "15,000"
```

### Currency

```javascript
new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(15000);
// → "15 000,00 €"

new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(15000);
// → "$15,000.00"
```

### First day of week

```javascript
// Approche manuelle (Intl.Locale.weekInfo en cours de standardisation)
const weekStartByLocale = {
  'fr': 1, // lundi
  'en-US': 0, // dimanche
  'en-GB': 1, // lundi
  'ar': 6 // samedi
};
```

### Time format 24h vs 12h

```javascript
const use24h = !['en-US'].includes(locale);
```

## 7. String length variations

### Règle de design

| Locale | Multiplicateur vs FR |
|---|---|
| FR (référence) | 1.0× |
| EN | ~0.85× (plus court) |
| ES | ~1.10× |
| DE | ~1.30× (mots longs : "Geschäftsführungsbericht") |
| AR | ~0.90× |
| ZH (CN) | ~0.40× (idéogrammes) |

### Implications layout

- Pas de `width: 200px` fixe sur les containers texte
- Préférer `min-width: 200px; max-width: 320px`
- Hauteur de carte flexible (pas `height` fixe)
- Tester DE en mode "long strings" pour valider qu'aucun layout ne casse

### Tests recommandés

Pseudo-locale "double" (toutes les strings doublées en longueur) — détecter les overflow visuellement.

## 8. Locale switcher UI

### Position

Drawer footer, juste au-dessus de Réglages :

```html
<button class="drawer-locale-switch" data-tooltip="Langue">
  <svg><!-- lucide globe --></svg>
  <span class="drawer-label">Français</span>
  <svg class="ml-auto"><!-- chevron-down --></svg>
</button>
```

Click → menu dropdown avec les langues disponibles + flag emoji.

### Settings page

Section "Langue & région" :
- Langue interface (FR / EN / Auto-detect)
- Fuseau horaire (auto-detect ou manuel)
- Format date (long / court)
- Format heure (24h / 12h)
- Premier jour de la semaine (lundi / dimanche)
- Devise par défaut (EUR / USD / etc.)

## 9. Vocabulaire culturel configurable

### Exemple : entityLabel

Certains CEO disent "groupe", d'autres "house" / "holding" / "company" / "entity".

Settings → Vocabulaire → "Comment appelles-tu tes entités ?"

```json
{
  "tenant.entityLabel": {
    "singular": "house",
    "plural": "houses",
    "definite_singular": "the house",
    "definite_plural": "the houses"
  }
}
```

Utilisé partout :
- "Mes {entities.plural}" → "Mes houses" / "Mes groupes"
- "Voir détail {entities.definite_singular}" → "Voir détail de la house"

## 10. Démo i18n dans la maquette

### Vues à montrer

1. **Cockpit en EN** (1 vue) — démontre la cohérence
2. **Onboarding en EN étape 3** (1 vue) — démontre i18n dès le wizard
3. **Settings avec switcher locale ouvert** (1 vue) — montre l'UX
4. **Settings en RTL** (1 vue, simulation arabe) — démontre la prep RTL

Total : **4 vues i18n** dans la maquette.

## 11. Détection auto

```javascript
function detectLocale() {
  const stored = localStorage.getItem('aiCEO.uiPrefs.locale');
  if (stored) return stored;

  const supported = ['fr', 'en'];
  const navigatorLang = navigator.language.split('-')[0];

  return supported.includes(navigatorLang) ? navigatorLang : 'en'; // fallback EN
}
```

Si ni FR ni EN détecté : EN par défaut + banner discret "Want français? [Switch]".
