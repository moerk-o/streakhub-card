# StreakHub Card

A Home Assistant Lovelace card for visualizing streak progress with the [StreakHub](https://github.com/moerk-o/streakhub) integration.

## What is StreakHub?

**StreakHub** is a Home Assistant integration for tracking "streaks" - the number of consecutive days WITHOUT a specific event. Common use cases:

- Days without sugar
- Days without smoking
- Days without alcohol
- Any habit you want to track

The card displays your current streak with visual indicators showing how your current streak compares to your personal bests.

## Features

- **Trophy/Medal Icons** - Visual ranking based on your top 3 personal best streaks
- **Two Display Variants** - Standard (vertical) and compact (horizontal) layouts
- **Quick Reset Flow** - Reset streaks with Today/Yesterday/Day before buttons (default: long-press, configurable to any tap action)
- **Calendar Picker** - Select any date within your current streak for precise resets
- **Full Localization** - English and German, auto-detects from Home Assistant settings (can be overridden)
- **Visual Editor** - Nearly complete UI configuration with native Home Assistant look and feel
- **Theme Support** - Respects Home Assistant themes and supports custom CSS variables

## Requirements

- Home Assistant 2024.1 or newer
- [StreakHub Integration](https://github.com/moerk-o/streakhub) installed and configured

This card requires the **StreakHub Integration** which provides the backend for tracking streaks. The integration creates sensor entities that this card visualizes.

## Installation

### Manual Installation

1. Download `streakhub-card.js` from the [latest release](https://github.com/moerk-o/streakhub-card/releases)
2. Copy it to your Home Assistant `config/www/` folder
3. Add the resource in Home Assistant:
   - Go to **Settings** → **Dashboards** → **Resources** (top right menu)
   - Click **Add Resource**
   - URL: `/local/streakhub-card.js`
   - Resource type: **JavaScript Module**
4. Refresh your browser (hard refresh: Ctrl+F5 / Cmd+Shift+R)

> **Note:** If your `www` folder doesn't exist, create it inside your `config` directory.

## Configuration

### Using the Visual Editor

1. Add a new card to your dashboard
2. Search for "StreakHub Card" in the card picker
3. Select a StreakHub entity
4. Configure options using the UI


### YAML Configuration

#### Minimal Configuration

```yaml
type: custom:streakhub-card
entity: sensor.sugar_rank
```

#### Full Configuration

```yaml
type: custom:streakhub-card
entity: sensor.sugar_rank

# Display options
name: "Sugar Free Streak"       # Override device name (optional)
variant: standard               # standard | compact
borderless: false               # Remove card border/background
language: auto                  # auto | en | de

# Element visibility
show:
  trophy: true                  # Show trophy/medal icon
  rank: true                    # Show rank indicator (#1, #2, #3)
  days: true                    # Show days counter
  name: true                    # Show tracker name

# Actions (defaults shown)
tap_action:
  action: none
hold_action:
  action: reset-flow            # Opens the reset dialog
double_tap_action:
  action: none
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entity` | string | **required** | Entity ID of a StreakHub rank sensor |
| `name` | string | Device name | Custom name to display |
| `variant` | string | `standard` | Display variant: `standard` or `compact` |
| `borderless` | boolean | `false` | Hide card border and background |
| `show.trophy` | boolean | `true` | Show trophy/medal icon |
| `show.rank` | boolean | `true` | Show rank indicator (#1, #2, #3) |
| `show.days` | boolean | `true` | Show days counter |
| `show.name` | boolean | `true` | Show tracker name |

### Action Configuration

Actions can be configured for tap, hold, and double-tap gestures:

| Option | Default | Description |
|--------|---------|-------------|
| `tap_action` | `none` | Action on single tap |
| `hold_action` | `reset-flow` | Action on long press |
| `double_tap_action` | `none` | Action on double tap |

#### Available Actions

| Action | Description |
|--------|-------------|
| `more-info` | Open entity details dialog |
| `reset-flow` | Open streak reset dialog (custom action) |
| `none` | No action |
| `navigate` | Navigate to a path (requires `navigation_path`) |
| `url` | Open a URL (requires `url_path`) |
| `perform-action` | Call a Home Assistant action |
| `assist` | Open the Assist dialog |

#### Reset Flow Action

The `reset-flow` action is a custom action specific to StreakHub Card. It opens an inline dialog where you can quickly reset your streak:

```
┌─────────────────────────────────────────┐
│           Sugar Free Streak             │
│                                         │
│  ┌────────┬─────────┬───────────┬─────┐ │
│  │ Today  │Yesterday│Day before │More…│ │
│  └────────┴─────────┴───────────┴─────┘ │
│                                         │
│              47 days                    │
└─────────────────────────────────────────┘
```

- **Today/Yesterday/Day before**: Quick reset without confirmation
- **More...**: Opens a calendar picker for selecting any date within your streak

### Advanced Options (YAML only)

These options are only available via YAML configuration, not in the visual editor.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `language` | string | `auto` | Force language: `auto`, `en`, or `de` (see below) |
| `service_target` | string | - | Original entity ID for service calls (see below) |

#### Renamed Entities

If you've renamed your StreakHub entities in Home Assistant, you may need `service_target`. When you rename an entity in the HA UI, the display changes but internally Home Assistant may still use the original entity ID for service calls. In this case:

- `entity`: Your renamed entity ID (used to read state and display data)
- `service_target`: The original entity ID (used for the `streakhub.set_streak_start` service call)

## Localization

The card supports English and German. The language is determined by:

1. **Card configuration** (`language: en` or `language: de`)
2. **Home Assistant user settings** (auto-detected)
3. **Fallback**: English

## Display Variants

### Standard Variant

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

### Compact Variant

Horizontal layout, perfect for dashboards with limited space or tile-style layouts.

```
┌──────────────────────────────────┐
│  🏆  Sugar Free Streak   47 days │
└──────────────────────────────────┘
```

## Trophy System

Your streak ranking determines the displayed icon and color:

| Rank | Icon | Color |
|------|------|-------|
| #1 | Trophy (mdi:trophy) | Gold (#FFD700) |
| #2 | Trophy (mdi:trophy) | Silver (#C0C0C0) |
| #3 | Trophy (mdi:trophy) | Bronze (#CD7F32) |
| 4+ | Medal (mdi:medal-outline) | Neutral (theme color) |

The rank is based on your top 3 longest streaks provided by the StreakHub integration.

## Customization

### CSS Custom Properties

Customize the card appearance using CSS variables. You can use [card-mod](https://github.com/thomasloven/lovelace-card-mod) or theme variables:

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

#### Available CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--streakhub-trophy-size` | `80px` | Trophy size in standard variant |
| `--streakhub-trophy-size-compact` | `24px` | Trophy size in compact variant |
| `--streakhub-gold` | `#FFD700` | Gold trophy color (rank 1) |
| `--streakhub-silver` | `#C0C0C0` | Silver trophy color (rank 2) |
| `--streakhub-bronze` | `#CD7F32` | Bronze trophy color (rank 3) |
| `--streakhub-neutral` | `var(--secondary-text-color)` | Medal color (rank 4+) |
| `--streakhub-padding` | (theme default) | Card padding |

## License

MIT License - see [LICENSE](LICENSE) for details.

This project uses:
- [Lit](https://lit.dev/) - BSD 3-Clause License
