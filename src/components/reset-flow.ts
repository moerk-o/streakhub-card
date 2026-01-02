/**
 * Reset flow component for StreakHub Card
 */

import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { resetFlowStyles } from '../styles/card.styles';
import { calendarStyles } from '../styles/calendar.styles';
import {
  getDaysAgo,
  toDateString,
  calculateStreakStart,
  getTodayString,
} from '../utils/format';
import { callStreakHubReset } from '../utils/actions';
import { getWeekStart } from '../utils/translations';
import type { HomeAssistant, Translations, ResetFlowView } from '../types';
import './calendar-picker';

/**
 * Reset flow with quick buttons and calendar picker
 *
 * @element streakhub-reset-flow
 *
 * @prop {HomeAssistant} hass - Home Assistant instance
 * @prop {Translations} translations - Localized strings
 * @prop {string} streakStart - Current streak start date (for calendar min)
 * @prop {string} entityId - Entity ID for service calls
 * @prop {string} serviceTarget - Optional override for service target
 *
 * @fires close - When the flow should close (after success or cancel)
 * @fires error - When a service call fails
 */
@customElement('streakhub-reset-flow')
export class StreakHubResetFlow extends LitElement {
  @property({ attribute: false })
  hass?: HomeAssistant;

  @property({ attribute: false })
  translations!: Translations;

  @property({ type: String })
  streakStart?: string;

  @property({ type: String })
  entityId!: string;

  @property({ type: String })
  serviceTarget?: string;

  @state()
  private _view: ResetFlowView = 'buttons';

  @state()
  private _loading = false;

  static override styles = [resetFlowStyles, calendarStyles];

  /**
   * Get the target entity for service calls
   */
  private get _serviceTarget(): string {
    return this.serviceTarget ?? this.entityId;
  }

  /**
   * Get the locale from hass
   */
  private get _locale(): string {
    return this.hass?.locale?.language?.split('-')[0] ?? 'en';
  }

  /**
   * Handle quick reset button click
   *
   * @param daysAgo 0 for today, 1 for yesterday, 2 for day before
   */
  private async _handleQuickReset(daysAgo: number): Promise<void> {
    // Event date is X days ago
    const eventDate = getDaysAgo(daysAgo);

    // Streak starts the day AFTER the event
    const streakStartDate = calculateStreakStart(eventDate);
    const dateString = toDateString(streakStartDate);

    await this._callReset(dateString);
  }

  /**
   * Handle calendar date selection
   */
  private async _handleCalendarSelect(
    e: CustomEvent<{ date: string }>
  ): Promise<void> {
    // The selected date is when the EVENT happened
    // Streak starts the day after
    const eventDate = new Date(e.detail.date + 'T00:00:00');
    const streakStartDate = calculateStreakStart(eventDate);
    const dateString = toDateString(streakStartDate);

    await this._callReset(dateString);
  }

  /**
   * Call the reset service
   */
  private async _callReset(date: string): Promise<void> {
    if (!this.hass || this._loading) return;

    this._loading = true;

    try {
      await callStreakHubReset(this.hass, this._serviceTarget, date);

      // Success - close the flow
      this.dispatchEvent(
        new CustomEvent('close', {
          bubbles: true,
          composed: true,
        })
      );
    } catch (err) {
      // Error - notify parent
      this.dispatchEvent(
        new CustomEvent('error', {
          detail: { message: (err as Error).message },
          bubbles: true,
          composed: true,
        })
      );
    } finally {
      this._loading = false;
    }
  }

  /**
   * Show calendar view
   */
  private _showCalendar(): void {
    this._view = 'calendar';
  }

  /**
   * Handle calendar cancel
   */
  private _handleCalendarCancel(): void {
    this._view = 'buttons';
  }

  /**
   * Render quick reset buttons
   */
  private _renderButtons() {
    return html`
      <div class="quick-buttons">
        <button
          @click=${() => this._handleQuickReset(0)}
          ?disabled=${this._loading}
        >
          ${this.translations.today}
        </button>
        <button
          @click=${() => this._handleQuickReset(1)}
          ?disabled=${this._loading}
        >
          ${this.translations.yesterday}
        </button>
        <button
          @click=${() => this._handleQuickReset(2)}
          ?disabled=${this._loading}
        >
          ${this.translations.day_before}
        </button>
        <button
          class="more"
          @click=${this._showCalendar}
          ?disabled=${this._loading}
        >
          ${this.translations.more}
        </button>
      </div>
    `;
  }

  /**
   * Render calendar picker
   */
  private _renderCalendar() {
    const today = getTodayString();
    const weekStart = getWeekStart(this.hass);

    return html`
      <streakhub-calendar
        .minDate=${this.streakStart}
        .maxDate=${today}
        .weekStart=${weekStart}
        .translations=${this.translations}
        .locale=${this._locale}
        @date-selected=${this._handleCalendarSelect}
        @cancel=${this._handleCalendarCancel}
      ></streakhub-calendar>
    `;
  }

  protected override render() {
    if (this._view === 'calendar') {
      return this._renderCalendar();
    }

    return this._renderButtons();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'streakhub-reset-flow': StreakHubResetFlow;
  }
}
