/**
 * Trophy/Medal icon component for StreakHub Card
 */

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { CardVariant } from '../types';

/**
 * Displays a trophy (rank 1-3) or medal (rank 4+) icon
 *
 * @element streakhub-trophy
 *
 * @prop {number} rank - Current rank (1, 2, 3, or 0/4+ for medal)
 * @prop {CardVariant} variant - Display variant ('standard' or 'compact')
 */
@customElement('streakhub-trophy')
export class StreakHubTrophy extends LitElement {
  @property({ type: Number, reflect: true })
  rank = 0;

  @property({ type: String, reflect: true })
  variant: CardVariant = 'standard';

  static override styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    ha-icon {
      display: block;
    }

    /* Gold trophy (rank 1) */
    :host([rank='1']) ha-icon {
      color: var(--streakhub-gold, #ffd700);
    }

    /* Silver trophy (rank 2) */
    :host([rank='2']) ha-icon {
      color: var(--streakhub-silver, #c0c0c0);
    }

    /* Bronze trophy (rank 3) */
    :host([rank='3']) ha-icon {
      color: var(--streakhub-bronze, #cd7f32);
    }

    /* Neutral medal (rank 0 or 4+) */
    :host([rank='0']) ha-icon,
    :host(:not([rank='1']):not([rank='2']):not([rank='3'])) ha-icon {
      color: var(--streakhub-neutral, var(--secondary-text-color, #888));
    }

    /* Standard size */
    :host([variant='standard']) ha-icon {
      --mdc-icon-size: var(--streakhub-trophy-size, 80px);
    }

    /* Compact size */
    :host([variant='compact']) ha-icon {
      --mdc-icon-size: var(--streakhub-trophy-size-compact, 24px);
    }
  `;

  /**
   * Get the appropriate icon based on rank
   */
  private get _icon(): string {
    // Rank 1-3 gets trophy, others get medal
    if (this.rank >= 1 && this.rank <= 3) {
      return 'mdi:trophy';
    }
    return 'mdi:medal-outline';
  }

  protected override render() {
    return html`<ha-icon .icon=${this._icon}></ha-icon>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'streakhub-trophy': StreakHubTrophy;
  }
}
