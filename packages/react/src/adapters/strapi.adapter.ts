/**
 * strapi.adapter.ts — Adapter Strapi pour la persistance du consentement.
 * Fire & forget — ne doit jamais bloquer l'UX.
 */

import type { ConsentAdapter, StrapiAdapterConfig } from '../types/adapter.types';
import type { ConsentRecord } from '../types/consent.types';

const DEFAULT_TIMEOUT = 5000;

/**
 * Crée un adapter Strapi pour le POST des consentements.
 * Compatible Strapi v4 et v5 (même endpoint POST /api/cookie-consents).
 */
export function createStrapiAdapter(config: StrapiAdapterConfig): ConsentAdapter {
  const { apiUrl, timeout = DEFAULT_TIMEOUT } = config;

  // Nettoyer l'URL (retirer le trailing slash)
  const baseUrl = apiUrl.replace(/\/+$/, '');

  return {
    async save(record: ConsentRecord): Promise<void> {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        // Strapi v4 attend { data: { ... } }, v5 accepte les deux formats.
        // On envoie le format v4 pour compatibilité maximale.
        const response = await fetch(`${baseUrl}/cookie-consents`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data: record }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          // Log silencieux — fire & forget, on ne bloque pas l'UX
          console.warn(`[cookie-consent] Erreur Strapi ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        // Erreur réseau ou timeout — silencieux
        if (error instanceof DOMException && error.name === 'AbortError') {
          console.warn('[cookie-consent] Timeout Strapi — consentement non persisté.');
        } else {
          console.warn('[cookie-consent] Erreur réseau Strapi:', error);
        }
      }
    },
  };
}
