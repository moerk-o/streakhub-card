/**
 * Type definitions for StreakHub Card
 */

// =============================================================================
// Home Assistant Types (minimal definitions for card usage)
// =============================================================================

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed: string;
  last_updated: string;
  context: {
    id: string;
    parent_id: string | null;
    user_id: string | null;
  };
}

export interface HassEntityRegistryEntry {
  entity_id: string;
  device_id?: string;
  name?: string;
  icon?: string;
  platform: string;
  disabled_by?: string | null;
}

export interface HassDeviceRegistryEntry {
  id: string;
  name: string;
  manufacturer?: string;
  model?: string;
}

export interface HassLocale {
  language: string;
  first_weekday?: 'monday' | 'sunday' | 'saturday';
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  entities?: Record<string, HassEntityRegistryEntry>;
  devices?: Record<string, HassDeviceRegistryEntry>;
  locale?: HassLocale;
  callService(
    domain: string,
    service: string,
    serviceData?: Record<string, unknown>
  ): Promise<void>;
}

// =============================================================================
// StreakHub Entity Types
// =============================================================================

/**
 * A single streak entry from the top_3 attribute
 */
export interface StreakEntry {
  /** Position in the ranking (1, 2, or 3) */
  rank: number;
  /** Start date of the streak (ISO 8601, e.g., "2026-01-02") */
  start: string;
  /** End date of the streak, null if this is the current active streak */
  end: string | null;
  /** Number of days in this streak */
  days: number;
}

/**
 * Expected attributes on a StreakHub rank sensor
 */
export interface StreakHubEntityAttributes {
  top_3: StreakEntry[];
  friendly_name?: string;
  [key: string]: unknown;
}

// =============================================================================
// Action Configuration
// =============================================================================

export type ActionType =
  | 'more-info'
  | 'none'
  | 'navigate'
  | 'call-service'
  | 'reset-flow';

export interface ActionConfig {
  action: ActionType;
  /** Navigation path for 'navigate' action */
  navigation_path?: string;
  /** Service name for 'call-service' action (e.g., "light.turn_on") */
  service?: string;
  /** Service data for 'call-service' action */
  service_data?: Record<string, unknown>;
  /** Target entity for 'call-service' action */
  target?: {
    entity_id?: string | string[];
    device_id?: string | string[];
    area_id?: string | string[];
  };
}

// =============================================================================
// Card Configuration
// =============================================================================

export type CardVariant = 'standard' | 'compact';
export type SupportedLanguage = 'auto' | 'en' | 'de';

export interface ShowConfig {
  /** Show trophy/medal icon */
  trophy?: boolean;
  /** Show rank indicator (#1, #2, #3) */
  rank?: boolean;
  /** Show days counter */
  days?: boolean;
  /** Show tracker name */
  name?: boolean;
}

export interface StreakHubCardConfig {
  /** Entity ID of the StreakHub rank sensor (required) */
  entity: string;
  /** Alternative entity ID for service calls (for renamed entities) */
  service_target?: string;
  /** Custom name to display (overrides device name) */
  name?: string;
  /** Display variant: 'standard' (vertical) or 'compact' (horizontal) */
  variant?: CardVariant;
  /** Hide card border/background */
  borderless?: boolean;
  /** Configure which elements to show */
  show?: ShowConfig;
  /** Action on tap */
  tap_action?: ActionConfig;
  /** Action on hold/long-press */
  hold_action?: ActionConfig;
  /** Action on double tap */
  double_tap_action?: ActionConfig;
  /** Language override */
  language?: SupportedLanguage;
}

// =============================================================================
// Internal State Types
// =============================================================================

export type ExpandedState = 'closed' | 'buttons' | 'calendar';

export type ResetFlowView = 'buttons' | 'calendar';

// =============================================================================
// Translation Types
// =============================================================================

export interface Translations {
  days: string;
  day: string;
  today: string;
  yesterday: string;
  day_before: string;
  more: string;
  when_event: string;
  cancel: string;
  confirm: string;
  invalid_entity: string;
  invalid_data: string;
  unavailable: string;
  close: string;
}

// =============================================================================
// Card Sizing Types (Home Assistant)
// =============================================================================

export interface GridOptions {
  columns?: number;
  min_columns?: number;
  max_columns?: number;
  rows?: number | 'auto';
  min_rows?: number;
  max_rows?: number;
}

// =============================================================================
// Custom Cards Registration
// =============================================================================

export interface CustomCardEntry {
  type: string;
  name: string;
  description: string;
  preview?: boolean;
  documentationURL?: string;
}

declare global {
  interface Window {
    customCards?: CustomCardEntry[];
  }
}

// =============================================================================
// Utility Types
// =============================================================================

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: Required<
  Pick<StreakHubCardConfig, 'variant' | 'borderless' | 'show' | 'language'>
> & {
  tap_action: ActionConfig;
  hold_action: ActionConfig;
  double_tap_action: ActionConfig;
} = {
  variant: 'standard',
  borderless: false,
  show: {
    trophy: true,
    rank: true,
    days: true,
    name: true,
  },
  tap_action: { action: 'more-info' },
  hold_action: { action: 'reset-flow' },
  double_tap_action: { action: 'none' },
  language: 'auto',
};

/**
 * Type guard to check if an entity has StreakHub attributes
 */
export function isStreakHubEntity(
  entity: HassEntity | undefined
): entity is HassEntity & { attributes: StreakHubEntityAttributes } {
  return Array.isArray(entity?.attributes?.top_3);
}

/**
 * Extract the current (active) streak from top_3
 */
export function getCurrentStreak(
  top3: StreakEntry[] | undefined
): StreakEntry | null {
  if (!top3) return null;
  return top3.find((entry) => entry.end === null) ?? null;
}
