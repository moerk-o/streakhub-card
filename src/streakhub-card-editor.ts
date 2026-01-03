/**
 * Configuration editor for StreakHub Card
 *
 * Uses ha-form with schema/selectors for native HA look and feel.
 * Actions use a toggle to switch between "Reset flow" (our custom action)
 * and standard HA actions via ui_action selector.
 */

import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { mdiGestureTap } from '@mdi/js';
import type {
  HomeAssistant,
  StreakHubCardConfig,
  ActionConfig,
  EditorTranslations,
} from './types';
import { getEditorTranslations } from './utils/translations';

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
// Form Schema Definition (basic settings only, actions are separate)
// =============================================================================

function buildBasicSchema(): HaFormSchema[] {
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
      iconPath:
        'M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z',
      schema: [
        { name: 'trophy', selector: { boolean: {} }, default: true },
        { name: 'rank', selector: { boolean: {} }, default: true },
        { name: 'days', selector: { boolean: {} }, default: true },
        { name: 'name', selector: { boolean: {} }, default: true },
      ],
    },
  ];
}

// Schema for single action (used when reset-flow toggle is off)
const ACTION_SCHEMA: HaFormSchema[] = [
  {
    name: 'action',
    selector: {
      ui_action: {},
    },
  },
];

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

  private _basicSchema = buildBasicSchema();

  /**
   * Preload HA elements (entity picker, etc.) using loadCardHelpers
   */
  private async _loadCardHelpers(): Promise<void> {
    if (this._helpers) return;

    if (window.customElements.get('ha-form')) {
      this._helpers = true;
      return;
    }

    try {
      const helpers = await (
        window as unknown as { loadCardHelpers: () => Promise<unknown> }
      ).loadCardHelpers();
      this._helpers = helpers;

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

    ha-expansion-panel {
      margin-top: 8px;
    }

    ha-expansion-panel [slot='header'] {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    ha-expansion-panel .content {
      padding: 12px;
    }

    ha-svg-icon {
      color: var(--secondary-text-color);
    }

    .action-row {
      margin-bottom: 16px;
    }

    .action-row:last-child {
      margin-bottom: 0;
    }

    .action-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .action-label {
      font-weight: 500;
    }

    .reset-flow-toggle {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9em;
      color: var(--secondary-text-color);
    }

    .action-config {
      margin-top: 8px;
    }

    .reset-flow-active {
      padding: 12px;
      background: var(--primary-color);
      color: var(--text-primary-color);
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .reset-flow-active ha-icon {
      --mdc-icon-size: 20px;
    }
  `;

  setConfig(config: StreakHubCardConfig): void {
    this._config = config;
  }

  /**
   * Get translations for current language
   */
  private get _translations(): EditorTranslations {
    return getEditorTranslations(this.hass);
  }

  /**
   * Check if an action is set to reset-flow
   */
  private _isResetFlow(action: ActionConfig | undefined): boolean {
    return action?.action === 'none' || action?.action === 'reset-flow';
  }

  /**
   * Build label map based on current translations
   */
  private _getLabelMap(): Record<string, string> {
    const t = this._translations;
    return {
      entity: t.entity,
      name: t.name,
      variant: t.variant,
      language: t.language,
      borderless: t.borderless,
      show: t.show,
      trophy: t.trophy,
      rank: t.rank,
      days: t.days_counter,
      action: '', // Empty label for nested action selector
    };
  }

  private _computeLabel = (schema: HaFormSchema): string => {
    const labels = this._getLabelMap();
    return labels[schema.name] ?? schema.name;
  };

  /**
   * Handle basic form value changes
   */
  private _valueChanged(ev: CustomEvent): void {
    const formData = ev.detail.value as Record<string, unknown>;

    const config: StreakHubCardConfig = {
      ...this._config,
      ...formData,
    } as StreakHubCardConfig;

    this._updateConfig(config);
  }

  /**
   * Handle reset-flow toggle change
   */
  private _handleResetFlowToggle(
    actionKey: 'tap_action' | 'hold_action' | 'double_tap_action',
    enabled: boolean
  ): void {
    const config = { ...this._config } as StreakHubCardConfig;

    if (enabled) {
      // Set to reset-flow (we use 'none' internally, card handles it)
      config[actionKey] = { action: 'none' };
    } else {
      // Set to more-info as default when disabling reset-flow
      config[actionKey] = { action: 'more-info' };
    }

    this._updateConfig(config);
  }

  /**
   * Handle action config change from ui_action selector
   */
  private _handleActionChange(
    actionKey: 'tap_action' | 'hold_action' | 'double_tap_action',
    ev: CustomEvent
  ): void {
    ev.stopPropagation();
    const formData = ev.detail.value as { action: ActionConfig };

    const config = { ...this._config } as StreakHubCardConfig;
    config[actionKey] = formData.action;

    this._updateConfig(config);
  }

  private _updateConfig(config: StreakHubCardConfig): void {
    this._config = config;

    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _getBasicData(): Record<string, unknown> {
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
    };
  }

  /**
   * Render a single action editor row
   */
  private _renderActionRow(
    actionKey: 'tap_action' | 'hold_action' | 'double_tap_action',
    label: string,
    defaultResetFlow: boolean
  ) {
    const action = this._config?.[actionKey];
    const isResetFlow = action ? this._isResetFlow(action) : defaultResetFlow;
    const t = this._translations;

    return html`
      <div class="action-row">
        <div class="action-header">
          <span class="action-label">${label}</span>
          <div class="reset-flow-toggle">
            <span>${t.reset_flow}</span>
            <ha-switch
              .checked=${isResetFlow}
              @change=${(e: Event) =>
                this._handleResetFlowToggle(
                  actionKey,
                  (e.target as HTMLInputElement).checked
                )}
            ></ha-switch>
          </div>
        </div>
        ${isResetFlow
          ? html`
              <div class="reset-flow-active">
                <ha-icon icon="mdi:gesture-tap-hold"></ha-icon>
                <span>${t.reset_flow_description}</span>
              </div>
            `
          : html`
              <div class="action-config">
                <ha-form
                  .hass=${this.hass}
                  .data=${{ action: action ?? { action: 'more-info' } }}
                  .schema=${ACTION_SCHEMA}
                  .computeLabel=${this._computeLabel}
                  @value-changed=${(ev: CustomEvent) =>
                    this._handleActionChange(actionKey, ev)}
                ></ha-form>
              </div>
            `}
      </div>
    `;
  }

  protected override render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    if (!this._helpers) {
      return html`<div>Loading...</div>`;
    }

    const t = this._translations;

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._getBasicData()}
        .schema=${this._basicSchema}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>

      <ha-expansion-panel outlined>
        <div slot="header" role="heading" aria-level="3">
          <ha-svg-icon .path=${mdiGestureTap}></ha-svg-icon>
          ${t.interactions}
        </div>
        <div class="content">
          ${this._renderActionRow('tap_action', t.tap_action, false)}
          ${this._renderActionRow('hold_action', t.hold_action, true)}
          ${this._renderActionRow('double_tap_action', t.double_tap_action, false)}
        </div>
      </ha-expansion-panel>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'streakhub-card-editor': StreakHubCardEditor;
  }
}
