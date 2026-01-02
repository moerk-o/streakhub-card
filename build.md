# Build-Anleitung für StreakHub Card

Diese Anleitung erklärt Schritt für Schritt, wie die StreakHub Card gebaut wird und warum wir die einzelnen Schritte durchführen.

---

## Inhaltsverzeichnis

1. [Was bedeutet "Bauen"?](#1-was-bedeutet-bauen)
2. [Voraussetzungen](#2-voraussetzungen)
3. [Node.js Installation mit nvm](#3-nodejs-installation-mit-nvm)
4. [Projekt-Dependencies installieren](#4-projekt-dependencies-installieren)
5. [Build ausführen](#5-build-ausführen)
6. [Was passiert beim Build?](#6-was-passiert-beim-build)
7. [Entwicklungsmodus](#7-entwicklungsmodus)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Was bedeutet "Bauen"?

Unsere Card ist in **TypeScript** geschrieben und verwendet **Lit** als UI-Framework. Browser verstehen aber nur reines JavaScript. Der Build-Prozess macht Folgendes:

1. **TypeScript → JavaScript**: Übersetzt unseren TypeScript-Code in JavaScript
2. **Bundling**: Fasst alle Dateien (unsere + Lit-Library) in eine einzige Datei zusammen
3. **Minifizierung**: Komprimiert den Code für kleinere Dateigröße

**Vorher:** ~20 Dateien in `src/` mit TypeScript-Code + externe Lit-Library
**Nachher:** Eine einzige Datei `dist/streakhub-card.js` die Home Assistant laden kann

---

## 2. Voraussetzungen

| Was | Warum |
|-----|-------|
| **Node.js** | JavaScript-Runtime, führt unsere Build-Tools aus |
| **npm** | Paketmanager, installiert Dependencies (kommt mit Node.js) |
| **Git** | Zum Klonen des Repos (vermutlich schon vorhanden) |

---

## 3. Node.js Installation mit nvm

Wir verwenden **nvm (Node Version Manager)** statt einer systemweiten Installation:

- ✅ Installiert im Home-Verzeichnis (kein `sudo` nötig)
- ✅ Mehrere Node-Versionen parallel möglich
- ✅ Einfaches Wechseln zwischen Versionen
- ✅ Saubere Deinstallation möglich

### 3.1 nvm installieren

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```

### 3.2 Terminal neu starten

Schließe das Terminal und öffne ein neues, damit nvm verfügbar ist.

**Alternativ** (ohne Terminal-Neustart):
```bash
source ~/.bashrc
```

### 3.3 Node.js installieren

```bash
nvm install --lts
```

Dies installiert die aktuelle LTS-Version (Long Term Support = stabil).

### 3.4 Installation prüfen

```bash
node --version   # Sollte v24.x.x oder ähnlich zeigen
npm --version    # Sollte 11.x.x oder ähnlich zeigen
```

---

## 4. Projekt-Dependencies installieren

Im Projektverzeichnis:

```bash
cd /pfad/zu/StreakHubCard
npm install
```

### Was passiert hier?

npm liest die `package.json` und installiert alle benötigten Pakete:

| Paket | Zweck |
|-------|-------|
| `lit` | UI-Framework für Web Components |
| `typescript` | TypeScript-Compiler |
| `rollup` | Bundler (fasst Dateien zusammen) |
| `@rollup/plugin-typescript` | Rollup-Plugin für TypeScript |
| `@rollup/plugin-node-resolve` | Löst npm-Pakete auf |
| `@rollup/plugin-terser` | Minifiziert den Code |
| `tslib` | TypeScript Helper-Funktionen |

Die Pakete landen in `node_modules/` (ca. 50MB). Dieser Ordner ist in `.gitignore` und wird nicht committed.

---

## 5. Build ausführen

### Produktions-Build

```bash
npm run build
```

Erzeugt: `dist/streakhub-card.js` (minifiziert, ~53KB)

### Entwicklungs-Build mit Watch-Mode

```bash
npm run watch
```

- Baut bei jeder Dateiänderung automatisch neu
- Enthält Sourcemaps für einfacheres Debugging
- Nicht minifiziert (besser lesbar)

---

## 6. Was passiert beim Build?

Der Build-Prozess wird durch `rollup.config.js` gesteuert:

```
┌─────────────────────────────────────────────────────────────────┐
│                        BUILD PIPELINE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  src/streakhub-card.ts                                         │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────┐                                           │
│  │ TypeScript      │  Übersetzt .ts → .js                      │
│  │ Plugin          │  Prüft Typen                              │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │ Node Resolve    │  Findet "lit" in node_modules/            │
│  │ Plugin          │  Bindet externe Pakete ein                │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │ Rollup          │  Fasst alle Imports zusammen              │
│  │ Bundler         │  Tree-Shaking (entfernt ungenutzten Code) │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │ Terser          │  Minifiziert (nur Production)             │
│  │ Plugin          │  Entfernt Whitespace, kürzt Namen         │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  dist/streakhub-card.js                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Warum Bundling?

**Ohne Bundling:**
- Browser müsste ~20 HTTP-Requests machen
- Lit müsste separat geladen werden
- Home Assistant kennt unsere imports nicht

**Mit Bundling:**
- Eine Datei, ein Request
- Lit ist eingebettet
- Funktioniert standalone in Home Assistant

---

## 7. Entwicklungsmodus

Für die Entwicklung empfohlen:

```bash
npm run watch
```

### Workflow

1. Terminal offen lassen mit `npm run watch`
2. Code in `src/` bearbeiten
3. Rollup baut automatisch neu (~2-3 Sekunden)
4. Browser-Cache leeren und Seite neu laden
5. Änderungen testen

### Weitere hilfreiche Befehle

```bash
# Nur Typen prüfen (ohne zu bauen)
npm run typecheck

# Code-Style prüfen
npm run lint
```

---

## 8. Troubleshooting

### "npm: command not found"

nvm ist nicht geladen. Lösung:
```bash
source ~/.bashrc
# oder
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

### "Cannot find module 'lit'"

Dependencies nicht installiert. Lösung:
```bash
npm install
```

### TypeScript-Fehler beim Build

Der Build schlägt fehl wenn TypeScript Fehler findet. Das ist beabsichtigt - so werden Bugs früh erkannt. Fehler beheben, dann erneut bauen.

### Änderungen erscheinen nicht in Home Assistant

Browser-Cache leeren:
- Chrome: `Ctrl+Shift+R` (Hard Reload)
- Oder: Developer Tools → Network → "Disable cache" aktivieren

### node_modules versehentlich gelöscht

Kein Problem:
```bash
npm install
```

Installiert alles neu basierend auf `package.json`.

---

## Zusammenfassung

```bash
# Einmalig: nvm + Node.js installieren
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install --lts

# Im Projektverzeichnis: Dependencies installieren
npm install

# Bauen
npm run build      # Einmal bauen (Production)
npm run watch      # Kontinuierlich bauen (Development)
```

Das Ergebnis `dist/streakhub-card.js` kann dann in Home Assistant als Lovelace-Resource eingebunden werden.
