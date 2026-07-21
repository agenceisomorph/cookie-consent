/**
 * CookiePreferences — Modal de gestion fine des catégories.
 *
 * Animation : backdrop fade-in + carte scale+fade depuis le centre.
 * RGAA : focus trap complet, Escape, role dialog, aria-modal.
 * CNIL : necessary non modifiable, aucune case pre-cochee (hors necessary).
 * Services : filtre via activeServices depuis SERVICES_LIBRARY.
 * "Tout accepter" : active visuellement (1s delay) puis enregistre.
 * Styles : 100% inline — aucune dependance Tailwind.
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useConsent } from './useConsent';
import { createDefaultConsent } from '../core/consent';
import { SERVICES_LIBRARY, type ServiceKey } from '../services-library';
import type { ConsentState, ConsentCategory } from '../types/consent.types';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ActiveServices = Partial<Record<ConsentCategory, ServiceKey[]>>;

export interface CategoryConfig {
  key: ConsentCategory;
  label: string;
  description: string;
  locked?: boolean;
}

export interface CookiePreferencesProps {
  /** Emoji/icône affichée à gauche du titre (défaut : 🍪) */
  icon?: string;
  /** Taille de l'icône en px (défaut : 18) */
  iconSize?: number;
  /** Taille du titre en px (défaut : 15) */
  titleSize?: number;
  categories?: CategoryConfig[];
  activeServices?: ActiveServices;
  saveLabel?: string;
  refuseLabel?: string;
  acceptAllLabel?: string;
  title?: string;
}

// ─── Catégories par défaut ────────────────────────────────────────────────────

