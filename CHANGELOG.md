# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2026-07-09

### Fixed

- **Strapi v5 plugin** (`strapi-plugin-cookie-consent`) — la 1.0.1 ne persistait
  aucun consentement en Strapi v5. Trois défauts corrigés (vérifiés end-to-end
  sur Strapi 5.50.1) :
  - **Chargement** : ajout de `strapi-server.js` à la racine. Le loader de plugins
    Strapi v5 résout la partie serveur via ce fichier (ou l'export `strapi-server`),
    jamais via `main` — sans lui, `register`/`bootstrap`/routes n'étaient jamais
    chargés (collection et permission publique jamais créées).
  - **Route** : `prefix: ''` sur le routeur — Strapi préfixe par défaut les routes
    de plugin par le nom du plugin (`/api/cookie-consent/cookie-consents`), alors
    que l'adapter React et la doc ciblent `/api/cookie-consents`.
  - **Controller** : accepte désormais le corps enveloppé `{ data: record }`
    (format envoyé par l'adapter React) en plus du format à plat — la validation
    échouait systématiquement auparavant.
- **Garde-fou packaging** (`verify-tarball.mjs`) : exige `strapi-server.js` dans le
  tarball pour tout package `strapi.kind === 'plugin'` (le contrôle précédent ne
  couvrait que `main`/`exports`, qui ne sont pas utilisés par le loader v5).

## [1.0.1] - 2026-07-09

### Fixed

- **React package** (`@isomorph-agency/cookie-consent`)
  - Republished with complete `dist/` — the 1.0.0 tarball was published without a prior
    build and contained no compiled files, breaking both `.` and `./react` entry points
  - `CookieProvider` no longer returns `null` before initialization — children are now
    always rendered so Next.js SSR output includes the full page HTML
- **Strapi plugins** (`strapi-plugin-cookie-consent`, `strapi-plugin-cookie-consent-v4`)
  - Fixed runtime crash: controllers required the non-existent
    `@isomorph/cookie-consent-shared` package instead of `@isomorph-agency/cookie-consent-shared`
- **Packaging & CI**
  - `prepublishOnly` guard on every publishable package: the tarball is verified against
    declared `exports`/`main` paths before any publish
  - CI publish job now uses the `NPM_TOKEN` secret (GitHub token is not valid on the npm
    registry) and publishes the shared package first
  - Pinned internal dependency `@isomorph-agency/cookie-consent-shared` to `^1.0.0`
    (was `*`)

### Deprecated

- `@isomorphagency/cookie-consent` and `@isomorphagency/cookie-consent-shared`
  (scope without hyphen, published by mistake) — use the `@isomorph-agency` scope

## [1.0.0] - 2026-03-21

### Added

- Initial public release
- **React package** (`@isomorph-agency/cookie-consent`)
  - `CookieProvider` — global context with GCM V2 initialization
  - `CookieBanner` — fixed bottom banner, WCAG 2.1 AA accessible (focus trap, keyboard nav, ARIA)
  - `CookiePreferences` — detailed modal with per-category toggle switches
  - `useConsent` hook — full consent API (acceptAll, refuseAll, updateCategory, isGranted...)
  - `YoutubeEmbed`, `GoogleMap`, `BlockedContent` — blocked content facades with activation buttons
  - First-party cookie storage (SameSite=Lax, Secure on HTTPS, 13-month expiry)
  - Google Consent Mode V2 (Advanced) — 6 signals, inline default script helper
  - Strapi adapter (fire & forget, non-blocking)
  - CSS custom properties for branding (`--cc-primary`, `--cc-primary-text`)
- **Strapi v5 plugin** (`strapi-plugin-cookie-consent`)
  - `cookie-consents` collection with 12 attributes
  - Auto-configured public POST permission on bootstrap
  - Rate limiting (10 req/IP/min)
  - Server-side validation and IP anonymization (3 octets)
  - `countBySource()` and `purgeExpired()` services
- **Strapi v4 plugin** (`strapi-plugin-cookie-consent-v4`)
  - Same features as v5, using Entity Service API
  - Shared schema via `shared/schema.json`
- **Tests**
  - ~50 unit tests (Vitest, coverage >= 90% on core/)
  - 18 E2E tests (Playwright)
- **CI/CD**
  - GitHub Actions pipeline (6 jobs: quality, unit, integration, build, e2e, publish)
