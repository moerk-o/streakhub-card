/**
 * StreakHub Card - Home Assistant Lovelace Card
 *
 * A custom card for visualizing streak progress with the StreakHub integration.
 */

import { LitElement, html, nothing, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { cardStyles } from './styles/card.styles';
import { getTranslations } from './utils/translations';
import { formatDays } from './utils/format';
import { handleAction, createGestureHandlers } from './utils/actions';
import {
  type HomeAssistant,
  type StreakHubCardConfig,
  type StreakEntry,
  type Translations,
  type ExpandedState,
  type GridOptions,
  type ActionConfig,
  DEFAULT_CONFIG,
  isStreakHubEntity,
  getCurrentStreak,
} from './types';

// Import sub-components
import './components/trophy-icon';
import './components/reset-flow';
import './streakhub-card-editor';

/**
 * StreakHub Card - Visualize your streak progress with trophies
 *
 * @element streakhub-card
 */
@customElement('streakhub-card')
export class StreakHubCard extends LitElement {
  @property({ attribute: false })
  hass?: HomeAssistant;

  @state()
  private _config?: StreakHubCardConfig;

  @state()
  private _expandedState: ExpandedState = 'closed';

  @state()
  private _error?: string;

  private _gestureHandlers?: ReturnType<typeof createGestureHandlers>;

  static override styles = cardStyles;

  // ==========================================================================
  // Card API
  // ==========================================================================

  /**
   * Set and validate card configuration
   */
  setConfig(config: StreakHubCardConfig): void {
    if (!config.entity) {
      throw new Error('Entity is required');
    }

    if (config.variant && !['standard', 'compact'].includes(config.variant)) {
      throw new Error('Invalid variant: must be "standard" or "compact"');
    }

    // Merge with defaults
    this._config = {
      ...DEFAULT_CONFIG,
      ...config,
      show: {
        ...DEFAULT_CONFIG.show,
        ...config.show,
      },
    };

    // Setup gesture handlers based on config
    this._setupGestureHandlers();
  }

  /**
   * Get card size for Masonry layout
   */
  getCardSize(): number {
    const isCompact = this._config?.variant === 'compact';
    const base = isCompact ? 1 : 3;

    if (this._expandedState === 'buttons') {
      return isCompact ? 4 : 4;
    }
    if (this._expandedState === 'calendar') {
      return 6;
    }

    return base;
  }

  /**
   * Get grid options for Sections view
   */
  static getGridOptions(): GridOptions {
    return {
      columns: 6,
      min_columns: 3,
      rows: 'auto',
    };
  }

  /**
   * Get the configuration element (editor)
   */
  static getConfigElement(): HTMLElement {
    return document.createElement('streakhub-card-editor');
  }

  /**
   * Get stub configuration for card picker
   */
  static getStubConfig(hass: HomeAssistant): Partial<StreakHubCardConfig> {
    // Find first StreakHub entity
    const entity = Object.keys(hass.states).find((eid) =>
      Array.isArray(hass.states[eid]?.attributes?.top_3)
    );

    return {
      entity: entity ?? '',
      variant: 'standard',
      borderless: false,
      show: { trophy: true, rank: true, days: true, name: true },
    };
  }

  // ==========================================================================
  // Lifecycle
  // ==========================================================================

  override connectedCallback(): void {
    super.connectedCallback();
    // Close expansion when clicking outside
    document.addEventListener('click', this._handleDocumentClick);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('click', this._handleDocumentClick);
  }

  protected override updated(changedProps: PropertyValues): void {
    super.updated(changedProps);

    // Notify Masonry of size change when expansion state changes
    if (changedProps.has('_expandedState')) {
      this.dispatchEvent(new Event('card-size-changed', { bubbles: true }));
    }
  }

  // ==========================================================================
  // Data Accessors
  // ==========================================================================

  /**
   * Get the entity state
   */
  private get _entityState() {
    if (!this.hass || !this._config?.entity) return undefined;
    return this.hass.states[this._config.entity];
  }

  /**
   * Get the current active streak
   */
  private get _currentStreak(): StreakEntry | null {
    const entity = this._entityState;
    if (!isStreakHubEntity(entity)) return null;
    return getCurrentStreak(entity.attributes.top_3);
  }

  /**
   * Get the current rank from entity state
   */
  private get _currentRank(): number {
    const state = this._entityState?.state;
    if (!state) return 0;
    const rank = parseInt(state, 10);
    return isNaN(rank) ? 0 : rank;
  }

  /**
   * Get the display name for the tracker
   */
  private get _displayName(): string {
    // 1. Config override
    if (this._config?.name) {
      return this._config.name;
    }

    // 2. Device name from registry
    if (this.hass && this._config?.entity) {
      const entityEntry = this.hass.entities?.[this._config.entity];
      const deviceId = entityEntry?.device_id;
      if (deviceId) {
        const device = this.hass.devices?.[deviceId];
        if (device?.name) {
          return device.name;
        }
      }
    }

    // 3. Fallback to friendly_name
    const friendlyName = this._entityState?.attributes?.friendly_name;
    if (typeof friendlyName === 'string') {
      return friendlyName;
    }

    // 4. Last resort: entity ID
    return this._config?.entity ?? 'Unknown';
  }

  /**
   * Get translations for current language
   */
  private get _translations(): Translations {
    return getTranslations(this.hass, this._config?.language);
  }

  /**
   * Get the service target entity
   */
  private get _serviceTarget(): string {
    return this._config?.service_target ?? this._config?.entity ?? '';
  }

  // ==========================================================================
  // Event Handlers
  // ==========================================================================

  /**
   * Setup gesture handlers based on config
   */
  private _setupGestureHandlers(): void {
    if (!this._config) return;

    this._gestureHandlers = createGestureHandlers({
      onTap: () => this._handleTap(),
      onHold: () => this._handleHold(),
      onDoubleTap: () => this._handleDoubleTap(),
    });
  }

  /**
   * Handle tap action
   */
  private _handleTap(): void {
    const action = this._config?.tap_action ?? DEFAULT_CONFIG.tap_action;
    this._executeAction(action);
  }

  /**
   * Handle hold action
   */
  private _handleHold(): void {
    const action = this._config?.hold_action ?? DEFAULT_CONFIG.hold_action;
    this._executeAction(action);
  }

  /**
   * Handle double tap action
   */
  private _handleDoubleTap(): void {
    const action =
      this._config?.double_tap_action ?? DEFAULT_CONFIG.double_tap_action;
    this._executeAction(action);
  }

  /**
   * Execute an action
   */
  private _executeAction(action: ActionConfig): void {
    if (action.action === 'reset-flow') {
      this._openResetFlow();
      return;
    }

    if (action.action === 'none') {
      return;
    }

    if (this.hass && this._config?.entity) {
      handleAction(this.hass, action, this._config.entity);
    }
  }

  /**
   * Open the reset flow
   */
  private _openResetFlow(): void {
    this._expandedState = 'buttons';
  }

  /**
   * Close the expansion
   */
  private _closeExpansion = (): void => {
    this._expandedState = 'closed';
    this._error = undefined;
  };

  /**
   * Handle document click (close on outside click)
   */
  private _handleDocumentClick = (e: MouseEvent): void => {
    if (this._expandedState === 'closed') return;

    const path = e.composedPath();
    if (!path.includes(this)) {
      this._closeExpansion();
    }
  };

  /**
   * Handle reset flow close
   */
  private _handleResetFlowClose = (): void => {
    this._closeExpansion();
  };

  /**
   * Handle reset flow error
   */
  private _handleResetFlowError = (e: CustomEvent<{ message: string }>): void => {
    this._error = e.detail.message;
  };

  /**
   * Clear error state
   */
  private _clearError = (): void => {
    this._error = undefined;
    this._expandedState = 'buttons';
  };

  // ==========================================================================
  // Render Methods
  // ==========================================================================

  /**
   * Render error state
   */
  private _renderError(message: string, entityId?: string) {
    return html`
      <ha-card class="error">
        <div class="error-content">
          <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
          <span class="message">${message}</span>
          ${entityId
            ? html`<span class="entity-id">${entityId}</span>`
            : nothing}
        </div>
      </ha-card>
    `;
  }

  /**
   * Render service error (inline in expansion)
   */
  private _renderServiceError() {
    return html`
      <div class="service-error">
        <ha-icon icon="mdi:alert"></ha-icon>
        <span class="message">${this._error}</span>
        <mwc-button @click=${this._clearError}>
          ${this._translations.close}
        </mwc-button>
      </div>
    `;
  }

  /**
   * Render the trophy/medal icon
   */
  private _renderTrophy(rank: number) {
    if (!this._config?.show?.trophy) return nothing;

    return html`
      <streakhub-trophy
        rank=${rank}
        variant=${this._config.variant ?? 'standard'}
      ></streakhub-trophy>
    `;
  }

  /**
   * Render the rank indicator
   */
  private _renderRank(rank: number) {
    if (!this._config?.show?.rank) return nothing;
    if (rank < 1 || rank > 3) return nothing;

    return html`<span class="rank">#${rank}</span>`;
  }

  /**
   * Render the days counter
   */
  private _renderDays(days: number) {
    if (!this._config?.show?.days) return nothing;

    return html`
      <span class="days">${formatDays(days, this._translations)}</span>
    `;
  }

  /**
   * Render the tracker name
   */
  private _renderName(name: string) {
    if (!this._config?.show?.name) return nothing;

    return html`<span class="name">${name}</span>`;
  }

  /**
   * Render the expansion content (reset flow or error)
   */
  private _renderExpansion() {
    if (this._expandedState === 'closed') return nothing;

    const currentStreak = this._currentStreak;

    return html`
      <div class="expansion">
        ${this._error
          ? this._renderServiceError()
          : html`
              <streakhub-reset-flow
                .hass=${this.hass}
                .translations=${this._translations}
                .streakStart=${currentStreak?.start}
                .entityId=${this._config?.entity ?? ''}
                .serviceTarget=${this._serviceTarget}
                @close=${this._handleResetFlowClose}
                @error=${this._handleResetFlowError}
              ></streakhub-reset-flow>
            `}
      </div>
    `;
  }

  /**
   * Render standard (vertical) layout
   */
  private _renderStandard(name: string, rank: number, days: number) {
    return html`
      <div class="standard">
        ${this._renderName(name)}
        <div class="trophy-container">
          ${this._renderTrophy(rank)}
          ${this._renderRank(rank)}
        </div>
        ${this._renderDays(days)}
      </div>
      ${this._renderExpansion()}
    `;
  }

  /**
   * Render compact (horizontal) layout
   */
  private _renderCompact(name: string, rank: number, days: number) {
    return html`
      <div class="compact">
        ${this._renderTrophy(rank)}
        <div class="content">
          ${this._renderName(name)}
          <span>
            ${this._renderDays(days)}
            ${this._renderRank(rank)}
          </span>
        </div>
      </div>
      ${this._renderExpansion()}
    `;
  }

  /**
   * Main render method
   */
  protected override render() {
    // No config
    if (!this._config) {
      return this._renderError('No configuration');
    }

    const entity = this._entityState;

    // Entity not found
    if (!entity) {
      return this._renderError(
        this._translations.invalid_entity,
        this._config.entity
      );
    }

    // Entity unavailable
    if (entity.state === 'unavailable') {
      return this._renderError(
        this._translations.unavailable,
        this._config.entity
      );
    }

    // Invalid entity (no top_3 attribute)
    if (!isStreakHubEntity(entity)) {
      return this._renderError(
        this._translations.invalid_data,
        this._config.entity
      );
    }

    // Extract data
    const currentStreak = this._currentStreak;
    const rank = this._currentRank;
    const days = currentStreak?.days ?? 0;
    const name = this._displayName;

    // Build card classes
    const classes = [this._config.borderless ? 'borderless' : '']
      .filter(Boolean)
      .join(' ');

    // Render based on variant
    const content =
      this._config.variant === 'compact'
        ? this._renderCompact(name, rank, days)
        : this._renderStandard(name, rank, days);

    return html`
      <ha-card
        class=${classes || nothing}
        tabindex="0"
        @pointerdown=${this._gestureHandlers?.onPointerDown}
        @pointerup=${this._gestureHandlers?.onPointerUp}
        @pointercancel=${this._gestureHandlers?.onPointerCancel}
      >
        ${content}
      </ha-card>
    `;
  }
}

// =============================================================================
// Card Registration
// =============================================================================

declare global {
  interface HTMLElementTagNameMap {
    'streakhub-card': StreakHubCard;
  }
}

// Register with Home Assistant card picker
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'streakhub-card',
  name: 'StreakHub Card',
  description: 'Visualize your streak progress with trophies',
  preview: true,
});

// Console info
console.info(
  `%c STREAKHUB-CARD %c v1.0.0 `,
  'color: white; background: #FFD700; font-weight: bold;',
  'color: #FFD700; background: #333;'
);