const DEFAULT_CATEGORIES: CategoryConfig[] = [
  {
    key: 'necessary',
    label: 'Nécessaires',
    description: 'Indispensables au fonctionnement du site. Ne peuvent pas être désactivés.',
    locked: true,
  },
  {
    key: 'analytics',
    label: 'Analytique',
    description: "Mesure de l'audience et du comportement des visiteurs. Données anonymisées.",
  },
  {
    key: 'advertising',
    label: 'Publicité',
    description: "Permettent de vous proposer des publicités pertinentes sur d'autres sites.",
  },
  {
    key: 'functional',
    label: 'Fonctionnel',
    description: "Améliorent l'expérience utilisateur grâce à des contenus enrichis.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createAcceptAllConsent(): ConsentState {
  return { necessary: true, analytics: true, advertising: true, functional: true };
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function CookiePreferences({
  icon = '🍪',
  iconSize = 18,
  titleSize = 15,
  categories = DEFAULT_CATEGORIES,
  activeServices = {},
  saveLabel = 'Enregistrer mes choix',
  refuseLabel = 'Tout refuser',
  acceptAllLabel = 'Tout accepter',
  title = 'Gérer mes préférences cookies',
}: CookiePreferencesProps) {
  const {
    consent,
    showPreferencesModal,
    closePreferences,
    saveCustom,
    refuseAll,
    acceptAll,
    focusCategory,
  } = useConsent();

  const [localState, setLocalState] = useState<ConsentState>(consent ?? createDefaultConsent());
  const [visible, setVisible] = useState(false);
  const [acceptingAll, setAcceptingAll] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<ConsentCategory | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (showPreferencesModal) {
      setLocalState(consent ?? createDefaultConsent());
      setAcceptingAll(false);
      const t = setTimeout(() => setVisible(true), 20);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [showPreferencesModal, consent]);

  useEffect(() => {
    if (visible && closeRef.current) closeRef.current.focus();
  }, [visible]);

  useEffect(() => {
    if (showPreferencesModal && focusCategory && modalRef.current) {
      const el = modalRef.current.querySelector<HTMLElement>(`[data-category="${focusCategory}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const toggle = el.querySelector<HTMLElement>('button[role="switch"]');
        if (toggle) setTimeout(() => toggle.focus(), 300);
      }
    }
  }, [showPreferencesModal, focusCategory]);

  useEffect(() => {
    if (!showPreferencesModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePreferences();
        return;
      }
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable.length) return;
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
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showPreferencesModal, closePreferences]);

  useEffect(() => {
    document.body.style.overflow = showPreferencesModal ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [showPreferencesModal]);

  const toggleCategory = useCallback(
    (key: ConsentCategory) => {
      if (key === 'necessary' || acceptingAll) return;
      setLocalState((prev) => ({ ...prev, [key]: !prev[key] }));
    },
    [acceptingAll],
  );

  const handleSave = useCallback(() => saveCustom(localState), [saveCustom, localState]);

  const handleRefuseAll = useCallback(() => {
    setVisible(false);
    setTimeout(refuseAll, 350);
  }, [refuseAll]);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(closePreferences, 350);
  }, [closePreferences]);

  const handleAcceptAll = useCallback(() => {
    setAcceptingAll(true);
    setLocalState(createAcceptAllConsent());
    setTimeout(() => {
      setVisible(false);
      setTimeout(acceptAll, 350);
    }, 900);
  }, [acceptAll]);

  if (!showPreferencesModal) return null;

  const primary = 'var(--cc-primary, #ff6600)';
  const primaryText = 'var(--cc-primary-text, #ffffff)';

  // Résoudre les services actifs par catégorie depuis SERVICES_LIBRARY
  const resolvedServices = (catKey: ConsentCategory) => {
    const keys = activeServices[catKey] ?? [];
    return keys.map((k) => SERVICES_LIBRARY[k]).filter(Boolean);
  };

  // Masquer les catégories explicitement vides dans activeServices (hors necessary)
  const visibleCategories = categories.filter((cat) => {
    if (cat.locked) return true;
    if (cat.key in activeServices) return (activeServices[cat.key] ?? []).length > 0;
    return true;
  });

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={handleClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10000,
          backgroundColor: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(2px)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.35s ease',
        }}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          zIndex: 10001,
          width: '90vw',
          maxWidth: '540px',
          maxHeight: '88vh',
          overflowY: 'auto',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.05)',
          fontFamily: 'var(--font-poppins, system-ui, sans-serif)',
          transform: visible
            ? 'translate(-50%, -50%) scale(1)'
            : 'translate(-50%, -52%) scale(0.96)',
          opacity: visible ? 1 : 0,
          transition:
            'opacity 0.35s cubic-bezier(0.16,1,0.3,1), transform 0.35s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid #f4f4f5',
            position: 'sticky',
            top: 0,
            backgroundColor: '#ffffff',
            zIndex: 1,
            borderRadius: '20px 20px 0 0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span aria-hidden="true" style={{ fontSize: `${iconSize}px` }}>
              {icon}
            </span>
            <h2
              style={{
                margin: 0,
                fontSize: `${titleSize}px`,
                fontWeight: 600,
                color: '#18181b',
                letterSpacing: '-0.01em',
              }}
            >
              {title}
            </h2>
          </div>

          <button
            ref={closeRef}
            type="button"
            onClick={handleClose}
            aria-label="Fermer les préférences cookies"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              minHeight: '44px',
              minWidth: '44px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#a1a1aa',
              fontSize: '18px',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease, color 0.15s ease',
              fontFamily: 'inherit',
              lineHeight: 1,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f4f4f5';
              (e.currentTarget as HTMLButtonElement).style.color = '#3f3f46';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
              (e.currentTarget as HTMLButtonElement).style.color = '#a1a1aa';
            }}
          >
            ✕
          </button>
        </div>

        {/* Catégories */}
        <div style={{ padding: '4px 0' }}>
          {visibleCategories.map((cat, i) => {
            const isExpanded = expandedCategory === cat.key;
            const isActive = localState[cat.key] === true;
            const services = resolvedServices(cat.key);

            return (
              <div
                key={cat.key}
                data-category={cat.key}
                style={{
                  borderBottom: i < visibleCategories.length - 1 ? '1px solid #f4f4f5' : 'none',
                }}
              >
                {/* Ligne principale */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 24px',
                    gap: '12px',
                  }}
                >
                  {/* Label cliquable pour expand */}
                  <button
                    type="button"
                    onClick={() =>
                      services.length > 0 && setExpandedCategory(isExpanded ? null : cat.key)
                    }
                    aria-expanded={services.length > 0 ? isExpanded : undefined}
                    style={{
                      flex: 1,
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: services.length > 0 ? 'pointer' : 'default',
                      fontFamily: 'inherit',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                    }}
                  >
                    {services.length > 0 && (
                      <span
                        style={{
                          display: 'inline-block',
                          marginTop: '3px',
                          fontSize: '9px',
                          color: '#a1a1aa',
                          transition: 'transform 0.2s ease',
                          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                          flexShrink: 0,
                        }}
                      >
                        ▶
                      </span>
                    )}
                    <div>
                      <strong
                        style={{
                          display: 'block',
                          fontSize: '13.5px',
                          fontWeight: 600,
                          color: '#18181b',
                          marginBottom: '2px',
                        }}
                      >
                        {cat.label}
                        {services.length > 0 && (
                          <span
                            style={{
                              marginLeft: '6px',
                              fontSize: '11px',
                              fontWeight: 400,
                              color: '#a1a1aa',
                            }}
                          >
                            ({services.length} service{services.length > 1 ? 's' : ''})
                          </span>
                        )}
                      </strong>
                      <p
                        style={{ margin: 0, fontSize: '12px', lineHeight: 1.55, color: '#a1a1aa' }}
                      >
                        {cat.description}
                      </p>
                    </div>
                  </button>

                  {/* Toggle ou badge */}
                  {cat.locked ? (
                    <span
                      style={{
                        flexShrink: 0,
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        color: primary,
                        backgroundColor:
                          'color-mix(in srgb, var(--cc-primary,#ff6600) 10%, transparent)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Actif
                    </span>
                  ) : (
                    <ToggleSwitch
                      checked={isActive}
                      label={`${cat.label} : ${isActive ? 'activé' : 'désactivé'}`}
                      onChange={() => toggleCategory(cat.key)}
                    />
                  )}
                </div>

                {/* Panel services — toujours rendu, animé via max-height */}
                {services.length > 0 && (
                  <div
                    style={{
                      maxHeight: isExpanded ? `${services.length * 72}px` : '0px',
                      opacity: isExpanded ? 1 : 0,
                      overflow: 'hidden',
                      transition: 'max-height 0.32s cubic-bezier(0.16,1,0.3,1), opacity 0.25s ease',
                    }}
                  >
                    <div
                      style={{
                        margin: '0 24px 12px',
                        borderRadius: '12px',
                        backgroundColor: '#fafafa',
                        border: '1px solid #f0f0f0',
                        overflow: 'hidden',
                      }}
                    >
                      {services.map((service, si) => (
                        <div
                          key={si}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 14px',
                            borderBottom: si < services.length - 1 ? '1px solid #f0f0f0' : 'none',
                          }}
                        >
                          <span
                            style={{
                              flexShrink: 0,
                              display: 'flex',
                              alignItems: 'center',
                              width: '24px',
                              justifyContent: 'center',
                            }}
                          >
                            {service.logo}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span
                              style={{
                                display: 'block',
                                fontSize: '12.5px',
                                fontWeight: 600,
                                color: '#3f3f46',
                              }}
                            >
                              {service.name}
                            </span>
                            {service.cookie && (
                              <span
                                style={{
                                  display: 'block',
                                  fontSize: '11px',
                                  color: '#a1a1aa',
                                  fontFamily: 'monospace',
                                  marginTop: '1px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {service.cookie}
                              </span>
                            )}
                            {service.duration && (
                              <span
                                style={{
                                  display: 'block',
                                  fontSize: '11px',
                                  color: '#a1a1aa',
                                  marginTop: '1px',
                                }}
                              >
                                Durée : {service.duration}
                              </span>
                            )}
                          </div>
                          <span
                            aria-hidden="true"
                            style={{
                              flexShrink: 0,
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: cat.locked || isActive ? '#22c55e' : '#e4e4e7',
                              transition: 'background-color 0.25s ease',
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '14px 24px 20px',
            borderTop: '1px solid #f4f4f5',
            position: 'sticky',
            bottom: 0,
            backgroundColor: '#ffffff',
            borderRadius: '0 0 20px 20px',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={handleRefuseAll}
            disabled={acceptingAll}
            style={{
              flex: '1 1 auto',
              minHeight: '44px',
              padding: '0 12px',
              borderRadius: '10px',
              border: '1.5px solid #e4e4e7',
              backgroundColor: '#ffffff',
              color: '#3f3f46',
              fontSize: '13px',
              fontWeight: 500,
              cursor: acceptingAll ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.15s ease',
              fontFamily: 'inherit',
              opacity: acceptingAll ? 0.4 : 1,
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              if (!acceptingAll)
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f4f4f5';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#ffffff';
            }}
          >
            {refuseLabel}
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={acceptingAll}
            style={{
              flex: '1 1 auto',
              minHeight: '44px',
              padding: '0 12px',
              borderRadius: '10px',
              border: '1.5px solid #e4e4e7',
              backgroundColor: '#ffffff',
              color: '#3f3f46',
              fontSize: '13px',
              fontWeight: 500,
              cursor: acceptingAll ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.15s ease',
              fontFamily: 'inherit',
              opacity: acceptingAll ? 0.4 : 1,
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              if (!acceptingAll)
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f4f4f5';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#ffffff';
            }}
          >
            {saveLabel}
          </button>

          <button
            type="button"
            onClick={handleAcceptAll}
            disabled={acceptingAll}
            style={{
              flex: '1 1 auto',
              minHeight: '44px',
              padding: '0 12px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: acceptingAll ? '#22c55e' : primary,
              color: primaryText,
              fontSize: '13px',
              fontWeight: 600,
              cursor: acceptingAll ? 'default' : 'pointer',
              transition: 'background-color 0.4s ease, opacity 0.15s ease',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
            onMouseEnter={(e) => {
              if (!acceptingAll) (e.currentTarget as HTMLButtonElement).style.opacity = '0.88';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = '1';
            }}
          >
            {acceptingAll && (
              <span aria-hidden="true" style={{ fontSize: '14px' }}>
                ✓
              </span>
            )}
            {acceptingAll ? 'Accepté !' : acceptAllLabel}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Toggle switch ────────────────────────────────────────────────────────────

interface ToggleSwitchProps {
  checked: boolean;
  label: string;
  onChange: () => void;
}

function ToggleSwitch({ checked, label, onChange }: ToggleSwitchProps) {
  const primary = 'var(--cc-primary, #ff6600)';
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      style={{
        position: 'relative',
        flexShrink: 0,
        width: '48px',
        height: '28px',
        minWidth: '48px',
        minHeight: '44px',
        padding: 0,
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        outline: 'none',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          transform: 'translateY(-50%)',
          width: '48px',
          height: '28px',
          borderRadius: '14px',
          backgroundColor: checked ? primary : '#e4e4e7',
          transition: 'background-color 0.25s ease',
        }}
      />
      <span
        style={{
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
          left: checked ? '22px' : '2px',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
          transition: 'left 0.2s cubic-bezier(0.16,1,0.3,1)',
        }}
      />
    </button>
  );
}
