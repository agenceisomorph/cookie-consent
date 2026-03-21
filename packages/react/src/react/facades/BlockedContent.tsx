/**
 * BlockedContent — Façade générique pour contenu bloqué par le consentement.
 *
 * Affiche un message d'information + bouton d'action directe
 * si la catégorie de cookies requise n'est pas acceptée.
 *
 * Règle ISOMORPH : jamais de contenu vide ni de placeholder silencieux.
 * Chaque composant dynamique DOIT informer l'utilisateur ET proposer une action.
 */

'use client';

import { useConsent } from '../useConsent';
import type { ConsentCategory } from '../../types/consent.types';
import type { ReactNode } from 'react';

/** Labels par catégorie */
const CATEGORY_LABELS: Record<ConsentCategory, string> = {
  necessary: 'nécessaires',
  analytics: 'analytiques',
  advertising: 'publicitaires',
  functional: 'fonctionnels',
};

export interface BlockedContentProps {
  /** Catégorie de cookies requise */
  category: ConsentCategory;
  /** Nom du contenu bloqué (ex: "Vidéo YouTube", "Carte Google Maps") */
  contentName: string;
  /** Contenu à afficher si le consentement est donné */
  children: ReactNode;
  /** Hauteur minimale du placeholder (évite le CLS) */
  minHeight?: string;
  /** className additionnel */
  className?: string;
  /** Message personnalisé (sinon message par défaut) */
  message?: string;
  /** Label du bouton (sinon label par défaut) */
  buttonLabel?: string;
}

export function BlockedContent({
  category,
  contentName,
  children,
  minHeight = '300px',
  className = '',
  message,
  buttonLabel,
}: BlockedContentProps) {
  const { isGranted, openPreferences } = useConsent();

  // Si le consentement est donné, afficher le contenu
  if (isGranted(category)) {
    return <>{children}</>;
  }

  const categoryLabel = CATEGORY_LABELS[category] ?? category;
  const defaultMessage = `Ce contenu nécessite les cookies ${categoryLabel} pour s'afficher.`;
  const defaultButtonLabel = `Activer les cookies ${categoryLabel}`;

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center ${className}`}
      style={{ minHeight }}
      role="region"
      aria-label={`${contentName} — consentement requis`}
    >
      <p className="mb-1 text-base font-semibold text-gray-700">{contentName}</p>

      <p className="mb-4 max-w-sm text-sm text-gray-500">{message ?? defaultMessage}</p>

      <button
        type="button"
        onClick={() => openPreferences(category)}
        className="min-h-[44px] rounded-md px-6 py-2.5 text-sm font-semibold transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        style={{
          backgroundColor: 'var(--cc-primary, #2563eb)',
          color: 'var(--cc-primary-text, #ffffff)',
        }}
      >
        {buttonLabel ?? defaultButtonLabel}
      </button>

      <p className="mt-4 text-xs text-gray-400">
        Vous pouvez modifier vos préférences à tout moment depuis le pied de page.
      </p>
    </div>
  );
}
