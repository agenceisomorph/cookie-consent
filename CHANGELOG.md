# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-21

### Added

- Initial public release
- **React package** (`@isomorph/cookie-consent`)
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
