import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

/**
 * Contrat d'adresse entre l'adapter React et les deux plugins Strapi.
 *
 * L'adapter poste sur `${apiUrl}/cookie-consents`. Cote Strapi, une route de
 * plugin est prefixee par defaut par le nom du plugin : sans `prefix: ''`, elle
 * sort sur `/api/cookie-consent/cookie-consents` et le site recoit un 405 sans
 * la moindre erreur cote serveur. Le defaut est donc silencieux des deux cotes.
 *
 * C'est arrive en production : le paquet v4 1.0.3 avait oublie ce reglage que le
 * v5 portait deja (OTRE, 29/07/2026). Ce test verrouille les deux paquets.
 */
const require = createRequire(import.meta.url);
const racine = resolve(__dirname, '../../../..');

const PLUGINS = [
  { nom: 'strapi-v4', chemin: `${racine}/packages/strapi-v4/server/routes/cookie-consent.js` },
  { nom: 'strapi-v5', chemin: `${racine}/packages/strapi-v5/server/routes/cookie-consent.js` },
];

describe('contrat d adresse plugins Strapi <-> adapter React', () => {
  it.each(PLUGINS)('$nom expose bien /api/cookie-consents', ({ chemin }) => {
    const routes = require(chemin);

    // Sans prefix vide, Strapi insere le nom du plugin dans l'adresse.
    expect(routes.prefix).toBe('');

    const post = routes.routes.find((r: { method: string; path: string }) => r.method === 'POST');
    expect(post).toBeDefined();
    expect(post.path).toBe('/cookie-consents');

    // Adresse finale telle que l'adapter la construit : `${apiUrl}${path}`.
    expect(`/api${routes.prefix}${post.path}`).toBe('/api/cookie-consents');
  });
});
