# StreakHub Card - Technischer Umsetzungsplan

> Dieses Dokument enthält alle technischen Entscheidungen, Architektur-Details und Implementierungsstrategien für die StreakHub Card. Es dient als vollständige Referenz für die Entwicklung.

**Stand:** 2026-01-02
**Basis:** [konzept.md](./konzept.md) (fachliche Anforderungen)

---

## 1. Technologie-Stack

### 1.1 Entscheidungen

| Aspekt | Entscheidung | Begründung |
|--------|--------------|------------|
| UI-Framework | **Lit 3.x** | Modern, leichtgewichtig, Web Components Standard |
| Sprache | **TypeScript** | Typsicherheit für Config-Interfaces, bessere IDE-Unterstützung |
| Bundler | **Rollup** | De-facto-Standard für Lovelace Cards, saubere kleine Bundles |
| Ausgabe | **Einzelne ES-Module Datei** | Standard für HACS, `dist/streakhub-card.js` |

### 1.2 Lit-Bundling-Strategie

Lit wird vollständig in das Bundle integriert:
- Keine Nutzung von Home Assistant internen Lit-Exporten
- Keine Prototyp-Zugriffe auf HA-Komponenten
- Vollständig eigenständiges Bundle (~15-20KB gzipped)

**Lizenz:** Lit ist BSD-3-Clause lizenziert, kompatibel mit MIT.

### 1.3 Sprachkonvention

| Kontext | Sprache |
|---------|---------|
| Code (Variablen, Funktionen, Klassen) | **Englisch** |
| Kommentare im Code | **Englisch** |
| Commit-Messages | **Englisch** |
| README.md | **Englisch** |
| LICENSE | **Englisch** |
| JSDoc / TSDoc | **Englisch** |
| hacs.json | **Englisch** |
| konzept.md | Deutsch (bestehendes Dokument) |
| technischer_umsetzungsplan.md | Deutsch (bestehendes Dokument) |
| Kommunikation mit Projektowner | Deutsch |

**Beispiele:**

```typescript
// Good: English
const currentStreak = this.getCurrentStreak();
/** Returns the display name for the tracker */
private getDisplayName(): string { ... }

// Bad: German
const aktuelleStreak = this.getAktuelleStreak();
/** Gibt den Anzeigenamen für den Tracker zurück */
private getAnzeigeName(): string { ... }
```

---

## 2. Projekt-Struktur

```
streakhub-card/
├── src/
│   ├── streakhub-card.ts          # Hauptkomponente, Card-Registrierung
│   ├── streakhub-card-editor.ts   # UI-Editor Komponente
│   ├── components/
│   │   ├── trophy-icon.ts         # Pokal/Medaille Rendering
│   │   ├── reset-flow.ts          # Reset-Buttons + Expansion-Logic
│   │   └── calendar-picker.ts     # Monats-Kalender für "Mehr…"
│   ├── utils/
│   │   ├── translations.ts        # i18n Strings + Resolver
│   │   ├── format.ts              # formatDays(), Datums-Utilities
│   │   └── actions.ts             # Tap-Action Handler, Service-Calls
│   ├── types/
│   │   └── index.ts               # Config-Interface, Entity-Types
│   └── styles/
│       ├── card.styles.ts         # Standard + Compact Styles
│       └── calendar.styles.ts     # Kalender-Styles
├── dist/
│   └── streakhub-card.js          # Gebündeltes Output (gitignored bis Release)
├── package.json
├── tsconfig.json
├── rollup.config.js
├── hacs.json
├── LICENSE
├── README.md
├── konzept.md                     # Fachliche Anforderungen
└── technischer_umsetzungsplan.md  # Dieses Dokument
```

### 2.1 Komponenten-Verantwortlichkeiten

| Komponente | Verantwortung |
|------------|---------------|
| `streakhub-card` | Config-Validierung, hass-Binding, Haupt-Rendering, Card-API |
| `streakhub-card-editor` | UI-Editor, config-changed Events |
| `trophy-icon` | Icon-Auswahl (trophy/medal), Farbe nach Rang, Größe nach Variant |
| `reset-flow` | Button-Rendering, Expansion-State, Service-Call Trigger |
| `calendar-picker` | Monatsansicht, Datums-Selektion, Bereichs-Einschränkung |

---

## 3. Build-Konfiguration

### 3.1 package.json

