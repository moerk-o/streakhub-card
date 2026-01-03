/**
 * Internationalization utilities for StreakHub Card
 */

import type {
  Translations,
  EditorTranslations,
  HomeAssistant,
  SupportedLanguage,
} from '../types';

// =============================================================================
// Translation Definitions
// =============================================================================

const TRANSLATIONS: Record<'en' | 'de', Translations> = {
  en: {
    days: 'days',
    day: 'day',
    today: 'Today',
    yesterday: 'Yesterday',
    day_before: 'Day before yesterday',
    more: 'More…',
    when_event: 'When did it happen?',
    cancel: 'Cancel',
    confirm: 'Confirm',
    invalid_entity: 'Invalid entity type',
    invalid_data: 'Invalid entity data',
    unavailable: 'Unavailable',
    close: 'Close',
  },
  de: {
    days: 'Tage',
    day: 'Tag',
    today: 'Heute',
    yesterday: 'Gestern',
    day_before: 'Vorgestern',
    more: 'Mehr…',
    when_event: 'Wann war das Ereignis?',
    cancel: 'Abbrechen',
    confirm: 'Bestätigen',
    invalid_entity: 'Ungültiger Entity-Typ',
    invalid_data: 'Ungültige Entity-Daten',
    unavailable: 'Nicht verfügbar',
    close: 'Schließen',
  },
};

const EDITOR_TRANSLATIONS: Record<'en' | 'de', EditorTranslations> = {
  en: {
    entity: 'Entity',
    name: 'Name (optional)',
    variant: 'Variant',
    borderless: 'Borderless',
    trophy: 'Trophy/Medal',
    rank: 'Rank (#1, #2, #3)',
    days_counter: 'Days Counter',
    interactions: 'Interactions',
    tap_action: 'Tap action',
    hold_action: 'Hold action',
    double_tap_action: 'Double tap action',
    reset_flow: 'Reset flow',
    reset_flow_description: 'Opens streak reset dialog',
  },
  de: {
    entity: 'Entität',
    name: 'Name (optional)',
    variant: 'Variante',
    borderless: 'Rahmenlos',
    trophy: 'Pokal/Medaille',
    rank: 'Rang (#1, #2, #3)',
    days_counter: 'Tage-Zähler',
    interactions: 'Interaktionen',
    tap_action: 'Antippen',
    hold_action: 'Festhalten',
    double_tap_action: 'Doppeltippen',
    reset_flow: 'Reset-Ablauf',
    reset_flow_description: 'Öffnet den Streak-Reset-Dialog',
  },
};

// =============================================================================
// Language Resolution
// =============================================================================

/**
 * Get the language code from Home Assistant locale
 */
function getHassLanguage(hass: HomeAssistant | undefined): string | undefined {
  const lang = hass?.locale?.language;
  if (!lang) return undefined;
  // Extract base language from locale (e.g., "de-DE" -> "de")
  return lang.split('-')[0]?.toLowerCase();
}

/**
 * Check if a language is supported
 */
function isSupportedLanguage(lang: string): lang is 'en' | 'de' {
  return lang === 'en' || lang === 'de';
}

/**
 * Get translations based on config and Home Assistant settings
 *
 * Resolution order:
 * 1. Config language override (if not 'auto')
 * 2. Home Assistant user language
 * 3. Fallback to English
 */
export function getTranslations(
  hass: HomeAssistant | undefined,
  configLanguage?: SupportedLanguage
): Translations {
  // 1. Config override
  if (configLanguage && configLanguage !== 'auto') {
    if (isSupportedLanguage(configLanguage)) {
      return TRANSLATIONS[configLanguage];
    }
  }

  // 2. Home Assistant user language
  const hassLang = getHassLanguage(hass);
  if (hassLang && isSupportedLanguage(hassLang)) {
    return TRANSLATIONS[hassLang];
  }

  // 3. Fallback to English
  return TRANSLATIONS.en;
}

/**
 * Get editor translations based on Home Assistant settings
 */
export function getEditorTranslations(
  hass: HomeAssistant | undefined
): EditorTranslations {
  const hassLang = getHassLanguage(hass);
  if (hassLang && isSupportedLanguage(hassLang)) {
    return EDITOR_TRANSLATIONS[hassLang];
  }
  return EDITOR_TRANSLATIONS.en;
}

/**
 * Get the first day of the week from Home Assistant locale
 *
 * @returns 0 for Sunday, 1 for Monday
 */
export function getWeekStart(hass: HomeAssistant | undefined): number {
  const firstWeekday = hass?.locale?.first_weekday;

  if (firstWeekday === 'sunday') {
    return 0;
  }

  // Default: Monday (European standard)
  return 1;
}
