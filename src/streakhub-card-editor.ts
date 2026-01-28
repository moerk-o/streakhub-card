/**
 * Configuration editor for StreakHub Card
 *
 * Uses ha-form with schema/selectors for native HA look and feel.
 * Actions use a toggle to switch between "Reset flow" (our custom action)
 * and standard HA actions via ui_action selector.
 */

import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { mdiGestureTap, mdiChartBoxOutline } from '@mdi/js';
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
  ];
}

// Visibility options schema (rendered separately in 2-column grid)
const VISIBILITY_SCHEMA: HaFormSchema[] = [
  { name: 'show.name', selector: { boolean: {} }, default: true },
  { name: 'show.trophy', selector: { boolean: {} }, default: true },
  { name: 'show.rank', selector: { boolean: {} }, default: true },
  { name: 'show.days', selector: { boolean: {} }, default: true },
  { name: 'borderless', selector: { boolean: {} }, default: false },
];

// Statistics options schema
const STATS_SCHEMA: HaFormSchema[] = [
  { name: 'stats.gold', selector: { boolean: {} }, default: false },
  { name: 'stats.silver', selector: { boolean: {} }, default: false },
  { name: 'stats.bronze', selector: { boolean: {} }, default: false },
  { name: 'stats.hide_current', selector: { boolean: {} }, default: true },
];

// Schema for single action (used when reset-flow toggle is off)
// Excludes 'toggle' since it doesn't make sense for streak sensors
const ACTION_SCHEMA: HaFormSchema[] = [
  {
    name: 'action',
    selector: {
      ui_action: {
        default_action: 'none',
        actions: ['more-info', 'navigate', 'url', 'perform-action', 'assist'],
      },
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

    .visibility-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 16px;
      margin-top: 8px;
    }

    .visibility-grid ha-form {
      min-width: 0;
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
    return action?.action === 'reset-flow';
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
      borderless: t.borderless,
      'show.name': t.name.replace(' (optional)', ''),
      'show.trophy': t.trophy,
      'show.rank': t.rank,
      'show.days': t.days_counter,
      'stats.gold': t.stats_gold,
      'stats.silver': t.stats_silver,
      'stats.bronze': t.stats_bronze,
      'stats.hide_current': t.stats_hide_current,
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
   * Handle visibility form value changes
   */
  private _visibilityChanged(ev: CustomEvent): void {
    const formData = ev.detail.value as Record<string, unknown>;

    const config: StreakHubCardConfig = {
      ...this._config,
      borderless: formData['borderless'] as boolean,
      show: {
        ...this._config?.show,
        name: formData['show.name'] as boolean,
        trophy: formData['show.trophy'] as boolean,
        rank: formData['show.rank'] as boolean,
        days: formData['show.days'] as boolean,
      },
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
      // Set to reset-flow (our custom action type)
      config[actionKey] = { action: 'reset-flow' };
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
    };
  }

  private _getVisibilityData(): Record<string, unknown> {
    if (!this._config) return {};

    return {
      'show.name': this._config.show?.name ?? true,
      'show.trophy': this._config.show?.trophy ?? true,
      'show.rank': this._config.show?.rank ?? true,
      'show.days': this._config.show?.days ?? true,
      borderless: this._config.borderless ?? false,
    };
  }

  private _getStatsData(): Record<string, unknown> {
    if (!this._config) return {};

    return {
      'stats.gold': this._config.stats?.gold ?? false,
      'stats.silver': this._config.stats?.silver ?? false,
      'stats.bronze': this._config.stats?.bronze ?? false,
      'stats.hide_current': this._config.stats?.hide_current ?? true,
    };
  }

  /**
   * Handle stats form value changes
   */
  private _statsChanged(ev: CustomEvent): void {
    const formData = ev.detail.value as Record<string, unknown>;

    const config: StreakHubCardConfig = {
      ...this._config,
      stats: {
        ...this._config?.stats,
        gold: formData['stats.gold'] as boolean,
        silver: formData['stats.silver'] as boolean,
        bronze: formData['stats.bronze'] as boolean,
        hide_current: formData['stats.hide_current'] as boolean,
      },
    } as StreakHubCardConfig;

    this._updateConfig(config);
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
                  .data=${{ action: action }}
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

      <div class="visibility-grid">
        <ha-form
          .hass=${this.hass}
          .data=${this._getVisibilityData()}
          .schema=${[VISIBILITY_SCHEMA[0], VISIBILITY_SCHEMA[2]]}
          .computeLabel=${this._computeLabel}
          @value-changed=${this._visibilityChanged}
        ></ha-form>
        <ha-form
          .hass=${this.hass}
          .data=${this._getVisibilityData()}
          .schema=${[VISIBILITY_SCHEMA[1], VISIBILITY_SCHEMA[3]]}
          .computeLabel=${this._computeLabel}
          @value-changed=${this._visibilityChanged}
        ></ha-form>
      </div>
      <ha-form
        .hass=${this.hass}
        .data=${this._getVisibilityData()}
        .schema=${[VISIBILITY_SCHEMA[4]]}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._visibilityChanged}
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

      <ha-expansion-panel outlined>
        <div slot="header" role="heading" aria-level="3">
          <ha-svg-icon .path=${mdiChartBoxOutline}></ha-svg-icon>
          ${t.stats_title}
        </div>
        <div class="content">
          <ha-form
            .hass=${this.hass}
            .data=${this._getStatsData()}
            .schema=${STATS_SCHEMA}
            .computeLabel=${this._computeLabel}
            @value-changed=${this._statsChanged}
          ></ha-form>
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