```json
{
  "name": "streakhub-card",
  "version": "1.0.0",
  "description": "Home Assistant Lovelace Card for StreakHub Integration",
  "main": "dist/streakhub-card.js",
  "type": "module",
  "scripts": {
    "build": "rollup -c",
    "watch": "rollup -c --watch",
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "lit": "^3.1.0",
    "@rollup/plugin-node-resolve": "^15.2.0",
    "@rollup/plugin-typescript": "^11.1.0",
    "@rollup/plugin-terser": "^0.4.0",
    "rollup": "^4.9.0",
    "typescript": "^5.3.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.56.0"
  },
  "license": "MIT"
}
```

### 3.2 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2021", "DOM", "DOM.Iterable"],
    "strict": true,
    "noEmit": true,
    "declaration": false,
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts"]
}
```

### 3.3 rollup.config.js

```javascript
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/streakhub-card.ts',
  output: {
    file: 'dist/streakhub-card.js',
    format: 'es'
  },
  plugins: [
    resolve(),
    typescript({ tsconfig: './tsconfig.json', declaration: false }),
    terser({ format: { comments: false } })
  ]
};
```

---

## 4. Type Definitions

### 4.1 Config-Interface

```typescript
interface StreakHubCardConfig {
  entity: string;                    // Required - sensor.*_rank Entity
  service_target?: string;           // Optional - für umbenannte Entities
  name?: string;                     // Optional - überschreibt Device-Name
  variant?: 'standard' | 'compact';  // Default: 'standard'
  borderless?: boolean;              // Default: false
  show?: {
    trophy?: boolean;                // Default: true
    rank?: boolean;                  // Default: true
    days?: boolean;                  // Default: true
    name?: boolean;                  // Default: true
  };
  tap_action?: ActionConfig;         // Default: { action: 'more-info' }
  hold_action?: ActionConfig;        // Default: { action: 'reset-flow' }
  double_tap_action?: ActionConfig;  // Default: { action: 'none' }
  language?: 'auto' | 'en' | 'de';   // Default: 'auto'
}
```

### 4.2 Action-Config

```typescript
interface ActionConfig {
  action: 'more-info' | 'none' | 'navigate' | 'url' | 'call-service' | 'reset-flow';
  navigation_path?: string;  // für 'navigate'
  url_path?: string;         // für 'url'
  service?: string;          // für 'call-service'
  service_data?: object;     // für 'call-service'
}
```

### 4.3 Entity-Datenstruktur

```typescript
interface StreakEntry {
  rank: number;
  start: string;      // ISO 8601 Datum
  end: string | null; // null = aktuelle Serie
  days: number;
}

// Entity State
interface StreakHubEntityState {
  state: string;  // "0", "1", "2", "3" (aktueller Rang)
  attributes: {
    top_3: StreakEntry[];
    friendly_name?: string;
  };
}
```

### 4.4 Interner State

```typescript
type ExpandedState = 'closed' | 'buttons' | 'calendar';
```

---

## 5. Datenfluss & State Management

### 5.1 Reaktives Update

```typescript
@state() private _hass?: HomeAssistant;
@state() private _expandedState: ExpandedState = 'closed';
@state() private _selectedDate?: string;
@state() private _error?: string;

set hass(hass: HomeAssistant) {
  const oldHass = this._hass;
  this._hass = hass;

  // Nur re-rendern wenn sich relevante Entity geändert hat
  if (oldHass?.states[this._config.entity] !== hass.states[this._config.entity]) {
    this.requestUpdate();
  }
}
```

### 5.2 Daten-Extraktion

```typescript
private get _entityState() {
  return this._hass?.states[this._config.entity];
}

private get _currentStreak() {
  const top3 = this._entityState?.attributes?.top_3 as StreakEntry[] | undefined;
  return top3?.find(e => e.end === null) ?? { days: 0, rank: 0, start: null };
}

private get _currentRank(): number {
  const state = this._entityState?.state;
  const rank = parseInt(state ?? '0', 10);
  return isNaN(rank) ? 0 : rank;
}

