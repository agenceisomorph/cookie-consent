/**
 * useConsent — Hook public pour accéder au contexte de consentement.
 *
 * Usage :
 * ```tsx
 * const { consent, acceptAll, refuseAll, updateCategory, showPreferences } = useConsent();
 * ```
 */

'use client';

import { useContext } from 'react';
import { ConsentContext } from './CookieProvider';
import type { ConsentState, ConsentCategory } from '../types/consent.types';

export interface UseConsentReturn {
  /** État actuel du consentement (null si pas encore donné) */
  consent: ConsentState | null;
  /** true si le bandeau doit être affiché */
  showBanner: boolean;
  /** true si la modale de préférences est ouverte */
  showPreferencesModal: boolean;
  /** Accepter toutes les catégories */
  acceptAll: () => void;
  /** Refuser toutes les catégories optionnelles */
  refuseAll: () => void;
  /** Mettre à jour une catégorie spécifique */
  updateCategory: (category: ConsentCategory, value: boolean) => void;
  /** Sauvegarder un état personnalisé */
  saveCustom: (state: ConsentState) => void;
  /** Ouvrir la modale de préférences */
  openPreferences: (focusCategory?: ConsentCategory) => void;
  /** Fermer la modale de préférences */
  closePreferences: () => void;
  /** Vérifier si une catégorie est acceptée */
  isGranted: (category: ConsentCategory) => boolean;
  /** Catégorie à focus dans la modale (si ouverte depuis une façade) */
  focusCategory: ConsentCategory | null;
}

export function useConsent(): UseConsentReturn {
  const context = useContext(ConsentContext);

  if (!context) {
    throw new Error(
      '[cookie-consent] useConsent doit être utilisé à l\'intérieur de <CookieProvider>.'
    );
  }

  return context;
}
