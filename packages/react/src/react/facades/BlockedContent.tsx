/**
 * BlockedContent — Façade générique pour contenu bloqué par le consentement.
 *
 * Affiche un message d'information + bouton d'action directe
 * si la catégorie de cookies requise n'est pas acceptée.
 *
 * Règle ISOMORPH : jamais de contenu vide ni de placeholder silencieux.
 * Chaque composant dynamique DOIT informer l'utilisateur ET proposer une action.
 *
 * Design : 100 % styles inline — aucune dépendance Tailwind.
 * Couleurs via CSS vars : --cc-primary, --cc-primary-text.
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

/** Icône cadenas — SVG inline, aucun appel réseau */
function LockIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: '22px', height: '22px', display: 'block' }}
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

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

  if (isGranted(category)) {
    return <>{children}</>;
  }

  const categoryLabel = CATEGORY_LABELS[category] ?? category;
  const displayMessage =
    message ?? `Ce contenu nécessite votre accord pour les cookies ${categoryLabel}.`;
  const displayButtonLabel = buttonLabel ?? 'Afficher ce contenu';

  const primary = 'var(--cc-primary, #ff6600)';
  const primaryText = 'var(--cc-primary-text, #ffffff)';

  return (
    <div
      className={className}
      style={{
        minHeight,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        textAlign: 'center',
        borderRadius: '16px',
        border: '1px solid color-mix(in srgb, var(--cc-primary, #ff6600) 18%, #e4e4e7)',
        backgroundColor: 'color-mix(in srgb, var(--cc-primary, #ff6600) 5%, #ffffff)',
        fontFamily: 'var(--font-poppins, system-ui, sans-serif)',
      }}
      role="region"
      aria-label={`Contenu bloqué : ${contentName}`}
    >
      {/* Icône cadenas dans un cercle teinté — même convention que l'icône bannière */}
      <span
        aria-hidden="true"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: 'color-mix(in srgb, var(--cc-primary, #ff6600) 12%, transparent)',
          color: primary,
          marginBottom: '20px',
          flexShrink: 0,
        }}
      >
        <LockIcon />
      </span>

      {/* Nom du contenu */}
      <p
        style={{
          margin: '0 0 8px',
          fontSize: '15px',
          fontWeight: 600,
          color: '#18181b',
          letterSpacing: '-0.01em',
          lineHeight: 1.3,
        }}
      >
        {contentName}
      </p>

      {/* Message explicatif */}
      <p
        style={{
          margin: '0 0 24px',
          maxWidth: '300px',
          fontSize: '13px',
          lineHeight: 1.65,
          // #71717a tombait a 4,47:1 sur un fond teinte en vert (charte OTRE),
          // sous le seuil RGAA de 4,5:1. Cette valeur donne 5,9:1 sur les quatre
          // chartes du parc, sans effacer la hierarchie avec le titre.
          color: '#5f5f68',
        }}
      >
        {displayMessage}
      </p>

      {/* Bouton CTA — même style que "Tout accepter" dans CookieBanner */}
      <button
        type="button"
        onClick={() => openPreferences(category)}
        style={{
          minHeight: '44px',
          padding: '0 24px',
          borderRadius: '10px',
          border: 'none',
          // Pas de `outline: none` : l'anneau natif reste le filet de securite si
          // les gestionnaires de focus ci-dessous ne s'appliquent pas.
          backgroundColor: primary,
          color: primaryText,
          fontSize: '13.5px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'opacity 0.15s ease',
          fontFamily: 'inherit',
          letterSpacing: '-0.01em',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.opacity = '0.88';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.opacity = '1';
        }}
        onFocus={(e) => {
          // Anneau double : blanc intérieur + couleur primaire extérieure
          // Visible sur fonds clairs comme foncés — RGAA 4.1 crit. 10.7
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            '0 0 0 2px #ffffff, 0 0 0 5px var(--cc-primary, #ff6600)';
        }}
        onBlur={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
        }}
      >
        {displayButtonLabel}
      </button>
    </div>
  );
}