private get _displayName(): string {
  if (this._config.name) return this._config.name;

  // Priorität 1: Device-Name aus Registry
  const entityEntry = this._hass?.entities?.[this._config.entity];
  const device = entityEntry?.device_id
    ? this._hass?.devices?.[entityEntry.device_id]
    : null;

  if (device?.name) return device.name;

  // Priorität 2: Fallback auf friendly_name
  return this._entityState?.attributes?.friendly_name
    ?? this._config.entity;
}
```

### 5.3 Entity-Validierung

```typescript
// Erkennung ob Entity zur StreakHub-Integration gehört
const isStreakHubRank = (entityState: HassEntity): boolean => {
  return Array.isArray(entityState?.attributes?.top_3);
};
```

---

## 6. Card-API Implementation

### 6.1 setConfig()

```typescript
setConfig(config: StreakHubCardConfig): void {
  if (!config.entity) {
    throw new Error('Entity is required');
  }
  if (config.variant && !['standard', 'compact'].includes(config.variant)) {
    throw new Error('Invalid variant: must be "standard" or "compact"');
  }

  // Defaults mergen
  const defaultShow = { trophy: true, rank: true, days: true, name: true };

  this._config = {
    variant: 'standard',
    borderless: false,
    show: defaultShow,
    tap_action: { action: 'more-info' },
    hold_action: { action: 'reset-flow' },
    double_tap_action: { action: 'none' },
    language: 'auto',
    ...config,
    show: { ...defaultShow, ...config.show }
  };
}
```

### 6.2 getCardSize()

Dynamisch basierend auf Variant und Expansion-State:

| Variant | State | Rückgabe |
|---------|-------|----------|
| standard | closed | 3 |
| standard | expanded (buttons) | 4 |
| standard | expanded (calendar) | 6 |
| compact | closed | 1 |
| compact | expanded | 4 |

```typescript
getCardSize(): number {
  const base = this._config?.variant === 'compact' ? 1 : 3;

  if (this._expandedState === 'buttons') {
    return this._config?.variant === 'compact' ? 4 : 4;
  }
  if (this._expandedState === 'calendar') {
    return 6;
  }

  return base;
}
```

### 6.3 getGridOptions()

Für Sections View (Home Assistant 2024.x+):

```typescript
static getGridOptions(): { columns: number; min_columns: number; rows: string } {
  return {
    columns: 6,      // Halbe Breite bei 12-Column Grid
    min_columns: 3,  // Minimum 1/4 Breite
    rows: 'auto'     // Automatische Höhe
  };
}
```

### 6.4 Expansion-Event

Bei Größenänderung durch Expansion muss Masonry informiert werden:

```typescript
private _setExpanded(state: ExpandedState): void {
  this._expandedState = state;
  this.dispatchEvent(new Event('card-size-changed', { bubbles: true }));
}
```

### 6.5 Editor-Integration

```typescript
static getConfigElement(): HTMLElement {
  return document.createElement('streakhub-card-editor');
}

static getStubConfig(hass: HomeAssistant): Partial<StreakHubCardConfig> {
  // Erste passende StreakHub-Entity finden
  const entity = Object.keys(hass.states).find(eid =>
    Array.isArray(hass.states[eid]?.attributes?.top_3)
  );

  return {
    entity: entity ?? '',
    variant: 'standard',
    borderless: false,
    show: { trophy: true, rank: true, days: true, name: true }
  };
}
```

### 6.6 Card-Picker Registrierung

```typescript
// Am Ende von streakhub-card.ts
declare global {
  interface Window {
    customCards?: Array<{
      type: string;
      name: string;
      description: string;
      preview?: boolean;
    }>;
  }
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'streakhub-card',
  name: 'StreakHub Card',
  description: 'Visualize your streak progress with trophies',
  preview: true
});
```

---

## 7. Rendering-Strategie

### 7.1 Haupt-Render-Logik

```typescript
render() {
  // 1. Error States prüfen
  if (!this._config) {
    return this._renderError('No configuration');
  }

  const entity = this._entityState;

  if (!entity) {
    return this._renderError(this._t('invalid_entity'));
  }

  if (entity.state === 'unavailable') {
    return this._renderError(this._t('unavailable'));
  }

  if (!Array.isArray(entity.attributes?.top_3)) {
    return this._renderError(this._t('invalid_data'));
  }

  // 2. Daten extrahieren
  const currentStreak = this._currentStreak;
  const rank = this._currentRank;
  const name = this._displayName;

  // 3. Variant-spezifisches Rendering
  if (this._config.variant === 'compact') {
    return this._renderCompact(name, rank, currentStreak.days);
  }

  return this._renderStandard(name, rank, currentStreak.days);
}
```

### 7.2 Error-Rendering (Inline)

```typescript
private _renderError(message: string) {
  return html`
    <ha-card class="error">
      <div class="error-content">
        <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
        <span>${message}</span>
      </div>
    </ha-card>
  `;
}
```

### 7.3 Service-Fehler (Inline im Overlay)

Bei fehlgeschlagenen Service-Calls wird die Fehlermeldung inline angezeigt:

```typescript
private _renderServiceError() {
  return html`
    <div class="service-error">
      <ha-icon icon="mdi:alert"></ha-icon>
      <span>${this._error}</span>
      <mwc-button @click=${this._clearError}>
        ${this._t('cancel')}
      </mwc-button>
    </div>
  `;
}
```

---

## 8. Sub-Komponenten

### 8.1 Trophy-Icon

```typescript
@customElement('streakhub-trophy')
export class StreakHubTrophy extends LitElement {
  @property({ type: Number }) rank = 0;
  @property({ type: String }) variant: 'standard' | 'compact' = 'standard';

