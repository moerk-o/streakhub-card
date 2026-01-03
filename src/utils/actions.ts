/**
 * Action handling utilities for StreakHub Card
 */

import type { ActionConfig, HomeAssistant } from '../types';

// =============================================================================
// Action Handler
// =============================================================================

/**
 * Handle a card action based on configuration
 *
 * @param element The element dispatching the event (needed for more-info)
 * @param hass Home Assistant instance
 * @param config Action configuration
 * @param entityId Entity ID for more-info action
 */
export function handleAction(
  element: HTMLElement,
  hass: HomeAssistant,
  config: ActionConfig,
  entityId: string
): void {
  switch (config.action) {
    case 'more-info':
      fireMoreInfoEvent(element, entityId);
      break;

    case 'navigate':
      if (config.navigation_path) {
        navigateTo(config.navigation_path);
      }
      break;

    case 'call-service':
      if (config.service) {
        callService(hass, config);
      }
      break;

    case 'none':
    case 'reset-flow':
      // These are handled by the card itself
      break;
  }
}

// =============================================================================
// More-Info Dialog
// =============================================================================

/**
 * Fire a more-info event to open the entity details dialog
 * Must be dispatched from an element within the HA DOM tree
 */
function fireMoreInfoEvent(element: HTMLElement, entityId: string): void {
  const event = new CustomEvent('hass-more-info', {
    detail: { entityId },
    bubbles: true,
    composed: true,
  });
  element.dispatchEvent(event);
}

// =============================================================================
// Navigation
// =============================================================================

/**
 * Navigate to a path within Home Assistant
 */
function navigateTo(path: string): void {
  history.pushState(null, '', path);
  const event = new CustomEvent('location-changed', {
    bubbles: true,
    composed: true,
  });
  window.dispatchEvent(event);
}

// =============================================================================
// Service Calls
// =============================================================================

/**
 * Call a Home Assistant service
 */
async function callService(
  hass: HomeAssistant,
  config: ActionConfig
): Promise<void> {
  if (!config.service) return;

  const [domain, service] = config.service.split('.');
  if (!domain || !service) return;

  const serviceData: Record<string, unknown> = {
    ...config.service_data,
  };

  // Add target if specified
  if (config.target) {
    Object.assign(serviceData, config.target);
  }

  await hass.callService(domain, service, serviceData);
}

// =============================================================================
// StreakHub Service Calls
// =============================================================================

/**
 * Call the StreakHub reset service to set a new streak start date
 *
 * @param hass Home Assistant instance
 * @param entityId Target entity ID
 * @param date New streak start date (ISO format: YYYY-MM-DD)
 */
export async function callStreakHubReset(
  hass: HomeAssistant,
  entityId: string,
  date: string
): Promise<void> {
  await hass.callService('streakhub', 'set_streak_start', {
    entity_id: entityId,
    date: date,
  });
}

// =============================================================================
// Gesture Detection
// =============================================================================

export interface GestureHandlers {
  onTap?: () => void;
  onHold?: () => void;
  onDoubleTap?: () => void;
}

interface GestureState {
  startTime: number;
  startX: number;
  startY: number;
  holdTimer: ReturnType<typeof setTimeout> | null;
  lastTapTime: number;
}

const HOLD_DURATION = 500; // ms
const DOUBLE_TAP_DELAY = 300; // ms
const MOVE_THRESHOLD = 10; // px

/**
 * Create gesture handlers for tap, hold, and double-tap detection
 *
 * @param handlers Callback functions for each gesture type
 * @returns Event handlers to attach to the element
 */
export function createGestureHandlers(handlers: GestureHandlers): {
  onPointerDown: (e: PointerEvent) => void;
  onPointerUp: (e: PointerEvent) => void;
  onPointerCancel: () => void;
} {
  const state: GestureState = {
    startTime: 0,
    startX: 0,
    startY: 0,
    holdTimer: null,
    lastTapTime: 0,
  };

  function clearHoldTimer(): void {
    if (state.holdTimer) {
      clearTimeout(state.holdTimer);
      state.holdTimer = null;
    }
  }

  function onPointerDown(e: PointerEvent): void {
    state.startTime = Date.now();
    state.startX = e.clientX;
    state.startY = e.clientY;

    // Set up hold detection
    if (handlers.onHold) {
      clearHoldTimer();
      state.holdTimer = setTimeout(() => {
        handlers.onHold?.();
        state.holdTimer = null;
      }, HOLD_DURATION);
    }
  }

  function onPointerUp(e: PointerEvent): void {
    const duration = Date.now() - state.startTime;
    const moveX = Math.abs(e.clientX - state.startX);
    const moveY = Math.abs(e.clientY - state.startY);
    const moved = moveX > MOVE_THRESHOLD || moveY > MOVE_THRESHOLD;

    clearHoldTimer();

    // If pointer moved too much, ignore
    if (moved) {
      return;
    }

    // If it was a hold, don't trigger tap
    if (duration >= HOLD_DURATION) {
      return;
    }

    // Check for double tap
    const now = Date.now();
    const timeSinceLastTap = now - state.lastTapTime;

    if (timeSinceLastTap < DOUBLE_TAP_DELAY && handlers.onDoubleTap) {
      handlers.onDoubleTap();
      state.lastTapTime = 0; // Reset to prevent triple-tap
    } else {
      // Single tap - delay to check for double tap
      state.lastTapTime = now;

      if (handlers.onTap && !handlers.onDoubleTap) {
        // No double tap handler, fire immediately
        handlers.onTap();
      } else if (handlers.onTap) {
        // Wait to see if double tap comes
        setTimeout(() => {
          if (state.lastTapTime === now) {
            handlers.onTap?.();
          }
        }, DOUBLE_TAP_DELAY);
      }
    }
  }

  function onPointerCancel(): void {
    clearHoldTimer();
  }

  return {
    onPointerDown,
    onPointerUp,
    onPointerCancel,
  };
}
