/**
 * Configuration editor for StreakHub Card
 */

import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type {
  HomeAssistant,
  StreakHubCardConfig,
  ActionConfig,
  CardVariant,
  SupportedLanguage,
} from './types';

// Action options for dropdowns
const ACTION_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'more-info', label: 'More Info' },
  { value: 'reset-flow', label: 'Reset Flow' },
  { value: 'none', label: 'None' },
  { value: 'navigate', label: 'Navigate' },
  { value: 'url', label: 'Open URL' },
  { value: 'call-service', label: 'Call Service' },
];

// Variant options
const VARIANT_OPTIONS: Array<{ value: CardVariant; label: string }> = [
  { value: 'standard', label: 'Standard' },
  { value: 'compact', label: 'Compact' },
];

// Language options
const LANGUAGE_OPTIONS: Array<{ value: SupportedLanguage; label: string }> = [
  { value: 'auto', label: 'Auto' },
  { value: 'en', label: 'English' },
  { value: 'de', label: 'Deutsch' },
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

  /**
   * Preload HA elements (entity picker, etc.) using loadCardHelpers
   * This is required because custom cards don't have automatic access to HA components
   */
  private async _loadCardHelpers(): Promise<void> {
    if (this._helpers) return;

    // Check if ha-entity-picker is already available
    if (window.customElements.get('ha-entity-picker')) {
      this._helpers = true;
      return;
    }

    try {
      // Load card helpers from Home Assistant
      const helpers = await (window as unknown as { loadCardHelpers: () => Promise<unknown> }).loadCardHelpers();
      this._helpers = helpers;

      // Create a temporary entities card to trigger loading of ha-entity-picker
      const cardHelpers = helpers as { createCardElement: (config: unknown) => Promise<{ constructor: { getConfigElement: () => Promise<void> } }> };
      const card = await cardHelpers.createCardElement({ type: 'entities', entities: [] });
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

    .form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .row {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .row label {
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--primary-text-color);
    }

    .row .hint {
      font-size: 0.75rem;
      color: var(--secondary-text-color);
    }

    .toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 0;
    }

    .toggle-row label {
      font-size: 0.9rem;
      color: var(--primary-text-color);
    }

    .section {
      border-top: 1px solid var(--divider-color, #e0e0e0);
      padding-top: 16px;
      margin-top: 8px;
    }

    .section-title {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--secondary-text-color);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }

    ha-entity-picker {
      display: block;
      width: 100%;
    }

    ha-textfield {
      display: block;
      width: 100%;
    }

    ha-select {
      display: block;
      width: 100%;
    }
  `;

  /**
   * Set the configuration from the card
   */
  setConfig(config: StreakHubCardConfig): void {
    this._config = config;
  }

  /**
   * Fire a config-changed event
   */
  private _fireConfigChanged(): void {
    if (!this._config) return;

    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Update a simple config value
   */
  private _updateConfig<K extends keyof StreakHubCardConfig>(
    key: K,
    value: StreakHubCardConfig[K]
  ): void {
    if (!this._config) return;

    this._config = {
      ...this._config,
      [key]: value,
    };
    this._fireConfigChanged();
  }

  /**
   * Update a show config value
   */
  private _updateShowConfig(
    key: keyof NonNullable<StreakHubCardConfig['show']>,
    value: boolean
  ): void {
    if (!this._config) return;

    this._config = {
      ...this._config,
      show: {
        ...this._config.show,
        [key]: value,
      },
    };
    this._fireConfigChanged();
  }

  /**
   * Update an action config
   */
  private _updateActionConfig(
    key: 'tap_action' | 'hold_action' | 'double_tap_action',
    action: string
  ): void {
    if (!this._config) return;

    this._config = {
      ...this._config,
      [key]: { action } as ActionConfig,
    };
    this._fireConfigChanged();
  }

  /**
   * Handle entity picker change
   */
  private _handleEntityChange(e: CustomEvent): void {
    const value = (e.target as HTMLInputElement).value;
    this._updateConfig('entity', value);
  }

  /**
   * Handle text input change
   */
  private _handleNameChange(e: Event): void {
    const value = (e.target as HTMLInputElement).value;
    this._updateConfig('name', value || undefined);
  }

  /**
   * Handle select change
   */
  private _handleSelectChange(
    key: keyof StreakHubCardConfig,
    e: CustomEvent
  ): void {
    const value = (e.target as HTMLSelectElement).value;
    this._updateConfig(key, value as StreakHubCardConfig[typeof key]);
  }

  /**
   * Handle toggle change
   */
  private _handleToggleChange(
    key: 'borderless',
    e: CustomEvent
  ): void {
    const checked = (e.target as HTMLInputElement).checked;
    this._updateConfig(key, checked);
  }

  /**
   * Handle show toggle change
   */
  private _handleShowToggleChange(
    key: keyof NonNullable<StreakHubCardConfig['show']>,
    e: CustomEvent
  ): void {
    const checked = (e.target as HTMLInputElement).checked;
    this._updateShowConfig(key, checked);
  }

  /**
   * Handle action select change
   */
  private _handleActionChange(
    key: 'tap_action' | 'hold_action' | 'double_tap_action',
    e: CustomEvent
  ): void {
    const value = (e.target as HTMLSelectElement).value;
    this._updateActionConfig(key, value);
  }

  /**
   * Entity filter function for ha-entity-picker
   */
  private _entityFilter = (entity: { entity_id: string }): boolean => {
    if (!this.hass) return false;
    const stateObj = this.hass.states[entity.entity_id];
    return Array.isArray(stateObj?.attributes?.top_3);
  };

  /**
   * Render entity picker
   */
  private _renderEntityPicker() {
    return html`
      <div class="row">
        <label>Entity</label>
        <ha-entity-picker
          .hass=${this.hass}
          .value=${this._config?.entity ?? ''}
          .includeDomains=${['sensor']}
          .entityFilter=${this._entityFilter}
          @value-changed=${this._handleEntityChange}
          allow-custom-entity
        ></ha-entity-picker>
        <span class="hint">Select a StreakHub rank sensor</span>
      </div>
    `;
  }

  /**
   * Render name input
   */
  private _renderNameInput() {
    return html`
      <div class="row">
        <label>Name (optional)</label>
        <ha-textfield
          .value=${this._config?.name ?? ''}
          @input=${this._handleNameChange}
          placeholder="Override device name"
        ></ha-textfield>
      </div>
    `;
  }

  /**
   * Render variant selector
   */
  private _renderVariantSelect() {
    return html`
      <div class="row">
        <label>Variant</label>
        <ha-select
          .value=${this._config?.variant ?? 'standard'}
          @selected=${(e: CustomEvent) =>
            this._handleSelectChange('variant', e)}
          @closed=${(e: Event) => e.stopPropagation()}
        >
          ${VARIANT_OPTIONS.map(
            (opt) => html`
              <mwc-list-item .value=${opt.value}>${opt.label}</mwc-list-item>
            `
          )}
        </ha-select>
      </div>
    `;
  }

  /**
   * Render language selector
   */
  private _renderLanguageSelect() {
    return html`
      <div class="row">
        <label>Language</label>
        <ha-select
          .value=${this._config?.language ?? 'auto'}
          @selected=${(e: CustomEvent) =>
            this._handleSelectChange('language', e)}
          @closed=${(e: Event) => e.stopPropagation()}
        >
          ${LANGUAGE_OPTIONS.map(
            (opt) => html`
              <mwc-list-item .value=${opt.value}>${opt.label}</mwc-list-item>
            `
          )}
        </ha-select>
      </div>
    `;
  }

  /**
   * Render borderless toggle
   */
  private _renderBorderlessToggle() {
    return html`
      <div class="toggle-row">
        <label>Borderless</label>
        <ha-switch
          .checked=${this._config?.borderless ?? false}
          @change=${(e: CustomEvent) =>
            this._handleToggleChange('borderless', e)}
        ></ha-switch>
      </div>
    `;
  }

  /**
   * Render show toggles
   */
  private _renderShowToggles() {
    const showConfig = this._config?.show ?? {};

    return html`
      <div class="section">
        <div class="section-title">Visibility</div>

        <div class="toggle-row">
          <label>Trophy/Medal</label>
          <ha-switch
            .checked=${showConfig.trophy ?? true}
            @change=${(e: CustomEvent) =>
              this._handleShowToggleChange('trophy', e)}
          ></ha-switch>
        </div>

        <div class="toggle-row">
          <label>Rank (#1, #2, #3)</label>
          <ha-switch
            .checked=${showConfig.rank ?? true}
            @change=${(e: CustomEvent) =>
              this._handleShowToggleChange('rank', e)}
          ></ha-switch>
        </div>

        <div class="toggle-row">
          <label>Days Counter</label>
          <ha-switch
            .checked=${showConfig.days ?? true}
            @change=${(e: CustomEvent) =>
              this._handleShowToggleChange('days', e)}
          ></ha-switch>
        </div>

        <div class="toggle-row">
          <label>Name</label>
          <ha-switch
            .checked=${showConfig.name ?? true}
            @change=${(e: CustomEvent) =>
              this._handleShowToggleChange('name', e)}
          ></ha-switch>
        </div>
      </div>
    `;
  }

  /**
   * Render action selector
   */
  private _renderActionSelect(
    label: string,
    key: 'tap_action' | 'hold_action' | 'double_tap_action',
    defaultAction: string
  ) {
    const config = this._config?.[key] as ActionConfig | undefined;
    const currentAction = config?.action ?? defaultAction;

    return html`
      <div class="row">
        <label>${label}</label>
        <ha-select
          .value=${currentAction}
          @selected=${(e: CustomEvent) => this._handleActionChange(key, e)}
          @closed=${(e: Event) => e.stopPropagation()}
        >
          ${ACTION_OPTIONS.map(
            (opt) => html`
              <mwc-list-item .value=${opt.value}>${opt.label}</mwc-list-item>
            `
          )}
        </ha-select>
      </div>
    `;
  }

  /**
   * Render action configuration section
   */
  private _renderActions() {
    return html`
      <div class="section">
        <div class="section-title">Actions</div>
        ${this._renderActionSelect('Tap Action', 'tap_action', 'more-info')}
        ${this._renderActionSelect('Hold Action', 'hold_action', 'reset-flow')}
        ${this._renderActionSelect(
          'Double Tap Action',
          'double_tap_action',
          'none'
        )}
      </div>
    `;
  }

  protected override render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    // Wait for helpers to load before rendering entity picker
    if (!this._helpers) {
      return html`<div>Loading...</div>`;
    }

    return html`
      <div class="form">
        ${this._renderEntityPicker()}
        ${this._renderNameInput()}
        ${this._renderVariantSelect()}
        ${this._renderLanguageSelect()}
        ${this._renderBorderlessToggle()}
        ${this._renderShowToggles()}
        ${this._renderActions()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'streakhub-card-editor': StreakHubCardEditor;
  }
}
