/**
 * Interface ConsentAdapter — extensible V2+
 */
import type { ConsentRecord } from './consent.types';

export interface ConsentAdapter {
  /** Envoie le consentement au backend. Fire & forget — ne doit jamais bloquer l'UX. */
  save(record: ConsentRecord): Promise<void>;
}

export interface StrapiAdapterConfig {
  /** URL de l'API Strapi (ex: https://admin.otrepaca.fr/api) */
  apiUrl: string;
  /** Timeout en ms (défaut: 5000) */
  timeout?: number;
}