  private get _icon(): string {
    return this.rank >= 1 && this.rank <= 3 ? 'mdi:trophy' : 'mdi:medal-outline';
  }

  private get _color(): string {
    switch (this.rank) {
      case 1: return 'var(--streakhub-gold, #FFD700)';
      case 2: return 'var(--streakhub-silver, #C0C0C0)';
      case 3: return 'var(--streakhub-bronze, #CD7F32)';
      default: return 'var(--streakhub-neutral, var(--secondary-text-color))';
    }
  }

  render() {
    return html`
      <ha-icon
        .icon=${this._icon}
        style="color: ${this._color}; --mdc-icon-size: ${this._size}"
      ></ha-icon>
    `;
  }
}
```

### 8.2 Reset-Flow

```typescript
@customElement('streakhub-reset-flow')
export class StreakHubResetFlow extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) translations!: Translations;
  @property({ type: String }) streakStart?: string;
  @property({ type: String }) entityId!: string;
  @property({ type: String }) serviceTarget?: string;

  @state() private _view: 'buttons' | 'calendar' = 'buttons';
  @state() private _loading = false;

  private async _handleQuickReset(daysAgo: number): Promise<void> {
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() - daysAgo);

    // Service-Datum = Tag nach dem Event
    const serviceDate = new Date(eventDate);
    serviceDate.setDate(serviceDate.getDate() + 1);

    await this._callResetService(serviceDate);
  }

  private async _callResetService(date: Date): Promise<void> {
    this._loading = true;
    try {
      await this.hass!.callService('streakhub', 'set_streak_start', {
        entity_id: this.serviceTarget ?? this.entityId,
        date: date.toISOString().split('T')[0]
      });
      this.dispatchEvent(new CustomEvent('close'));
    } catch (err) {
      this.dispatchEvent(new CustomEvent('error', {
        detail: { message: (err as Error).message }
      }));
    } finally {
      this._loading = false;
    }
  }

  render() {
    if (this._view === 'calendar') {
      return html`
        <streakhub-calendar
          .minDate=${this.streakStart}
          .maxDate=${new Date().toISOString().split('T')[0]}
          .weekStart=${getWeekStart(this.hass)}
          .translations=${this.translations}
          @date-selected=${this._handleCalendarSelect}
          @cancel=${() => this._view = 'buttons'}
        ></streakhub-calendar>
      `;
    }

    return html`
      <div class="quick-buttons">
        <button @click=${() => this._handleQuickReset(0)}>
          ${this.translations.today}
        </button>
        <button @click=${() => this._handleQuickReset(1)}>
          ${this.translations.yesterday}
        </button>
        <button @click=${() => this._handleQuickReset(2)}>
          ${this.translations.day_before}
        </button>
        <button @click=${() => this._view = 'calendar'}>
          ${this.translations.more}
        </button>
      </div>
    `;
  }
}
```

### 8.3 Calendar-Picker

```typescript
@customElement('streakhub-calendar')
export class StreakHubCalendar extends LitElement {
  @property({ type: String }) minDate?: string;
  @property({ type: String }) maxDate?: string;
  @property({ type: Number }) weekStart = 1; // 0=So, 1=Mo
  @property({ attribute: false }) translations!: Translations;

  @state() private _viewDate = new Date();
  @state() private _selectedDate?: string;

  private _isDateDisabled(date: Date): boolean {
    const dateStr = date.toISOString().split('T')[0];
    if (this.minDate && dateStr < this.minDate) return true;
    if (this.maxDate && dateStr > this.maxDate) return true;
    return false;
  }

