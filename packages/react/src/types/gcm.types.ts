/**
 * Types Google Consent Mode V2
 */

/** Signaux GCM V2 */
export type GcmSignal =
  | 'analytics_storage'
  | 'ad_storage'
  | 'ad_user_data'
  | 'ad_personalization'
  | 'functionality_storage'
  | 'security_storage';

/** Valeur d'un signal GCM */
export type GcmConsentValue = 'granted' | 'denied';

/** État complet des signaux GCM V2 */
export type GcmConsentState = Record<GcmSignal, GcmConsentValue>;

/** Interface gtag globale (déclaration pour window) */
export interface GtagFunction {
  (...args: unknown[]): void;
}

declare global {
  interface Window {
    gtag?: GtagFunction;
    dataLayer?: unknown[];
  }
}
