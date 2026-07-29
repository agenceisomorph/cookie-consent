import { describe, it, expect, vi } from 'vitest';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

/**
 * Contrat entre l'adapter React et les deux plugins Strapi.
 *
 * L'adapter poste `{ data: record }` sur `${apiUrl}/cookie-consents`. Les deux
 * bouts doivent correspondre sur l'adresse ET sur la forme du corps. Les deux
 * ont diverge sans que rien ne le signale : le site recevait un 405 puis un 400,
 * l'adapter n'echouant jamais bruyamment, et aucun consentement n'etait
 * conserve. Constate en production sur OTRE le 29/07/2026, quatre mois apres la
 * mise en ligne du plugin v4.
 *
 * Ces tests verrouillent le contrat cote serveur. Ils ne remplacent pas un essai
 * reel contre un Strapi qui tourne, mais ils attrapent les deux regressions
 * exactes qui se sont produites.
 */
const require = createRequire(import.meta.url);
const racine = resolve(__dirname, '../../../..');

describe('adresse exposee', () => {
  it('v5 retire le prefixe de plugin via prefix vide', () => {
    const routes = require(`${racine}/packages/strapi-v5/server/routes/cookie-consent.js`);
    expect(routes.prefix).toBe('');
    const post = routes.routes.find((r: { method: string }) => r.method === 'POST');
    expect(`/api${routes.prefix}${post.path}`).toBe('/api/cookie-consents');
  });

  it('v4 expose /api/cookie-consents au niveau application', () => {
    // Sur v4, `prefix: ''` dans le fichier de routes est ignore (voir le
    // commentaire dans routes/cookie-consent.js) : c'est register.js qui doit
    // declarer la route hors du prefixe de plugin.
    const register = require(`${racine}/packages/strapi-v4/server/register.js`);

    const declarees: Array<{ prefix?: string; routes: Array<{ path: string; method: string }> }> =
      [];
    const strapi = {
      server: { routes: (r: (typeof declarees)[number]) => declarees.push(r) },
      log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    };

    register({ strapi });

    const appLevel = declarees.find((d) =>
      d.routes.some((r) => r.path === '/cookie-consents' && r.method === 'POST'),
    );
    expect(appLevel, 'aucune route /cookie-consents declaree').toBeDefined();
    expect(appLevel!.prefix).toBe('');
  });
});

describe('forme du corps acceptee par le controleur v4', () => {
  const charger = () =>
    require(`${racine}/packages/strapi-v4/server/controllers/cookie-consent.js`);

  const enregistrement = {
    sessionId: 'test',
    necessary: true,
    analytics: false,
    advertising: false,
    functional: false,
    action: 'refuse_all',
    source: 'exemple.fr',
  };

  const contexte = (body: unknown) => {
    const ctx = {
      request: { body, headers: {}, ip: '203.0.113.4' },
      badRequest: vi.fn(),
      internalServerError: vi.fn(),
      send: vi.fn(),
    };
    return ctx;
  };

  it.each([
    ['enveloppe { data } — ce qu envoie l adapter React', { data: enregistrement }],
    ['a plat — compatibilite avec les appels existants', enregistrement],
  ])('accepte le corps %s', async (_libelle, body) => {
    const controleur = charger();
    const ctx = contexte(body);

    // entityService simule : on ne teste que la validation du corps.
    (globalThis as Record<string, unknown>).strapi = {
      entityService: { create: async () => ({ id: 1 }) },
      log: { error: vi.fn() },
    };

    await controleur.create(ctx);

    expect(ctx.badRequest, 'le corps a ete refuse').not.toHaveBeenCalled();
    expect(ctx.send).toHaveBeenCalled();
  });
});
