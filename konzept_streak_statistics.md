# Konzept: Streak Statistics Feature

> Erweiterung der StreakHub Card um die Anzeige der Top-3 Bestenliste

**Status:** Konzept finalisiert
**Datum:** 2026-01-28
**Basis:** Diskussion mit Projektowner

---

## 1. Übersicht

### 1.1 Motivation

Aktuell zeigt die StreakHub Card nur den **aktuellen Streak** an (Tage + Rang + Pokal). Die `top_3`-Daten aus der Entity werden zwar gelesen, aber nur zur Ermittlung des aktuellen Streaks verwendet.

**Neues Feature:** Optionale Anzeige der Top-3 Bestenliste, um dem Nutzer einen Überblick über seine persönlichen Rekorde zu geben.

### 1.2 Anwendungsfälle

- "Wie weit bin ich noch vom Rekord entfernt?"
- "Was waren meine besten Streaks bisher?"
- "Ich will alle meine Bestzeiten auf einen Blick sehen"

---

## 2. Visuelle Darstellung

### 2.1 Standard-Modus

Die Statistiken werden als Liste unterhalb des Hauptinhalts angezeigt, durch eine Trennlinie abgesetzt:

```
┌─────────────────────────┐
│    Zucker-Verzicht      │  ← Name
│                         │
│           🏆            │  ← Pokal (aktueller Rang)
│           #2            │  ← Rang-Anzeige
│                         │
│        47 Tage          │  ← Aktueller Streak
│─────────────────────────│  ← Trennlinie
│  🥇 54 Tage             │  ← Gold (Rang 1)
│  🥉 13 Tage             │  ← Bronze (Rang 3)
└─────────────────────────┘     (Rang 2 ausgeblendet, da aktuell)
```

**Details:**
- Trennlinie nur wenn mindestens ein Statistik-Eintrag sichtbar
- Einträge mit kleinerem Medaillen-Icon als der Haupt-Pokal
- Tage rechtsbündig oder nach Medaille

### 2.2 Compact-Modus

Die Statistiken werden inline in Klammern angezeigt, zwischen Pokal/Name und dem aktuellen Streak:

```
┌────────────────────────────────────────────────────────────────┐
│  🏆  Zucker-Verzicht  (#1 54 Tage  #3 13 Tage)       47 Tage #2│
│  └─────── linksbündig ───────────────┘              └─ rechts ─┘
└────────────────────────────────────────────────────────────────┘
```

**Details:**
- Klammern als visuelle Abgrenzung der Statistiken
- Kompakte Darstellung: `#1 54 Tage` statt `🥇 54 Tage`
- Linksbündig: Pokal, Name, Statistiken (in Klammern)
- Rechtsbündig: Aktueller Streak + Rang

**Alternative ohne Name (falls zu lang):**
```
┌────────────────────────────────────────────────────────────────┐
│  🏆  (#1 54 Tage  #2 38 Tage  #3 13 Tage)            47 Tage #2│
└────────────────────────────────────────────────────────────────┘
```

---

## 3. Konfiguration

### 3.1 Neue Config-Optionen

```yaml
type: custom:streakhub-card
entity: sensor.zucker_rank

# Bestehende Optionen...

# NEU: Statistiken
stats:
  gold: false           # Rang 1 (Rekord) anzeigen
  silver: false         # Rang 2 anzeigen
  bronze: false         # Rang 3 anzeigen
  hide_current: true    # Aktuellen Streak aus Liste ausblenden
```

### 3.2 Option: `stats.gold` / `stats.silver` / `stats.bronze`

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `gold` | boolean | `false` | Rang 1 (Rekord) in Statistiken anzeigen |
| `silver` | boolean | `false` | Rang 2 in Statistiken anzeigen |
| `bronze` | boolean | `false` | Rang 3 in Statistiken anzeigen |

**Verhalten:**
- Wenn alle drei `false` sind, werden keine Statistiken angezeigt (wie bisher)
- Statistiken werden nur angezeigt wenn der jeweilige Rang in `top_3` existiert

### 3.3 Option: `stats.hide_current`

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `hide_current` | boolean | `true` | Aktuellen Streak nicht doppelt anzeigen |

**Verhalten:**
- `true`: Wenn der aktuelle Streak z.B. Rang 2 hat, wird Rang 2 nicht in der Statistik-Liste angezeigt (ist ja schon oben prominent sichtbar)
- `false`: Alle konfigurierten Ränge werden angezeigt, auch wenn einer davon der aktuelle ist

**Beispiel mit `hide_current: true`:**
- Aktueller Streak ist auf Rang 2 (47 Tage)
- `gold: true`, `silver: true`, `bronze: true`
- Angezeigt werden: 🥇 54 Tage, 🥉 13 Tage
- Rang 2 wird übersprungen (ist der aktuelle)

---

## 4. UI-Editor

### 4.1 Neues Expansion Panel

Ein neues aufklappbares Panel im Editor, nach "Interactions":

```
▶ Interactions
▼ Show Statistics
    ☑ Gold
    ☑ Silver
    ☑ Bronze
    ☐ Hide current streak
```

### 4.2 Editor-Schema

