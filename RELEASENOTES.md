# v1.2.0

### ✨ New Features
- Added streak statistics display showing your top 3 personal records
- New `stats` configuration section with `gold`, `silver`, `bronze` toggles
- Standard mode: Statistics shown as vertical list with medal icons below current streak
- Compact mode: Inline statistics in parentheses format `(#1 54 days #2 38 days)`
- New visual editor panel "Show Statistics" for easy configuration
- Medal icons (`mdi:medal`) visually distinguish records from current streak (trophy)
- Option to hide current streak from statistics list (`hide_current`)

### 📝 Documentation
- Added concept document for streak statistics feature

**Full Changelog**: https://github.com/moerk-o/streakhub-card/compare/v1.1.0...v1.2.0

---

# v1.1.0

### ✨ New Features
- Visual editor now uses native Home Assistant form components (`ha-form` with selectors)
- Added reset-flow toggle for tap/hold/double-tap actions
- Entity picker now shows only StreakHub entities by default

### 🐞 Bug Fixes
- Fixed entity picker not loading properly
- Fixed show toggles not preserving state in editor
- Fixed action type field preservation
- Separated reset-flow from none action for clearer UX

### 🔧 Infrastructure
- Added GitHub Actions release workflow
- Version now sourced from package.json (single source of truth)

### 📝 Documentation
- Comprehensive README update with examples and screenshots
- Added German build guide
- Improved README structure and accuracy

**Full Changelog**: https://github.com/moerk-o/streakhub-card/compare/v1.0.0...v1.1.0

---

# v1.0.0

### ✨ Initial Release
- **Card variants**: Standard (vertical) and Compact (horizontal) layouts
- **Trophy/Medal icons**: Gold, Silver, Bronze trophies for ranks 1-3
- **Configurable elements**: Show/hide trophy, rank, days counter, name
- **Borderless mode**: Transparent background option
- **Reset flow**: Built-in streak reset dialog with quick buttons (Today, Yesterday, Day before)
- **Calendar picker**: Date selection for custom reset dates
- **Action system**: Configurable tap, hold, and double-tap actions
- **Visual editor**: Full configuration UI in Home Assistant
- **Internationalization**: English and German translations
- **Auto language detection**: Uses Home Assistant user language setting

### 📝 Documentation
- Installation guide for HACS and manual installation
- Configuration examples
- Project concept document

**Initial Release**
