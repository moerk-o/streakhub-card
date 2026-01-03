/**
 * Configuration editor for StreakHub Card
 *
 * Uses ha-form with schema/selectors for native HA look and feel
 */

import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { mdiGestureTap } from '@mdi/js';
import type {
  HomeAssistant,
  StreakHubCardConfig,
  CardVariant,
  SupportedLanguage,
} from './types';

// =============================================================================
// Schema Types (matching Home Assistant's ha-form)
// =============================================================================

interface HaFormSchema {
  name: string;
  selector?: Record<string, unknown>;
  type?: string;
  flatten?: boolean;
  iconPath?: string;
  schema?: HaFormSchema[];
  default?: unknown;
}

// =============================================================================
// Action Schema Helpers
// =============================================================================

/**
 * Create an action selector schema entry
 * Uses ui_action selector with custom actions for reset-flow
 */
function createActionSchema(
  name: string,
  defaultAction: string
): HaFormSchema {
  return {
    name,
    selector: {
      ui_action: {
        default_action: defaultAction,
        actions: [
          'more-info',
          'toggle',
          'navigate',
          'url',
          'call-service',
          'assist',
          'none',
        ],
      },
    },
  };
}

// =============================================================================
// Form Schema Definition
// =============================================================================

/**
 * Build the complete form schema
 */
function buildSchema(): HaFormSchema[] {
  return [
    // Entity selector
    {
      name: 'entity',
      selector: {
        entity: {
          filter: [{ integration: 'streakhub' }],
        },
      },
    },
    // Name override
    {
      name: 'name',
      selector: { text: {} },
    },
    // Variant selector
    {
      name: 'variant',
      selector: {
        select: {
          mode: 'dropdown',
          options: [
            { value: 'standard', label: 'Standard' },
            { value: 'compact', label: 'Compact' },
          ],
        },
      },
    },
    // Language selector
    {
      name: 'language',
      selector: {
        select: {
          mode: 'dropdown',
          options: [
            { value: 'auto', label: 'Auto' },
            { value: 'en', label: 'English' },
            { value: 'de', label: 'Deutsch' },
          ],
        },
      },
    },
    // Borderless toggle
    {
      name: 'borderless',
      selector: { boolean: {} },
    },
    // Visibility section (expandable)
    {
      name: 'show',
      type: 'expandable',
      flatten: true,
      iconPath:
        'M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z',
      schema: [
        { name: 'trophy', selector: { boolean: {} }, default: true },
        { name: 'rank', selector: { boolean: {} }, default: true },
        { name: 'days', selector: { boolean: {} }, default: true },
        { name: 'name', selector: { boolean: {} }, default: true },
      ],
    },
    // Actions section (expandable)
    {
      name: 'interactions',
      type: 'expandable',
      flatten: true,
      iconPath: mdiGestureTap,
      schema: [
        createActionSchema('tap_action', 'more-info'),
        createActionSchema('hold_action', 'none'),
        createActionSchema('double_tap_action', 'none'),
      ],
    },
  ];
}

// =============================================================================
// Labels for form fields
// =============================================================================

const LABELS: Record<string, string> = {
  entity: 'Entity',
  name: 'Name (optional)',
  variant: 'Variant',
  language: 'Language',
  borderless: 'Borderless',
  show: 'Visibility',
  trophy: 'Trophy/Medal',
  rank: 'Rank (#1, #2, #3)',
  days: 'Days Counter',
  interactions: 'Interactions',
  tap_action: 'Tap action',
  hold_action: 'Hold action',
  double_tap_action: 'Double tap action',
};

/**
 * Visual editor for StreakHub Card configuration
 *
 * @element streakhub-card-editor
 */
@customElement('streakhub-card-editor')
export class StreakHubCardEditor extends LitElement {
  @property({ attribute: false })
  hass?: HomeAssistant;

  @state()
  private _config?: StreakHubCardConfig;

  @state()
  private _helpers?: unknown;

  private _schema = buildSchema();

  /**
   * Preload HA elements (entity picker, etc.) using loadCardHelpers
   * This is required because custom cards don't have automatic access to HA components
   */
  private async _loadCardHelpers(): Promise<void> {
    if (this._helpers) return;

    // Check if ha-form is already available
    if (window.customElements.get('ha-form')) {
      this._helpers = true;
      return;
    }

    try {
      // Load card helpers from Home Assistant
      const helpers = await (
        window as unknown as { loadCardHelpers: () => Promise<unknown> }
      ).loadCardHelpers();
      this._helpers = helpers;

      // Create a temporary entities card to trigger loading of HA components
      const cardHelpers = helpers as {
        createCardElement: (
          config: unknown
        ) => Promise<{ constructor: { getConfigElement: () => Promise<void> } }>;
      };
      const card = await cardHelpers.createCardElement({
        type: 'entities',
        entities: [],
      });
      await card.constructor.getConfigElement();
    } catch (e) {
      // Fallback: helpers not available, but component might still work
      console.warn('StreakHub Card: Could not load card helpers', e);
      this._helpers = true;
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this._loadCardHelpers();
  }

  static override styles = css`
    :host {
      display: block;
    }

    ha-form {
      display: block;
    }

    .reset-flow-info {
      margin: 16px 0;
      padding: 12px;
      background: var(--secondary-background-color);
      border-radius: 8px;
      font-size: 0.9rem;
      color: var(--secondary-text-color);
    }

    .reset-flow-info ha-icon {
      --mdc-icon-size: 18px;
      margin-right: 8px;
      color: var(--primary-color);
    }
  `;

  /**
   * Set the configuration from the card
   */
  setConfig(config: StreakHubCardConfig): void {
    this._config = config;
  }

  /**
   * Compute label for form fields
   */
  private _computeLabel = (schema: HaFormSchema): string => {
    return LABELS[schema.name] ?? schema.name;
  };

  /**
   * Handle value changes from ha-form
   */
  private _valueChanged(ev: CustomEvent): void {
    const config = ev.detail.value as StreakHubCardConfig;

    // Handle special case: reset-flow action
    // Since ui_action doesn't include reset-flow, we need to handle it separately
    // For now, hold_action defaults to reset-flow internally

    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Get data for ha-form with defaults applied
   */
  private _getData(): Record<string, unknown> {
    if (!this._config) return {};

    return {
      entity: this._config.entity ?? '',
      name: this._config.name ?? '',
      variant: this._config.variant ?? 'standard',
      language: this._config.language ?? 'auto',
      borderless: this._config.borderless ?? false,
      show: {
        trophy: this._config.show?.trophy ?? true,
        rank: this._config.show?.rank ?? true,
        days: this._config.show?.days ?? true,
        name: this._config.show?.name ?? true,
      },
      tap_action: this._config.tap_action ?? { action: 'more-info' },
      hold_action: this._config.hold_action ?? { action: 'none' },
      double_tap_action: this._config.double_tap_action ?? { action: 'none' },
    };
  }

  protected override render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    // Wait for helpers to load before rendering
    if (!this._helpers) {
      return html`<div>Loading...</div>`;
    }

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._getData()}
        .schema=${this._schema}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>
      <div class="reset-flow-info">
        <ha-icon icon="mdi:information-outline"></ha-icon>
        <span
          >Tip: Set "Hold action" to "None" to use the built-in streak reset
          flow on long press.</span
        >
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'streakhub-card-editor': StreakHubCardEditor;
  }
}
