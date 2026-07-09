/**
 * @isomorph-agency/cookie-consent/server — entrée SERVER-SAFE.
 *
 * Contient uniquement les helpers sans dépendance React évaluée au chargement,
 * importables depuis un Server Component Next.js (RSC). Le point d'entrée
 * principal (`.`) re-exporte les composants React et évalue `createContext`
 * au chargement du module — il casse donc dans un RSC (constat d'intégration 2026-07-09,
 * layout.tsx : `TypeError: createContext is not a function` au build).
 *
 * Usage typique (layout.tsx, Server Component) :
 * ```tsx
 * import { getInlineConsentScript } from '@isomorph-agency/cookie-consent/server';
 * <Script id="gcm-consent-default" strategy="beforeInteractive">
 *   {getInlineConsentScript()}
 * </Script>
 * ```
 */

// GCM V2 — script inline consent default + helpers de signaux (imports types only)
export {
  GCM_SIGNAL_MAP,
  ALL_GCM_SIGNALS,
  mapCategoryToSignals,
  createDefaultGcmState,
  consentStateToGcm,
  getInlineConsentScript,
} from './core/gcm';

// Types (import type → effacés à la compilation, server-safe)
export type * from './types/consent.types';
export type * from './types/gcm.types';
