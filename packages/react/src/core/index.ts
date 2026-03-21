// @isomorph/cookie-consent — core barrel export
export {
  DEFAULT_EXPIRY_MONTHS,
  COOKIE_DATA_VERSION,
  OPTIONAL_CATEGORIES,
  createDefaultConsent,
  createAcceptAllConsent,
  resolveAction,
  getExpiryDate,
  validateConsentState,
  parseConsentFromCookie,
  serializeConsent,
  generateSessionId,
} from './consent';

export { COOKIE_NAME, readConsent, writeConsent, clearConsent, hasValidConsent } from './storage';

export {
  GCM_SIGNAL_MAP,
  ALL_GCM_SIGNALS,
  mapCategoryToSignals,
  createDefaultGcmState,
  consentStateToGcm,
  setDefaultConsent,
  updateConsent,
  getInlineConsentScript,
} from './gcm';
