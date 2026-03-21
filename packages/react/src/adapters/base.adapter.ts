/**
 * base.adapter.ts — Interface ConsentAdapter
 * Contrat pour tous les adapters de persistance du consentement.
 * Extensible V2+ (Firebase, Supabase, API custom, etc.)
 */

// L'interface est définie dans types/adapter.types.ts.
// Ce fichier re-exporte pour la cohérence du barrel.
export type { ConsentAdapter, StrapiAdapterConfig } from '../types/adapter.types';
