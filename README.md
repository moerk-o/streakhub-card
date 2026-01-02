# StreakHub Card

A Home Assistant Lovelace card for visualizing streak progress with the [StreakHub](https://github.com/your-repo/streakhub) integration.

![StreakHub Card Preview](docs/preview.png)

## Features

- **Trophy/Medal System** - Gold, silver, and bronze trophies for top 3 streaks
- **Two Display Modes** - Standard (vertical) and compact (horizontal) layouts
- **Quick Reset Flow** - Long-press to quickly reset streaks with Today/Yesterday/Day before buttons
- **Calendar Picker** - Select any date within your current streak for precise resets
- **Full Localization** - English and German, auto-detects from Home Assistant settings
- **Visual Editor** - Full UI configuration, no YAML required
- **Theme Support** - Respects Home Assistant themes and supports custom CSS variables

## Installation

### HACS (Recommended)

1. Open HACS in Home Assistant
2. Go to "Frontend" section
3. Click the three dots menu and select "Custom repositories"
4. Add this repository URL with category "Lovelace"
5. Search for "StreakHub Card" and install
6. Refresh your browser

### Manual Installation

1. Download `streakhub-card.js` from the [latest release](https://github.com/your-repo/streakhub-card/releases)
2. Copy it to your `config/www/` folder
3. Add the resource in Home Assistant:
   - Go to **Settings** → **Dashboards** → **Resources**
   - Click **Add Resource**
   - URL: `/local/streakhub-card.js`
   - Resource type: **JavaScript Module**
4. Refresh your browser

## Usage

### Minimal Configuration

```yaml
type: custom:streakhub-card
entity: sensor.sugar_rank
```

### Full Configuration

```yaml
type: custom:streakhub-card
entity: sensor.sugar_rank

# Display options
name: "Sugar Free Streak"       # Override device name
variant: standard               # standard | compact
borderless: false               # Remove card border/background

# Visibility
show:
  trophy: true                  # Show trophy/medal icon
  rank: true                    # Show rank indicator (#1, #2, #3)
  days: true                    # Show days counter
  name: true                    # Show tracker name

# Actions
tap_action:
  action: more-info             # more-info | reset-flow | none | navigate | url | call-service
hold_action:
  action: reset-flow
double_tap_action:
  action: none

# Language
language: auto                  # auto | en | de
```

### Advanced: Renamed Entities

If you've renamed your StreakHub entities, use `service_target` to specify the original entity for service calls:

```yaml
type: custom:streakhub-card
entity: sensor.my_custom_name       # Your renamed entity
service_target: sensor.sugar_rank   # Original entity for service calls
```

## Display Modes

### Standard Mode

Vertical layout with large trophy icon, ideal as a standalone feature card.

```
┌─────────────────────────┐
│    Sugar Free Streak    │
│                         │
│           🏆            │
│           #1            │
│                         │
│        47 days          │
└─────────────────────────┘
```

### Compact Mode

Horizontal layout, perfect for dashboards with limited space.

```
┌──────────────────────────────────┐
│  🏆  Sugar Free Streak   47 days │
└──────────────────────────────────┘
```

## Trophy System

| Rank | Icon | Color |
|------|------|-------|
| #1 | Trophy | Gold (#FFD700) |
| #2 | Trophy | Silver (#C0C0C0) |
| #3 | Trophy | Bronze (#CD7F32) |
| 4+ | Medal | Neutral (theme color) |

## CSS Custom Properties

Customize the card appearance using CSS variables:

```yaml
type: custom:streakhub-card
entity: sensor.sugar_rank
card_mod:
  style: |
    :host {
      --streakhub-trophy-size: 100px;
      --streakhub-gold: #FFD700;
      --streakhub-silver: #C0C0C0;
      --streakhub-bronze: #CD7F32;
    }
```

Available variables:
- `--streakhub-trophy-size` - Trophy size in standard mode (default: 80px)
- `--streakhub-trophy-size-compact` - Trophy size in compact mode (default: 24px)
- `--streakhub-gold` - Gold trophy color
- `--streakhub-silver` - Silver trophy color
- `--streakhub-bronze` - Bronze trophy color
- `--streakhub-neutral` - Medal color for rank 4+
- `--streakhub-padding` - Card padding

## Requirements

- Home Assistant 2024.1 or newer
- [StreakHub Integration](https://github.com/your-repo/streakhub) installed and configured

## Development

```bash
# Install dependencies
npm install

# Build for development (with sourcemaps)
npm run watch

# Build for production
npm run build

# Type checking
npm run typecheck

# Linting
npm run lint
```

## License

MIT License - see [LICENSE](LICENSE) for details.

This project uses [Lit](https://lit.dev/) which is licensed under BSD 3-Clause.
