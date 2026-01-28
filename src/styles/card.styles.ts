/**
 * Card styles for StreakHub Card
 */

import { css } from 'lit';

export const cardStyles = css`
  /* ==========================================================================
     CSS Custom Properties
     ========================================================================== */

  :host {
    /* Trophy/Medal sizes */
    --streakhub-trophy-size: 80px;
    --streakhub-trophy-size-compact: 24px;

    /* Trophy colors */
    --streakhub-gold: #ffd700;
    --streakhub-silver: #c0c0c0;
    --streakhub-bronze: #cd7f32;
    --streakhub-neutral: var(--secondary-text-color, #888);

    /* Spacing */
    --streakhub-padding: 16px;
    --streakhub-padding-compact: 12px;

    /* Typography */
    --streakhub-name-size: 1.1rem;
    --streakhub-days-size: 1.5rem;
    --streakhub-rank-size: 1rem;

    display: block;
  }

  /* ==========================================================================
     Base Card
     ========================================================================== */

  ha-card {
    height: 100%;
    box-sizing: border-box;
    cursor: pointer;
    outline: none;
    position: relative;
    overflow: hidden;
  }

  ha-card:focus-visible {
    box-shadow: 0 0 0 2px var(--primary-color);
  }

  /* Borderless variant */
  ha-card.borderless {
    background: transparent;
    box-shadow: none;
    border: none;
  }

  /* ==========================================================================
     Standard Layout (Vertical)
     ========================================================================== */

  .standard {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--streakhub-padding);
    min-height: 150px;
    text-align: center;
    gap: 8px;
  }

  .standard .name {
    font-size: var(--streakhub-name-size);
    font-weight: 500;
    color: var(--primary-text-color);
    margin-bottom: 4px;
  }

  .standard .trophy-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .standard .rank {
    font-size: var(--streakhub-rank-size);
    font-weight: 600;
    color: var(--secondary-text-color);
  }

  .standard .days {
    font-size: var(--streakhub-days-size);
    font-weight: 600;
    color: var(--primary-text-color);
  }

  /* ==========================================================================
     Compact Layout (Horizontal)
     ========================================================================== */

  .compact {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: var(--streakhub-padding-compact);
    gap: 12px;
  }

  .compact .trophy-container {
    flex-shrink: 0;
    display: flex;
    align-items: center;
  }

  .compact .content {
    flex: 1;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-width: 0;
  }

  .compact .name {
    font-size: 1rem;
    font-weight: 500;
    color: var(--primary-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .compact .days {
    font-size: 1rem;
    font-weight: 600;
    color: var(--primary-text-color);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .compact .rank {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--secondary-text-color);
    margin-left: 4px;
  }

  /* ==========================================================================
     Statistics Section (Standard Mode)
     ========================================================================== */

  .stats-divider {
    width: 100%;
    height: 1px;
    background: var(--divider-color, #e0e0e0);
    margin: 8px 0;
  }

  .stats-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
  }

  .stats-entry {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    color: var(--primary-text-color);
  }

  .stats-entry streakhub-trophy {
    --streakhub-trophy-size: 20px;
    --streakhub-trophy-size-compact: 20px;
  }

  .stats-entry .stats-days {
    font-weight: 500;
  }

  /* ==========================================================================
     Statistics Section (Compact Mode)
     ========================================================================== */

  .compact .stats-inline {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    color: var(--secondary-text-color);
    flex-shrink: 0;
  }

  .compact .stats-inline::before {
    content: '(';
  }

  .compact .stats-inline::after {
    content: ')';
  }

  .compact .stats-item {
    white-space: nowrap;
  }

  /* ==========================================================================
     Error State
     ========================================================================== */

  .error-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--streakhub-padding);
    gap: 8px;
    color: var(--error-color, #db4437);
    text-align: center;
  }

  .error-content ha-icon {
    --mdc-icon-size: 32px;
  }

  .error-content .message {
    font-size: 0.9rem;
  }

  .error-content .entity-id {
    font-size: 0.75rem;
    color: var(--secondary-text-color);
    word-break: break-all;
  }

  /* ==========================================================================
     Reset Flow Expansion
     ========================================================================== */

  .expansion {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--card-background-color, var(--ha-card-background, #fff));
    border-top: 1px solid var(--divider-color, #e0e0e0);
    padding: var(--streakhub-padding);
  }

  .expansion-header {
    font-size: 0.9rem;
    color: var(--secondary-text-color);
    margin-bottom: 12px;
    text-align: center;
  }

  /* ==========================================================================
     Service Error (Inline)
     ========================================================================== */

  .service-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: var(--streakhub-padding);
    text-align: center;
  }

  .service-error ha-icon {
    --mdc-icon-size: 24px;
    color: var(--error-color, #db4437);
  }

  .service-error .message {
    font-size: 0.9rem;
    color: var(--primary-text-color);
  }

`;

export const resetFlowStyles = css`
  /* ==========================================================================
     Reset Flow Component
     ========================================================================== */

  :host {
    display: block;
  }

  .quick-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
  }

  .quick-buttons button {
    flex: 1 1 auto;
    min-width: 80px;
    padding: 8px 12px;
    border: 1px solid var(--divider-color, #e0e0e0);
    border-radius: 8px;
    background: var(--card-background-color, var(--ha-card-background, #fff));
    color: var(--primary-text-color);
    font-size: 0.9rem;
    cursor: pointer;
    transition: background-color 0.1s;
  }

  .quick-buttons button:hover {
    background: var(--secondary-background-color, #f5f5f5);
  }

  .quick-buttons button:active {
    background: var(--divider-color, #e0e0e0);
  }

  .quick-buttons button:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  .quick-buttons button.more {
    background: transparent;
    border-style: dashed;
  }

  /* Loading state */
  .quick-buttons button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
