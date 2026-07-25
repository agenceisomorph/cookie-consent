import { defineConfig } from 'vitest/config';

/**
 * Config Vitest racine du monorepo — @isomorph/cookie-consent.
 *
 * Sans ce fichier, `vitest run` lancé depuis la racine (hors des scripts npm
 * documentés) retombe sur la config par défaut de Vitest : environnement
 * `node` (au lieu du `jsdom` déclaré dans packages/react/vitest.config.ts) et
 * inclusion de tout fichier `*.spec.ts` du dépôt, y compris les specs
 * Playwright de `tests/e2e/` qui importent `@playwright/test` — un module
 * incompatible avec le runner Vitest.
 *
 * Résultat sans ce fichier : `ReferenceError: window/document is not
 * defined` sur les tests dépendant du DOM (core/gcm.test.ts,
 * core/storage.test.ts) + échec de résolution de module sur les 2 specs
 * e2e, soit 4 fichiers en échec / 34 tests en échec — alors que la même
 * suite est 100% verte via les commandes documentées (`npm run test
 * --workspace=packages/react` et la config d'intégration dédiée).
 *
 * `projects` délègue la découverte à chaque config de package (ici
 * packages/react/vitest.config.ts, seul package testé côté Vitest à ce
 * jour) et exclut de fait tout ce qui est hors des packages déclarés —
 * notamment les specs Playwright de tests/e2e/.
 */
export default defineConfig({
  test: {
    projects: ['packages/react'],
  },
});
