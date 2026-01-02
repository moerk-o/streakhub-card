/**
 * Calendar picker component for StreakHub Card
 */

import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { calendarStyles } from '../styles/calendar.styles';
import {
  parseDate,
  toDateString,
  getTodayString,
  getDaysInMonth,
  getFirstDayOfMonth,
  getAdjustedDayOfWeek,
  getWeekDayNames,
  getMonthName,
} from '../utils/format';
import type { Translations } from '../types';

/**
 * Month calendar for selecting a date within a valid range
 *
 * @element streakhub-calendar
 *
 * @prop {string} minDate - Minimum selectable date (ISO format)
 * @prop {string} maxDate - Maximum selectable date (ISO format)
 * @prop {number} weekStart - First day of week (0=Sunday, 1=Monday)
 * @prop {Translations} translations - Localized strings
 * @prop {string} locale - Locale for month/day names
 *
 * @fires date-selected - When user confirms a date selection
 * @fires cancel - When user cancels the calendar
 */
@customElement('streakhub-calendar')
export class StreakHubCalendar extends LitElement {
  @property({ type: String })
  minDate?: string;

  @property({ type: String })
  maxDate?: string;

  @property({ type: Number })
  weekStart = 1;

  @property({ attribute: false })
  translations!: Translations;

  @property({ type: String })
  locale = 'en';

  @state()
  private _viewYear: number;

  @state()
  private _viewMonth: number;

  @state()
  private _selectedDate?: string;

  static override styles = calendarStyles;

  constructor() {
    super();
    const today = new Date();
    this._viewYear = today.getFullYear();
    this._viewMonth = today.getMonth();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    // Initialize view to show the max date month (usually current month)
    if (this.maxDate) {
      const max = parseDate(this.maxDate);
      this._viewYear = max.getFullYear();
      this._viewMonth = max.getMonth();
    }
  }

  /**
   * Check if we can navigate to the previous month
   */
  private get _canNavigatePrev(): boolean {
    if (!this.minDate) return true;

    const min = parseDate(this.minDate);
    const minYear = min.getFullYear();
    const minMonth = min.getMonth();

    // Can navigate if current view is after min month
    return (
      this._viewYear > minYear ||
      (this._viewYear === minYear && this._viewMonth > minMonth)
    );
  }

  /**
   * Check if we can navigate to the next month
   */
  private get _canNavigateNext(): boolean {
    if (!this.maxDate) return true;

    const max = parseDate(this.maxDate);
    const maxYear = max.getFullYear();
    const maxMonth = max.getMonth();

    // Can navigate if current view is before max month
    return (
      this._viewYear < maxYear ||
      (this._viewYear === maxYear && this._viewMonth < maxMonth)
    );
  }

  /**
   * Navigate to previous month
   */
  private _prevMonth(): void {
    if (!this._canNavigatePrev) return;

    if (this._viewMonth === 0) {
      this._viewMonth = 11;
      this._viewYear--;
    } else {
      this._viewMonth--;
    }
  }

  /**
   * Navigate to next month
   */
  private _nextMonth(): void {
    if (!this._canNavigateNext) return;

    if (this._viewMonth === 11) {
      this._viewMonth = 0;
      this._viewYear++;
    } else {
      this._viewMonth++;
    }
  }

  /**
   * Check if a date is disabled (outside valid range)
   */
  private _isDateDisabled(dateString: string): boolean {
    if (this.minDate && dateString < this.minDate) return true;
    if (this.maxDate && dateString > this.maxDate) return true;
    return false;
  }

  /**
   * Handle day selection
   */
  private _selectDate(dateString: string): void {
    if (this._isDateDisabled(dateString)) return;
    this._selectedDate = dateString;
  }

  /**
   * Confirm selection
   */
  private _confirm(): void {
    if (!this._selectedDate) return;

    this.dispatchEvent(
      new CustomEvent('date-selected', {
        detail: { date: this._selectedDate },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Cancel and close
   */
  private _cancel(): void {
    this.dispatchEvent(
      new CustomEvent('cancel', {
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Render the calendar header with month navigation
   */
  private _renderHeader() {
    const monthName = getMonthName(this._viewYear, this._viewMonth, this.locale);

    return html`
      <div class="calendar-header">
        <button
          @click=${this._prevMonth}
          ?disabled=${!this._canNavigatePrev}
          aria-label="Previous month"
        >
          <ha-icon icon="mdi:chevron-left"></ha-icon>
        </button>
        <span class="month-year">${monthName}</span>
        <button
          @click=${this._nextMonth}
          ?disabled=${!this._canNavigateNext}
          aria-label="Next month"
        >
          <ha-icon icon="mdi:chevron-right"></ha-icon>
        </button>
      </div>
    `;
  }

  /**
   * Render the weekday headers
   */
  private _renderWeekdays() {
    const weekDays = getWeekDayNames(this.weekStart, this.locale);

    return html`
      <div class="weekdays">
        ${weekDays.map((day) => html`<span class="weekday">${day}</span>`)}
      </div>
    `;
  }

  /**
   * Render the days grid
   */
  private _renderDays() {
    const today = getTodayString();
    const daysInMonth = getDaysInMonth(this._viewYear, this._viewMonth);
    const firstDay = getFirstDayOfMonth(this._viewYear, this._viewMonth);
    const startOffset = getAdjustedDayOfWeek(firstDay, this.weekStart);

    const days = [];

    // Empty cells for days before the 1st
    for (let i = 0; i < startOffset; i++) {
      days.push(html`<div class="day empty"></div>`);
    }

    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(this._viewYear, this._viewMonth, day);
      const dateString = toDateString(date);
      const isDisabled = this._isDateDisabled(dateString);
      const isToday = dateString === today;
      const isSelected = dateString === this._selectedDate;

      const classes = [
        'day',
        isDisabled ? 'disabled' : '',
        isToday ? 'today' : '',
        isSelected ? 'selected' : '',
      ]
        .filter(Boolean)
        .join(' ');

      days.push(html`
        <button
          class=${classes}
          @click=${() => this._selectDate(dateString)}
          ?disabled=${isDisabled}
          tabindex=${isDisabled ? -1 : 0}
          aria-label="${dateString}"
          aria-selected=${isSelected}
        >
          ${day}
        </button>
      `);
    }

    return html`<div class="days-grid">${days}</div>`;
  }

  /**
   * Render the action buttons
   */
  private _renderActions() {
    return html`
      <div class="calendar-actions">
        <button class="cancel" @click=${this._cancel}>
          ${this.translations?.cancel ?? 'Cancel'}
        </button>
        <button
          class="confirm"
          @click=${this._confirm}
          ?disabled=${!this._selectedDate}
        >
          ${this.translations?.confirm ?? 'Confirm'}
        </button>
      </div>
    `;
  }

  protected override render() {
    return html`
      <div class="calendar">
        ${this._renderHeader()}
        ${this._renderWeekdays()}
        ${this._renderDays()}
        ${this._renderActions()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'streakhub-calendar': StreakHubCalendar;
  }
}