  private _canNavigatePrev(): boolean {
    if (!this.minDate) return true;
    const minMonth = new Date(this.minDate);
    return this._viewDate > minMonth;
  }

  // ... Render-Logik für Monatskalender
}
```

---

## 9. Internationalisierung (i18n)

### 9.1 Translations-Objekt

```typescript
const TRANSLATIONS = {
  en: {
    days: 'days',
    day: 'day',
    today: 'Today',
    yesterday: 'Yesterday',
    day_before: 'Day before yesterday',
    more: 'More…',
    when_event: 'When did it happen?',
    cancel: 'Cancel',
    confirm: 'Confirm',
    invalid_entity: 'Invalid entity type',
    invalid_data: 'Invalid entity data',
    unavailable: 'Unavailable'
  },
  de: {
    days: 'Tage',
    day: 'Tag',
    today: 'Heute',
    yesterday: 'Gestern',
    day_before: 'Vorgestern',
    more: 'Mehr…',
    when_event: 'Wann war das Ereignis?',
    cancel: 'Abbrechen',
    confirm: 'Bestätigen',
    invalid_entity: 'Ungültiger Entity-Typ',
    invalid_data: 'Ungültige Entity-Daten',
    unavailable: 'Nicht verfügbar'
  }
};
```

### 9.2 Sprach-Auflösung

```typescript
function getTranslations(hass: HomeAssistant | undefined, configLang?: string): Translations {
  // 1. Config-Override
  if (configLang && configLang !== 'auto' && TRANSLATIONS[configLang]) {
    return TRANSLATIONS[configLang];
  }

  // 2. Home Assistant User-Settings
  const hassLang = hass?.locale?.language?.split('-')[0];
  if (hassLang && TRANSLATIONS[hassLang]) {
    return TRANSLATIONS[hassLang];
  }

  // 3. Fallback
  return TRANSLATIONS.en;
}
```

### 9.3 Singular/Plural

```typescript
function formatDays(count: number, translations: Translations): string {
  const unit = count === 1 ? translations.day : translations.days;
  return `${count} ${unit}`;
}
```

### 9.4 Kalender-Wochenstart

```typescript
function getWeekStart(hass: HomeAssistant | undefined): number {
  // hass.locale.first_weekday: 'monday' | 'sunday' | ...
  const firstWeekday = hass?.locale?.first_weekday;

  if (firstWeekday === 'sunday') return 0;

  // Fallback: Montag (europäisch)
  return 1;
}
```

---

## 10. CSS Custom Properties

```css
:host {
  /* Größen */
  --streakhub-trophy-size: 80px;
  --streakhub-trophy-size-compact: 24px;

  /* Farben (überschreibbar via card-mod) */
  --streakhub-gold: #FFD700;
  --streakhub-silver: #C0C0C0;
  --streakhub-bronze: #CD7F32;
  --streakhub-neutral: var(--secondary-text-color);

  /* Spacing */
  --streakhub-padding: 16px;
}
```

---

## 11. UI-Editor

### 11.1 Struktur

```typescript
@customElement('streakhub-card-editor')
export class StreakHubCardEditor extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @state() private _config?: StreakHubCardConfig;

  setConfig(config: StreakHubCardConfig): void {
    this._config = config;
  }

  private _configChanged(key: string, value: unknown): void {
    if (!this._config) return;

    const newConfig = { ...this._config, [key]: value };
    this._config = newConfig;

    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: newConfig },
      bubbles: true,
      composed: true
    }));
  }
}
```

### 11.2 Editor-Felder

| Feld | UI-Element | Beschreibung |
|------|------------|--------------|
| `entity` | Entity-Picker | Gefiltert auf Entities mit `top_3` Attribut |
| `name` | Text-Input | Optional, überschreibt Device-Name |
| `variant` | Dropdown | `standard` / `compact` |
| `borderless` | Toggle | Rahmenloser Modus |
| `show.trophy` | Toggle | Pokal/Medaille anzeigen |
| `show.rank` | Toggle | Rang (#1-#3) anzeigen |
| `show.days` | Toggle | Tageszähler anzeigen |
| `show.name` | Toggle | Tracker-Name anzeigen |
| `tap_action` | Dropdown | `more-info` / `reset-flow` / `none` / `navigate` |
| `hold_action` | Dropdown | (gleiche Optionen) |
| `double_tap_action` | Dropdown | (gleiche Optionen) |
| `language` | Dropdown | `auto` / `en` / `de` |

### 11.3 Entity-Filter

```typescript
private _getStreakHubEntities(): string[] {
  if (!this.hass) return [];

  return Object.keys(this.hass.states).filter(eid =>
    eid.startsWith('sensor.') &&
    Array.isArray(this.hass!.states[eid]?.attributes?.top_3)
  );
}
```

---

## 12. Fehlerbehandlung

### 12.1 Error-States

| Situation | Verhalten |
|-----------|-----------|
| Entity existiert nicht | Inline-Fehler: "Invalid entity type" |
| Entity unavailable | Inline-Fehler: "Unavailable" |
| `top_3` Attribut fehlt | Inline-Fehler: "Invalid entity data" |
| Service-Call fehlgeschlagen | Inline-Fehler im Overlay mit Schließen-Button |

### 12.2 Inline-Fehler Design

Fehler werden dezent inline angezeigt (nicht die rote HA-Standard-Karte):

```
┌─────────────────────────────────────────┐
│  ⚠️  Ungültiger Entity-Typ              │
│      sensor.nicht_vorhanden             │
└─────────────────────────────────────────┘
```

### 12.3 Multi-Device Verhalten

| Aspekt | Scope | Erklärung |
|--------|-------|-----------|
| Reset-Flow Expansion | Lokal | UI-State der jeweiligen Browser-Instanz |
| Service-Call Response | Lokal | Promise-Ergebnis nur beim Aufrufer |
| Fehlermeldung | Lokal | Reaktion auf lokale Promise-Rejection |
| Entity-Daten | Global | HA pusht State-Updates an alle Instanzen |

---

## 13. Animations-Entscheidung

**Keine Animationen** für die initiale Version (v1.0):

- Expansion des Reset-Flows erfolgt abrupt
- Keine CSS-Transitions für State-Änderungen
- Keine Icon-Animationen

**Für spätere Version vorgemerkt:**
- Sanfte height-Transition (150ms) für Reset-Flow Expansion
- Optional konfigurierbar

---

## 14. Implementierungsreihenfolge

### Phase 1: Projekt-Setup
1. `package.json` erstellen
2. `tsconfig.json` erstellen
3. `rollup.config.js` erstellen
4. `.gitignore` erweitern

### Phase 2: Foundation
5. `src/types/index.ts` - Type Definitions
6. `src/utils/translations.ts` - i18n
7. `src/utils/format.ts` - Formatierung
8. `src/utils/actions.ts` - Action-Handler

### Phase 3: Styles
9. `src/styles/card.styles.ts`
10. `src/styles/calendar.styles.ts`

### Phase 4: Sub-Komponenten
11. `src/components/trophy-icon.ts`
12. `src/components/reset-flow.ts`
13. `src/components/calendar-picker.ts`

### Phase 5: Haupt-Komponenten
14. `src/streakhub-card-editor.ts`
15. `src/streakhub-card.ts`

### Phase 6: Dokumentation & Release
16. `hacs.json`
17. `LICENSE`
18. `README.md` erweitern

---

## 15. Commit-Strategie

Mehrere kleine, fokussierte Commits:

1. `chore: project setup` - Build-Konfiguration
2. `feat: add type definitions` - Interfaces
3. `feat: add utilities` - translations, format, actions
4. `feat: add styles` - CSS
5. `feat: add sub-components` - trophy, reset-flow, calendar
6. `feat: add card editor` - UI-Editor
7. `feat: add main card component` - Hauptkomponente
8. `docs: add installation guide` - README, hacs.json, LICENSE

**Wichtig:** Kein Commit ohne explizite Freigabe durch den Projektowner.

---

## 16. Risiken & Mitigationen

| Risiko | Wahrscheinlichkeit | Mitigation |
|--------|-------------------|------------|
| `hass.entities`/`hass.devices` nicht verfügbar | Mittel | Fallback auf `friendly_name` |
| Lit-Bundle-Größe zu groß | Niedrig | Terser + Tree-Shaking |
| Entity-Picker zeigt keine Entities | Niedrig | Fallback auf alle `sensor.*` |
| Service-Call Fehler nicht aussagekräftig | Mittel | Error-Message aus Promise extrahieren |

---

## Changelog

| Version | Datum | Änderungen |
|---------|-------|------------|
| 0.1 | 2026-01-02 | Initiales technisches Design erstellt |
