/**
 * CookieBanner — Bandeau cookies RGAA.
 *
 * Position : bas de page, pleine largeur, fixe.
 * CNIL : "Refuser" aussi visible que "Accepter", pas de case pré-cochée.
 * RGAA : focus trap, navigation clavier, rôle dialog, aria-labels.
 *
 * Stylé avec Tailwind CSS (stack ISOMORPH).
 * Couleurs via CSS custom properties pour la charte graphique client :
 * --cc-primary, --cc-primary-text
 */

'use client';

import { useRef, useEffect } from 'react';
import { useConsent } from './useConsent';

export interface CookieBannerProps {
  /** Texte principal du bandeau */
  message?: string;
  /** Label du bouton "Tout accepter" */
  acceptLabel?: string;
  /** Label du bouton "Tout refuser" */
  refuseLabel?: string;
  /** Label du bouton "Personnaliser" */
  customizeLabel?: string;
  /** className additionnel pour le conteneur */
  className?: string;
}

export function CookieBanner({
  message = 'Ce site utilise des cookies pour améliorer votre expérience, mesurer l\'audience et personnaliser les contenus.',
  acceptLabel = 'Tout accepter',
  refuseLabel = 'Tout refuser',
  customizeLabel = 'Personnaliser',
  className = '',
}: CookieBannerProps) {
  const { showBanner, acceptAll, refuseAll, openPreferences } = useConsent();
  const firstBtnRef = useRef<HTMLButtonElement>(null);

  // Focus le premier bouton quand le bandeau apparaît
  useEffect(() => {
    if (showBanner && firstBtnRef.current) {
      firstBtnRef.current.focus();
    }
  }, [showBanner]);

  // Escape → refuser tout
  useEffect(() => {
    if (!showBanner) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') refuseAll();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showBanner, refuseAll]);

  if (!showBanner) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Gestion des cookies"
      aria-describedby="cc-banner-message"
      className={`fixed bottom-0 left-0 right-0 z-[9999] border-t border-gray-200 bg-white px-6 py-4 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] ${className}`}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-4">
        <p
          id="cc-banner-message"
          className="m-0 max-w-[700px] flex-[1_1_300px] text-[0.9375rem] leading-relaxed text-gray-800"
        >
          {message}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <button
            ref={firstBtnRef}
            type="button"
            onClick={refuseAll}
            aria-label={refuseLabel}
            className="min-h-[44px] min-w-[44px] rounded-md border border-gray-300 bg-transparent px-5 py-2.5 text-[0.9375rem] font-medium text-gray-800 transition-colors hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            {refuseLabel}
          </button>

          <button
            type="button"
            onClick={() => openPreferences()}
            aria-label={customizeLabel}
            className="min-h-[44px] min-w-[44px] rounded-md border border-gray-300 bg-transparent px-5 py-2.5 text-[0.9375rem] font-medium text-gray-800 transition-colors hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            {customizeLabel}
          </button>

          <button
            type="button"
            onClick={acceptAll}
            aria-label={acceptLabel}
            className="min-h-[44px] min-w-[44px] rounded-md border-none bg-[--cc-primary,#2563eb] px-5 py-2.5 text-[0.9375rem] font-semibold text-[--cc-primary-text,#ffffff] transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            style={{
              backgroundColor: 'var(--cc-primary, #2563eb)',
              color: 'var(--cc-primary-text, #ffffff)',
            }}
          >
            {acceptLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
