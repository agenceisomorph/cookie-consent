/**
 * CookieProvider — Contexte global de consentement + init GCM V2.
 *
 * Ce provider DOIT envelopper l'application dans layout.tsx.
 * Il lit le cookie existant au mount, initialise les signaux GCM V2,
 * et expose le contexte via useConsent().
 *
 * Usage :
 * ```tsx
 * <CookieProvider config={{ strapiUrl: '...', siteDomain: 'otrepaca.fr' }}>
 *   {children}
 * </CookieProvider>
 * ```
 */

'use client';

import { createContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react';

import type { ConsentState, ConsentCategory, CookieConsentConfig } from '../types/consent.types';

import {
  createDefaultConsent,
  createAcceptAllConsent,
  resolveAction,
  generateSessionId,
  getExpiryDate,
  DEFAULT_EXPIRY_MONTHS,
} from '../core/consent';

import { readConsent, writeConsent } from '../core/storage';
import { updateConsent as updateGcmConsent } from '../core/gcm';
import { createStrapiAdapter } from '../adapters/strapi.adapter';
import type { UseConsentReturn } from './useConsent';

// ─── Context ─────────────────────────────────────────────────────

export const ConsentContext = createContext<UseConsentReturn | null>(null);

// ─── Props ───────────────────────────────────────────────────────

export interface CookieProviderProps {
  children: ReactNode;
  config: CookieConsentConfig;
}

// ─── Provider ────────────────────────────────────────────────────

export function CookieProvider({ children, config }: CookieProviderProps) {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [focusCategory, setFocusCategory] = useState<ConsentCategory | null>(null);
  const [initialized, setInitialized] = useState(false);

  const adapter = useMemo(
    () => createStrapiAdapter({ apiUrl: config.strapiUrl }),
    [config.strapiUrl],
  );

  // ─── Init : lire le cookie existant au mount ────────────────────

  useEffect(() => {
    const existing = readConsent();

    if (existing) {
      setConsent(existing);
      // Mettre à jour les signaux GCM V2 avec le consentement existant
      updateGcmConsent(existing);
      setShowBanner(false);
    } else {
      setShowBanner(true);
    }

    setInitialized(true);
  }, []);

  // ─── Persister le consentement (cookie + Strapi) ────────────────

  const persistConsent = useCallback(
    (state: ConsentState) => {
      // Écrire le cookie first-party
      writeConsent(state, {
        expiryMonths: config.expiryMonths ?? DEFAULT_EXPIRY_MONTHS,
      });

      // Mettre à jour les signaux GCM V2
      updateGcmConsent(state);

      // Envoyer à Strapi (fire & forget)
      const now = new Date();
      adapter.save({
        sessionId: generateSessionId(),
        ...state,
        gcmVersion: 'v2',
        consentDate: now.toISOString(),
        expiryDate: getExpiryDate(now, config.expiryMonths ?? DEFAULT_EXPIRY_MONTHS).toISOString(),
        source: config.siteDomain,
        action: resolveAction(state),
      });

      // Mettre à jour le state React
      setConsent(state);
      setShowBanner(false);
      setShowPreferencesModal(false);
      setFocusCategory(null);

      // Callback utilisateur
      config.onConsentChange?.(state);
    },
    [adapter, config],
  );

  // ─── Actions ────────────────────────────────────────────────────

  const acceptAll = useCallback(() => {
    persistConsent(createAcceptAllConsent());
  }, [persistConsent]);

  const refuseAll = useCallback(() => {
    persistConsent(createDefaultConsent());
  }, [persistConsent]);

  const updateCategory = useCallback(
    (category: ConsentCategory, value: boolean) => {
      const current = consent ?? createDefaultConsent();
      if (category === 'necessary') return; // Toujours true
      const updated: ConsentState = { ...current, [category]: value };
      // Ne pas persister ici — attendre saveCustom
      setConsent(updated);
    },
    [consent],
  );

  const saveCustom = useCallback(
    (state: ConsentState) => {
      persistConsent({ ...state, necessary: true });
    },
    [persistConsent],
  );

  const openPreferences = useCallback((category?: ConsentCategory) => {
    setFocusCategory(category ?? null);
    setShowPreferencesModal(true);
  }, []);

  const closePreferences = useCallback(() => {
    setShowPreferencesModal(false);
    setFocusCategory(null);
  }, []);

  const isGranted = useCallback(
    (category: ConsentCategory): boolean => {
      if (!consent) return category === 'necessary';
      return consent[category] === true;
    },
    [consent],
  );

  // ─── Value ──────────────────────────────────────────────────────

  const value: UseConsentReturn = useMemo(
    () => ({
      consent,
      showBanner,
      showPreferencesModal,
      acceptAll,
      refuseAll,
      updateCategory,
      saveCustom,
      openPreferences,
      closePreferences,
      isGranted,
      focusCategory,
    }),
    [
      consent,
      showBanner,
      showPreferencesModal,
      acceptAll,
      refuseAll,
      updateCategory,
      saveCustom,
      openPreferences,
      closePreferences,
      isGranted,
      focusCategory,
    ],
  );

  // Ne rien rendre avant l'initialisation (évite le flash du bandeau)
  if (!initialized) return null;

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}
