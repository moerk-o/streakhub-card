# StreakHub Card - Konzept / Pflichtenheft

## 1. Übersicht

### 1.1 Was ist StreakHub?

**StreakHub** ist eine Home Assistant Custom Integration zum Tracking von "Streaks" - der Anzahl aufeinanderfolgender Tage OHNE ein bestimmtes Ereignis.

**Anwendungsfälle:**
- "Tage ohne Zucker" - Streak zählt Tage ohne Zuckerkonsum
- "Tage ohne Rauchen" - Streak zählt rauchfreie Tage
- "Tage ohne Alkohol" - Streak zählt abstinente Tage

**Funktionsweise:**
- Ein Streak beginnt am Tag nach einem Ereignis
- Der User drückt einen Button wenn das Ereignis eintritt ("Ich habe heute Zucker gegessen")
- Die aktuelle Streak endet, eine neue beginnt am nächsten Tag
- Die Integration speichert eine Historie und berechnet eine Top-3-Bestenliste

### 1.2 Was ist die StreakHub Card?

Eine Lovelace Custom Card für die StreakHub-Integration zur Visualisierung von Streak-Trackern mit Gamification-Elementen (Pokal/Medaille-System).

**Ziel:** Eine qualitativ hochwertige, featurereiche Karte mit vollständiger UI-Konfiguration für den täglichen Gebrauch und YAML-Optionen für Power-User.

---

## 2. Darstellungsmodi

### 2.1 Standard-Modus

Quadratisches, vertikales Layout als eigenständige Feature-Card.

```
┌─────────────────────────┐
│    Zucker-Verzicht      │  ← Name (aus Device, überschreibbar)
│                         │
│           🏆            │  ← Pokal (Gold/Silber/Bronze) oder Medaille
│           #1            │  ← Rang (nur bei 1-3, nicht bei Medaille)
│                         │
│        47 Tage          │  ← Streak-Zähler
└─────────────────────────┘
```

### 2.2 Compact-Modus

Horizontales, flaches Layout (Tile-Orientierung), einzeilig.

```
┌──────────────────────────────────┐
│  🏆  Zucker-Verzicht    47 Tage  │
└──────────────────────────────────┘
```

---

## 3. Visuelle Elemente

### 3.1 Pokal/Medaille-System

Darstellung über MDI Icons (aus Home Assistant), farbig und skaliert.

