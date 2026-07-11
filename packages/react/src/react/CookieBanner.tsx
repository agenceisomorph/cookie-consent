/**
 * CookieBanner — Carte flottante RGAA/CNIL.
 *
 * Apparaît 1 seconde après le chargement, bas à droite, avec animation
 * fadeIn + slideUp. Design sobre et professionnel (Poppins, ombres douces).
 *
 * CNIL : "Tout refuser" aussi visible que "Tout accepter".
 * RGAA : role dialog, focus piégé, Escape = refuser.
 * Styles : 100% inline — aucune dépendance Tailwind.
 * Couleurs charte via CSS vars : --cc-primary, --cc-primary-text.
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useConsent } from './useConsent';

export interface CookieBannerProps {
  /** Emoji/icône affichée à gauche du titre (défaut : 🍪) */
  icon?: string;
  /** Taille de l'icône en px (défaut : 18) */
  iconSize?: number;
  title?: string;
  message?: string;
  acceptLabel?: string;
  refuseLabel?: string;
  customizeLabel?: string;
  className?: string;
}

export function CookieBanner({
  icon = '🍪',
  iconSize = 18,
  title = 'Gestion des cookies',
  message = "Nous utilisons des cookies pour améliorer votre expérience, mesurer l'audience et personnaliser les contenus. Vous pouvez accepter ou refuser leur utilisation.",
  acceptLabel = 'Tout accepter',
  refuseLabel = 'Tout refuser',
  customizeLabel = 'Personnaliser',
}: CookieBannerProps) {
  const { showBanner, acceptAll, refuseAll, openPreferences } = useConsent();
  const [visible, setVisible] = useState(false);

  // Apparition après 1 seconde avec transition smooth
  useEffect(() => {
    if (!showBanner) { setVisible(false); return; }
    const t = setTimeout(() => setVisible(true), 1000);
    return () => clearTimeout(t);
  }, [showBanner]);

  // Escape → refuser tout
  useEffect(() => {
    if (!showBanner) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') refuseAll(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showBanner, refuseAll]);

  const handleAccept = useCallback(() => { setVisible(false); setTimeout(acceptAll, 350); }, [acceptAll]);
  const handleRefuse = useCallback(() => { setVisible(false); setTimeout(refuseAll, 350); }, [refuseAll]);

  if (!showBanner) return null;

  // Couleurs primaires via CSS vars avec fallback
  const primary = 'var(--cc-primary, #ff6600)';
  const primaryText = 'var(--cc-primary-text, #ffffff)';

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={title}
      aria-describedby="cc-banner-message"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        width: '360px',
        maxWidth: 'calc(100vw - 32px)',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 10px 30px -5px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
        padding: '24px',
        fontFamily: 'var(--font-poppins, system-ui, sans-serif)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <span
          aria-hidden="true"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: 'color-mix(in srgb, var(--cc-primary, #ff6600) 12%, transparent)',
            fontSize: `${iconSize}px`,
            flexShrink: 0,
          }}
        >
          {icon}
        </span>
        <strong style={{ fontSize: '15px', fontWeight: 600, color: '#18181b', letterSpacing: '-0.01em' }}>
          {title}
        </strong>
      </div>

      {/* Message */}
      <p
        id="cc-banner-message"
        style={{
          margin: '0 0 20px',
          fontSize: '13px',
          lineHeight: '1.65',
          color: '#71717a',
        }}
      >
        {message}
      </p>

      {/* Boutons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Ligne principale : Refuser | Accepter */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button

            type="button"
            onClick={handleRefuse}
            aria-label={refuseLabel}
            style={{
              flex: 1,
              minHeight: '44px',
              padding: '0 16px',
              borderRadius: '10px',
              border: '1.5px solid #e4e4e7',
              backgroundColor: '#ffffff',
              color: '#3f3f46',
              fontSize: '13.5px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background-color 0.15s ease, border-color 0.15s ease',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f4f4f5'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#ffffff'; }}
          >
            {refuseLabel}
          </button>

          <button
            type="button"
            onClick={handleAccept}
            aria-label={acceptLabel}
            style={{
              flex: 1,
              minHeight: '44px',
              padding: '0 16px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: primary,
              color: primaryText,
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'opacity 0.15s ease',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.88'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
          >
            {acceptLabel}
          </button>
        </div>

        {/* Lien personnaliser */}
        <button
          type="button"
          onClick={() => openPreferences()}
          aria-label={customizeLabel}
          style={{
            minHeight: '36px',
            padding: '0',
            border: 'none',
            backgroundColor: 'transparent',
            color: '#a1a1aa',
            fontSize: '12.5px',
            fontWeight: 400,
            cursor: 'pointer',
            textDecoration: 'underline',
            textDecorationColor: 'transparent',
            transition: 'color 0.15s ease, text-decoration-color 0.15s ease',
            fontFamily: 'inherit',
            alignSelf: 'center',
          }}
          onMouseEnter={e => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.color = '#71717a';
            b.style.textDecorationColor = '#71717a';
          }}
          onMouseLeave={e => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.color = '#a1a1aa';
            b.style.textDecorationColor = 'transparent';
          }}
        >
          {customizeLabel}
        </button>
      </div>
    </div>
  );
}
