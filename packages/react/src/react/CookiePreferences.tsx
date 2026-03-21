/**
 * CookiePreferences — Modale fine par catégorie de cookies.
 *
 * RGAA : focus trap complet, navigation clavier (Tab, Escape),
 * rôle dialog, aria-modal, contrastes ≥ 4.5:1, touch targets ≥ 44×44px.
 * CNIL : toutes catégories off par défaut, necessary non modifiable.
 *
 * Stylé avec Tailwind CSS. Couleurs primaires via CSS custom properties.
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useConsent } from './useConsent';
import { createDefaultConsent } from '../core/consent';
import type { ConsentState, ConsentCategory } from '../types/consent.types';

export interface CategoryConfig {
  key: ConsentCategory;
  label: string;
  description: string;
  locked?: boolean;
}

export interface CookiePreferencesProps {
  categories?: CategoryConfig[];
  saveLabel?: string;
  refuseLabel?: string;
  title?: string;
  className?: string;
}

const DEFAULT_CATEGORIES: CategoryConfig[] = [
  {
    key: 'necessary',
    label: 'Nécessaires',
    description: 'Sécurité du site, formulaires, sessions. Toujours actif.',
    locked: true,
  },
  {
    key: 'analytics',
    label: 'Analytique',
    description: 'Mesure d\'audience (Google Analytics). Données anonymisées.',
  },
  {
    key: 'advertising',
    label: 'Publicité',
    description: 'Publicités ciblées (Google Ads, Meta Pixel).',
  },
  {
    key: 'functional',
    label: 'Fonctionnel',
    description: 'YouTube, Google Maps, chat en ligne.',
  },
];

export function CookiePreferences({
  categories = DEFAULT_CATEGORIES,
  saveLabel = 'Enregistrer mes choix',
  refuseLabel = 'Tout refuser',
  title = 'Gérer mes préférences cookies',
  className = '',
}: CookiePreferencesProps) {
  const {
    consent,
    showPreferencesModal,
    closePreferences,
    saveCustom,
    refuseAll,
    focusCategory,
  } = useConsent();

  const [localState, setLocalState] = useState<ConsentState>(
    consent ?? createDefaultConsent()
  );

  const modalRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Sync quand la modale s'ouvre
  useEffect(() => {
    if (showPreferencesModal) {
      setLocalState(consent ?? createDefaultConsent());
    }
  }, [showPreferencesModal, consent]);

  // Focus le bouton fermer à l'ouverture
  useEffect(() => {
    if (showPreferencesModal && closeRef.current) {
      closeRef.current.focus();
    }
  }, [showPreferencesModal]);

  // Scroll + focus vers la catégorie ciblée (ouverture depuis une façade)
  useEffect(() => {
    if (showPreferencesModal && focusCategory && modalRef.current) {
      const el = modalRef.current.querySelector(
        `[data-category="${focusCategory}"]`
      );
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const toggle = el.querySelector('button[role="switch"]');
        if (toggle instanceof HTMLElement) {
          setTimeout(() => toggle.focus(), 300);
        }
      }
    }
  }, [showPreferencesModal, focusCategory]);

  // Focus trap + Escape
  useEffect(() => {
    if (!showPreferencesModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePreferences();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0]!;
        const last = focusable[focusable.length - 1]!;

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showPreferencesModal, closePreferences]);

  // Bloquer le scroll du body
  useEffect(() => {
    if (showPreferencesModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showPreferencesModal]);

  const toggleCategory = useCallback((key: ConsentCategory) => {
    if (key === 'necessary') return;
    setLocalState((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleSave = useCallback(() => {
    saveCustom(localState);
  }, [saveCustom, localState]);

  if (!showPreferencesModal) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[10000] bg-black/50"
        onClick={closePreferences}
        aria-hidden="true"
      />

      {/* Modale */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`fixed left-1/2 top-1/2 z-[10001] max-h-[80vh] w-[90vw] max-w-[540px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl bg-white shadow-2xl ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
          <h2 className="m-0 text-lg font-semibold text-gray-900">
            {title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={closePreferences}
            aria-label="Fermer les préférences cookies"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center border-none bg-transparent text-2xl text-gray-600 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            &times;
          </button>
        </div>

        {/* Catégories */}
        <div className="py-2">
          {categories.map((cat) => (
            <div
              key={cat.key}
              data-category={cat.key}
              className="flex items-start justify-between border-b border-gray-100 px-6 py-4"
            >
              <div className="flex-1 pr-4">
                <strong className="text-gray-900">{cat.label}</strong>
                <p className="mt-1 text-[0.8125rem] text-gray-500">
                  {cat.description}
                </p>
              </div>

              {cat.locked ? (
                <span
                  className="self-center whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold"
                  style={{
                    color: 'var(--cc-primary, #2563eb)',
                    backgroundColor: 'color-mix(in srgb, var(--cc-primary, #2563eb) 10%, transparent)',
                  }}
                  aria-label={`${cat.label} : toujours actif`}
                >
                  Actif
                </span>
              ) : (
                <button
                  type="button"
                  role="switch"
                  aria-checked={localState[cat.key] === true}
                  aria-label={`${cat.label} : ${localState[cat.key] ? 'activé' : 'désactivé'}`}
                  onClick={() => toggleCategory(cat.key)}
                  className="relative flex min-h-[44px] min-w-[52px] flex-shrink-0 items-center self-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  <span
                    className="block h-7 w-[52px] rounded-full transition-colors duration-200"
                    style={{
                      backgroundColor: localState[cat.key]
                        ? 'var(--cc-primary, #2563eb)'
                        : '#d1d5db',
                    }}
                  />
                  <span
                    className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow transition-[left] duration-200"
                    style={{
                      left: localState[cat.key] ? '26px' : '4px',
                    }}
                    aria-hidden="true"
                  />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-gray-200 px-6 py-4">
          <button
            type="button"
            onClick={refuseAll}
            className="min-h-[44px] rounded-md border border-gray-300 bg-transparent px-5 py-2.5 font-medium text-gray-800 transition-colors hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            {refuseLabel}
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="min-h-[44px] rounded-md border-none px-5 py-2.5 font-semibold transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            style={{
              backgroundColor: 'var(--cc-primary, #2563eb)',
              color: 'var(--cc-primary-text, #ffffff)',
            }}
          >
            {saveLabel}
          </button>
        </div>
      </div>
    </>
  );
}