| Rang | Icon               | Farbe                | Rang-Anzeige |
|------|--------------------|----------------------|--------------|
| 1    | `mdi:trophy`       | Gold (#FFD700)       | "#1"         |
| 2    | `mdi:trophy`       | Silber (#C0C0C0)     | "#2"         |
| 3    | `mdi:trophy`       | Bronze (#CD7F32)     | "#3"         |
| 4+   | `mdi:medal-outline`| Neutral (Theme-Farbe)| keine        |

**Icon-Größen:**

| Modus    | Icon-Größe | CSS-Variable        |
|----------|------------|---------------------|
| Standard | 80-120px   | `--mdc-icon-size`   |
| Compact  | 24-32px    | `--mdc-icon-size`   |

### 3.2 Konfigurierbare Elemente

Alle Elemente einzeln ein-/ausschaltbar:

| Element  | Beschreibung           | Default |
|----------|------------------------|---------|
| `trophy` | Pokal/Medaille-Grafik  | `true`  |
| `rank`   | Rang-Anzeige (#1-#3)   | `true`  |
| `days`   | Tageszähler            | `true`  |
| `name`   | Tracker-Name           | `true`  |

### 3.3 Styling-Optionen

| Option       | Beschreibung     | Default |
|--------------|------------------|---------|
| `borderless` | Rahmenloser Modus| `false` |

### 3.4 Animationen

Keine Animationen. Alle Übergänge und Darstellungen sind statisch gehalten.

---

## 4. Interaktion

### 4.1 Tap-Actions

Konfigurierbar wie bei Standard-Lovelace-Karten:

| Action            | Default        | Optionen                                              |
|-------------------|----------------|-------------------------------------------------------|
| `tap_action`      | `more-info`    | `more-info`, `none`, `navigate`, `url`, `call-service`, `reset-flow` |
| `hold_action`     | `reset-flow`   | (gleiche Optionen)                                    |
| `double_tap_action` | `none`       | (gleiche Optionen)                                    |

### 4.2 Reset-Flow

Bei Auslösung (Default: Long-Press) erscheint ein Inline-Overlay mit Buttons:

```
┌─────────────────────────────────────────┐
│           Zucker-Verzicht               │
│                                         │
│  ┌────────┬─────────┬───────────┬─────┐ │
│  │ Heute  │ Gestern │ Vorgestern│Mehr…│ │
│  └────────┴─────────┴───────────┴─────┘ │
│                                         │
│              47 Tage                    │
└─────────────────────────────────────────┘
```

**Verhalten:**

- **"Heute" / "Gestern" / "Vorgestern":** Direkte Ausführung ohne Bestätigung
- **"Mehr…":** Öffnet Kalender-Ansicht (ersetzt die Buttons)
- **Tap außerhalb:** Schließt das Overlay

**Compact-Modus:** Reset-Flow funktioniert auch hier. Die Karte expandiert temporär für die Button-Anzeige. Kann vom User deaktiviert werden (`hold_action: none`).

### 4.3 Kalender-Ansicht

Wird bei Klick auf "Mehr…" angezeigt und ersetzt die Quick-Buttons:

```
┌─────────────────────────────────────────┐
│       Wann war das Ereignis?            │
│                                         │
│          ◀  Januar 2026  ▶              │
│       Mo Di Mi Do Fr Sa So              │
│          1  2  3  4  5  6               │
│       7  8  9 10 11 12 13               │
│      14 15 16 17 18 19 20               │
│      21 22 23 24 25 26 27               │
│      28 29 30 31                        │
│                                         │
│       [Abbrechen]    [Bestätigen]       │
└─────────────────────────────────────────┘
```

**Einschränkungen:**

- Nur Tage ab `streak_start` bis heute wählbar
- Tage außerhalb des Bereichs sind ausgegraut/nicht klickbar
- Navigation in Monate vor `streak_start` nicht möglich

---

## 5. Konfiguration

### 5.1 Minimale Konfiguration

```yaml
type: custom:streakhub-card
entity: sensor.zucker_rank
```

### 5.2 Vollständige Konfiguration (UI + YAML)

```yaml
type: custom:streakhub-card
entity: sensor.zucker_rank

# Darstellung
name: "Mein Zucker-Tracker"    # Optional, überschreibt Device-Name
variant: standard              # standard | compact
borderless: false

# Sichtbarkeit der Elemente
show:
  trophy: true
  rank: true
  days: true
  name: true

# Interaktion
tap_action:
  action: more-info
hold_action:
  action: reset-flow
double_tap_action:
  action: none

# Sprache
language: auto                 # auto | en | de
```

### 5.3 Erweiterte Konfiguration (nur YAML)

Für Power-User mit umbenannten Entities:

```yaml
type: custom:streakhub-card
entity: sensor.mein_custom_name      # Umbenannte Entity für Daten
service_target: sensor.zucker_rank   # Original-Entity für Service-Calls
```

### 5.4 UI-Editor vs. YAML

| Option            | UI-Editor | YAML | Begründung                        |
|-------------------|-----------|------|-----------------------------------|
| `entity`          | ✅        | ✅   | Grundkonfiguration                |
| `name`            | ✅        | ✅   | Häufig gebraucht                  |
| `variant`         | ✅        | ✅   | Häufig gebraucht                  |
| `borderless`      | ✅        | ✅   | Häufig gebraucht                  |
| `show.*`          | ✅        | ✅   | Häufig gebraucht                  |
| `tap_action` etc. | ✅        | ✅   | Standard bei Karten               |
| `language`        | ✅        | ✅   | Nützlich                          |
| `service_target`  | ❌        | ✅   | Edge Case für Power-User          |

---

## 6. Datenquelle

### 6.1 Primäre Entity

Die Karte nutzt `sensor.*_rank` als einzige Datenquelle:

| Quelle                              | Daten                              |
|-------------------------------------|------------------------------------|
| `state`                             | Aktueller Rang (0, 1, 2 oder 3)    |
| `attributes.top_3`                  | Liste der Top 3 Einträge           |
| `attributes.top_3[x].end === null`  | Marker für aktuelle Serie          |
| `attributes.top_3[x].days`          | Tage der jeweiligen Serie          |
| `attributes.top_3[x].start`         | Start-Datum der Serie (ISO 8601)   |

**Beispiel `top_3` Attribut:**

```json
[
  {
    "rank": 1,
    "start": "2025-11-01",
    "end": "2025-12-24",
    "days": 54
  },
  {
    "rank": 2,
    "start": "2026-01-02",
    "end": null,
    "days": 47
  },
  {
    "rank": 3,
    "start": "2025-01-01",
    "end": "2025-01-13",
    "days": 13
  }
]
```

**Wichtige Felder:**
- `end: null` → Dies ist die **aktuelle, laufende Serie**
- `start` → Erster Tag OHNE das Ereignis (= Tag nach dem letzten Event)
- `days` → Anzahl der Tage dieser Serie

**Ermittlung der aktuellen Streak-Daten:**
```javascript
const top3 = entity.attributes.top_3;
const currentStreak = top3.find(entry => entry.end === null);
const currentDays = currentStreak?.days ?? 0;
const streakStart = currentStreak?.start;  // Für Kalender-Einschränkung
```

### 6.2 Display-Name des Trackers

Der angezeigte Name wird wie folgt ermittelt:

1. **Config-Override:** `name` in der Karten-Konfiguration (falls gesetzt)
2. **Device-Name:** Aus der Home Assistant Entity/Device Registry

**Zugriff auf den Device-Namen:**

```javascript
// Über hass.entities (Entity Registry)
const entityEntry = hass.entities[entityId];
const deviceId = entityEntry?.device_id;

// Über hass.devices (Device Registry)
const device = hass.devices[deviceId];
const deviceName = device?.name;  // z.B. "Zucker-Verzicht"
```

**Hinweis:** Falls `hass.entities` oder `hass.devices` nicht verfügbar sind, kann der `friendly_name` aus `hass.states[entityId].attributes.friendly_name` als Fallback verwendet werden (enthält aber ggf. den Suffix "Platzierung").

### 6.3 Service-Aufrufe

Alle Reset-Aktionen nutzen den Service `streakhub.set_streak_start`:

```javascript
// Beispiel: "Heute" geklickt
// → Event war heute → neue Serie startet morgen
hass.callService('streakhub', 'set_streak_start', {
  entity_id: 'sensor.zucker_rank',  // oder service_target falls konfiguriert
  date: '2026-01-03'                // Datum = Tag nach dem Event
})
```

| Button       | Event-Tag  | Service-Datum (neue Serie startet) |
|--------------|------------|-----------------------------------|
| Heute        | heute      | morgen                            |
| Gestern      | gestern    | heute                             |
| Vorgestern   | vorgestern | gestern                           |
| Kalender     | gewählt    | gewählt + 1 Tag                   |

### 6.4 Keine Entity-Ableitung nötig

Der Service `streakhub.set_streak_start` akzeptiert jede StreakHub-Entity als Target. Daher muss die Karte keine anderen Entities (wie `sensor.*_streak` oder `button.*_reset`) kennen oder ableiten.

---

## 7. Fehlerbehandlung

| Situation                    | Verhalten                                    |
|------------------------------|----------------------------------------------|
| Entity existiert nicht       | Lovelace-Standard-Fehlermeldung (rote Karte) |
| Entity unavailable           | "Unavailable"-Status anzeigen                |
| Falsche Entity-Art           | Fehlermeldung "Invalid entity type"          |
| Service-Call fehlgeschlagen  | Inline-Fehlermeldung in der Karte            |
| `top_3` Attribut fehlt       | Fehlermeldung "Invalid entity data"          |

### 7.1 Inline-Fehlermeldung bei Service-Fehlern

Bei fehlgeschlagenen Service-Calls (z.B. Reset) wird die Fehlermeldung inline in der Karte angezeigt:

```
┌─────────────────────────────────────────┐
│           Zucker-Verzicht               │
│                                         │
│  ⚠️ Fehler: Datum liegt vor Serienstart │
│                                         │
│              [Schließen]                │
└─────────────────────────────────────────┘
```

**Verhalten:**
- Ersetzt temporär die Reset-Buttons/Kalender-Ansicht
- "Schließen" oder Tap außerhalb schließt die Meldung
- Keine externe Abhängigkeit (kein browser_mod o.ä.)

### 7.2 Multi-Device-Verhalten

Jede Karten-Instanz ist eine unabhängige Web Component pro Browser/Device.

| Aspekt | Scope | Erklärung |
|--------|-------|-----------|
| Reset-Flow Expansion | **Lokal** | UI-State der jeweiligen Instanz |
| Service-Call Response | **Lokal** | Promise-Ergebnis nur beim Aufrufer |
| Fehlermeldung | **Lokal** | Reaktion auf lokale Promise-Rejection |
| Entity-Daten (Tage, Rang) | **Global** | HA pusht State-Updates an alle Instanzen |

**Beispiel:** User öffnet Reset-Flow auf dem Handy und klickt "Heute":
- **Handy:** Zeigt Expansion, führt Service aus, zeigt ggf. Fehler
- **Tablet:** Sieht keine Expansion, aber erhält Entity-Update bei Erfolg

---

## 8. Internationalisierung (i18n)

### 8.1 Unterstützte Sprachen

| Sprache      | Status                           |
|--------------|----------------------------------|
| Englisch (EN)| Entwicklungs- und Fallback-Sprache |
| Deutsch (DE) | Vollständig unterstützt          |

### 8.2 Auflösungsreihenfolge

1. Karten-Config (`language: de`)
2. Home Assistant User-Settings
3. Fallback: Englisch

### 8.3 Übersetzbare Strings

| Key                 | EN                      | DE                      |
|---------------------|-------------------------|-------------------------|
| `days`              | days                    | Tage                    |
| `day`               | day                     | Tag                     |
| `today`             | Today                   | Heute                   |
| `yesterday`         | Yesterday               | Gestern                 |
| `day_before`        | Day before yesterday    | Vorgestern              |
| `more`              | More…                   | Mehr…                   |
| `when_event`        | When did it happen?     | Wann war das Ereignis?  |
| `cancel`            | Cancel                  | Abbrechen               |
| `confirm`           | Confirm                 | Bestätigen              |
| `invalid_entity`    | Invalid entity type     | Ungültiger Entity-Typ   |
| `invalid_data`      | Invalid entity data     | Ungültige Entity-Daten  |
| `unavailable`       | Unavailable             | Nicht verfügbar         |

### 8.4 Singular/Plural Logik

Die Anzeige der Tage verwendet korrekten Singular/Plural:

| Wert | Anzeige (DE) | Anzeige (EN) |
|------|--------------|--------------|
| 0    | 0 Tage       | 0 days       |
| 1    | 1 Tag        | 1 day        |
| 2+   | X Tage       | X days       |

**Implementation:**

```javascript
function formatDays(count, translations) {
  const unit = count === 1 ? translations.day : translations.days;
  return `${count} ${unit}`;
}
```

---

## 9. Technische Anforderungen

### 9.1 Architektur

- Web Component (Custom Element)
- Lit oder Vanilla JS (tbd)

**Erforderliche Methoden:**

| Methode | Beschreibung |
|---------|--------------|
| `setConfig(config)` | Empfängt Konfiguration, validiert, wirft Error bei ungültiger Config |
| `set hass(hass)` | Wird bei jedem State-Update aufgerufen, triggert Re-Render |
| `getCardSize()` | Gibt Kartenhöhe zurück (1 = 50px) für Masonry-Layout |
| `getConfigElement()` | Gibt UI-Editor Element zurück (siehe 9.5) |
| `getStubConfig()` | Gibt Default-Config für Card-Picker zurück |

### 9.2 Abhängigkeiten

**Strikte Offline-Fähigkeit:** Die Karte darf keine Ressourcen aus dem Internet laden.

| Erlaubt | Nicht erlaubt |
|---------|---------------|
| Vanilla JS | CDN-Links (unpkg, cdnjs, etc.) |
| Gebundelte Libraries (nach Lizenzprüfung) | Online-Fonts (Google Fonts etc.) |
| Inline-CSS/SVG | Externe CSS-Frameworks |
| Home Assistant Frontend APIs | browser_mod, card-mod als Abhängigkeit |

**Bei Nutzung externer Komponenten:**
1. Lizenz prüfen (MIT, Apache 2.0, etc. - kompatibel mit Projekt)
2. Lizenztext im Repository aufnehmen
3. Komponente bundlen/integrieren, nicht verlinken

### 9.3 Kompatibilität

- Home Assistant 2024.1+
- Kompatibel mit Standard-HA-Themes
- Responsive Design (Mobile + Desktop)
- HACS-kompatibel

### 9.4 Dateien

```
streakhub-card/
├── streakhub-card.js       # Haupt-Card
├── README.md               # Dokumentation
├── hacs.json               # HACS-Manifest
└── translations/
    ├── en.json
    └── de.json
```

### 9.5 UI-Editor Implementation

Die Karte muss einen grafischen Konfigurations-Editor bereitstellen.

**Registrierung:**

```javascript
static getConfigElement() {
  return document.createElement('streakhub-card-editor');
}

static getStubConfig() {
  return {
    entity: '',
    variant: 'standard',
    borderless: false,
    show: {
      trophy: true,
      rank: true,
      days: true,
      name: true
    }
  };
}
```

**Editor-Komponente (`streakhub-card-editor`):**

Eine separate Web Component die folgende Felder bereitstellt:

| Feld | UI-Element | Beschreibung |
|------|------------|--------------|
| `entity` | Entity-Picker | Filtert auf `sensor.*` mit StreakHub-Integration |
| `name` | Text-Input | Optional, überschreibt Device-Name |
| `variant` | Dropdown | `standard` / `compact` |
| `borderless` | Toggle/Switch | Rahmenloser Modus |
| `show.trophy` | Toggle/Switch | Pokal/Medaille anzeigen |
| `show.rank` | Toggle/Switch | Rang anzeigen |
| `show.days` | Toggle/Switch | Tageszähler anzeigen |
| `show.name` | Toggle/Switch | Name anzeigen |
| `tap_action` | Action-Picker | Standard HA Action-Konfiguration |
| `hold_action` | Action-Picker | Standard HA Action-Konfiguration |
| `double_tap_action` | Action-Picker | Standard HA Action-Konfiguration |
| `language` | Dropdown | `auto` / `en` / `de` |

**Event-Handling:**

Der Editor feuert bei Änderungen ein `config-changed` Event:

```javascript
this.dispatchEvent(new CustomEvent('config-changed', {
  detail: { config: this._config },
  bubbles: true,
  composed: true
}));
```

**Card-Picker Registrierung:**

```javascript
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'streakhub-card',
  name: 'StreakHub Card',
  description: 'Visualize your streak progress with trophies',
  preview: true
});
```

---

## 10. Offene Punkte / Zukunft

- [ ] Weitere Sprachen bei Bedarf
- [ ] CSS-Variablen für tiefere Anpassung (card-mod kompatibel, aber nicht erforderlich)
- [ ] Konfigurierbare Icons (eigene MDI Icons für Pokal/Medaille wählen)
- [ ] Konfigurierbare Farben für Ränge (Gold/Silber/Bronze überschreiben)
- [ ] Custom SVG-Grafiken als Alternative zu MDI Icons
- [ ] Subtile Transition (~150ms) beim Ein-/Ausblenden von Inline-Elementen (Reset-Flow, Kalender, Fehlermeldungen) für weniger abrupte Übergänge

---

## Changelog

| Version | Datum      | Änderungen                    |
|---------|------------|-------------------------------|
| 0.1     | 2026-01-02 | Initiales Konzept erstellt    |
