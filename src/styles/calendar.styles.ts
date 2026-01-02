/**
 * Calendar styles for StreakHub Card
 */

import { css } from 'lit';

export const calendarStyles = css`
  /* ==========================================================================
     Calendar Component
     ========================================================================== */

  :host {
    display: block;
  }

  .calendar {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* ==========================================================================
     Calendar Header
     ========================================================================== */

  .calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .calendar-header .month-year {
    font-size: 1rem;
    font-weight: 500;
    color: var(--primary-text-color);
    text-align: center;
    flex: 1;
  }

  .calendar-header button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: var(--primary-text-color);
    cursor: pointer;
  }

  .calendar-header button:hover:not(:disabled) {
    background: var(--secondary-background-color, #f5f5f5);
  }

  .calendar-header button:disabled {
    color: var(--disabled-text-color, #bbb);
    cursor: not-allowed;
  }

  .calendar-header button:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  .calendar-header ha-icon {
    --mdc-icon-size: 20px;
  }

  /* ==========================================================================
     Week Days Header
     ========================================================================== */

  .weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
    text-align: center;
  }

  .weekday {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--secondary-text-color);
    padding: 4px 0;
    text-transform: uppercase;
  }

  /* ==========================================================================
     Calendar Grid
     ========================================================================== */

  .days-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
  }

  .day {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    border-radius: 50%;
    cursor: pointer;
    transition: background-color 0.1s;
    border: 2px solid transparent;
  }

  .day:hover:not(.disabled):not(.empty) {
    background: var(--secondary-background-color, #f5f5f5);
  }

  .day:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  /* Empty cell (padding) */
  .day.empty {
    cursor: default;
  }

  /* Disabled day (outside valid range) */
  .day.disabled {
    color: var(--disabled-text-color, #bbb);
    cursor: not-allowed;
  }

  /* Today marker */
  .day.today:not(.selected) {
    border-color: var(--primary-color);
  }

  /* Selected day */
  .day.selected {
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
  }

  /* ==========================================================================
     Calendar Actions
     ========================================================================== */

  .calendar-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 8px;
    padding-top: 12px;
    border-top: 1px solid var(--divider-color, #e0e0e0);
  }

  .calendar-actions button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background-color 0.1s;
  }

  .calendar-actions button:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  .calendar-actions button.cancel {
    background: transparent;
    color: var(--primary-text-color);
  }

  .calendar-actions button.cancel:hover {
    background: var(--secondary-background-color, #f5f5f5);
  }

  .calendar-actions button.confirm {
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
  }

  .calendar-actions button.confirm:hover {
    filter: brightness(1.1);
  }

  .calendar-actions button.confirm:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