```typescript
// Neues Expansion Panel für Statistiken
{
  name: 'stats',
  type: 'expandable',
  title: 'Show Statistics',
  icon: 'mdi:chart-box-outline',
  schema: [
    { name: 'stats.gold', selector: { boolean: {} } },
    { name: 'stats.silver', selector: { boolean: {} } },
    { name: 'stats.bronze', selector: { boolean: {} } },
    { name: 'stats.hide_current', selector: { boolean: {} } },
  ]
}
```

---

## 5. Internationalisierung

### 5.1 Neue Übersetzungen

| Key | EN | DE |
|-----|----|----|
| `stats_title` | Show Statistics | Statistiken anzeigen |
| `stats_gold` | Gold | Gold |
| `stats_silver` | Silver | Silber |
| `stats_bronze` | Bronze | Bronze |
| `stats_hide_current` | Hide current streak | Aktuellen ausblenden |

### 5.2 Icon-Unterscheidung: Pokal vs. Medaille

**Wichtige Design-Entscheidung:** Visuelle Trennung zwischen aktuellem Streak und Statistik-Liste.

| Bereich | Icon | Farben |
|---------|------|--------|
| Aktueller Streak (Hauptanzeige) | `mdi:trophy` | Gold / Silber / Bronze via CSS |
| Statistik-Liste (Rekorde) | `mdi:medal` | Gold / Silber / Bronze via CSS |

**Begründung:**
- Der große **Pokal** steht für "Dein aktueller Streak"
- Die **Medaillen** in der Liste stehen für "Deine Rekorde"
- Intuitive, visuell klare Unterscheidung

**Technisch:** Beide Icons werden über die gleichen CSS-Variablen eingefärbt:
```css
--streakhub-gold: #FFD700;
--streakhub-silver: #C0C0C0;
--streakhub-bronze: #CD7F32;
```

### 5.3 Anzeige-Texte

Im Compact-Modus werden die Ränge als `#1`, `#2`, `#3` angezeigt (sprachunabhängig, kein Icon).

---

## 6. Technische Details

### 6.1 Datenstruktur

Die Daten kommen aus `entity.attributes.top_3`:

```json
[
  { "rank": 1, "start": "2025-11-01", "end": "2025-12-24", "days": 54 },
  { "rank": 2, "start": "2026-01-02", "end": null, "days": 47 },
  { "rank": 3, "start": "2025-01-01", "end": "2025-01-13", "days": 13 }
]
```

- `end: null` markiert den aktuellen Streak
- `rank` gibt die Position in der Bestenliste an

### 6.2 Logik für Anzeige

```typescript
function getVisibleStats(top3: StreakEntry[], config: StatsConfig): StreakEntry[] {
  const currentRank = top3.find(e => e.end === null)?.rank;

  return top3.filter(entry => {
    // Prüfe ob dieser Rang konfiguriert ist
    if (entry.rank === 1 && !config.gold) return false;
    if (entry.rank === 2 && !config.silver) return false;
    if (entry.rank === 3 && !config.bronze) return false;

    // Prüfe ob aktueller Streak ausgeblendet werden soll
    if (config.hide_current && entry.rank === currentRank) return false;

    return true;
  });
}
```

### 6.3 Komponenten-Struktur für Icons

**Option A: Bestehende Komponente erweitern**
```typescript
// streakhub-trophy.ts erweitern mit neuer Property
@property({ type: String }) type: 'trophy' | 'medal' = 'trophy';

private get _icon(): string {
  if (this.type === 'medal') {
    return 'mdi:medal';
  }
  return this.rank >= 1 && this.rank <= 3 ? 'mdi:trophy' : 'mdi:medal-outline';
}
```

**Option B: Separate Komponente**
```typescript
// Neue Datei: streakhub-medal.ts
// Einfacher, klare Trennung der Verantwortlichkeiten
```

**Empfehlung:** Option A (Erweiterung) - weniger Duplikation, gleiche CSS-Variablen.

### 6.4 Betroffene Dateien

| Datei | Änderungen |
|-------|------------|
| `src/types/index.ts` | Neues `StatsConfig` Interface |
| `src/streakhub-card.ts` | Render-Logik für Stats |
| `src/streakhub-card-editor.ts` | Neues Expansion Panel |
| `src/styles/card.styles.ts` | Styles für Stats-Bereich |
| `src/utils/translations.ts` | Neue Übersetzungen |
| `src/components/trophy-icon.ts` | Neue `type` Property für Medal-Modus |

---

## 7. Edge Cases

| Situation | Verhalten |
|-----------|-----------|
| `top_3` hat weniger als 3 Einträge | Nur vorhandene Ränge anzeigen |
| `top_3` ist leer | Keine Statistiken anzeigen |
| Alle 3 Ränge = aktueller Streak | Mit `hide_current: true` wird nichts angezeigt |
| Aktueller Streak nicht in Top 3 | Alle konfigurierten Ränge werden angezeigt |

---

## 8. Offene Punkte / Zukunft

- [ ] Option für Datumsanzeige (`🥇 54 Tage (Nov 2025)`)
- [ ] Animations beim Ein-/Ausblenden
- [ ] Tooltip mit Details beim Hover

---

## Changelog

| Version | Datum | Änderungen |
|---------|-------|------------|
| 0.1 | 2026-01-28 | Initiales Konzept erstellt |
