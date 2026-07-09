# Contributing to @isomorph-agency/cookie-consent

Thank you for your interest in contributing! This project aims to provide a high-quality, GDPR-compliant cookie consent solution for the Strapi + Next.js ecosystem.

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9 (npm workspaces)
- A local Strapi v5 instance (or v4 for the legacy plugin)

### Setup

```bash
git clone https://github.com/agenceisomorph/cookie-consent.git
cd cookie-consent
npm install
```

### Project Structure

```
cookie-consent/
├── packages/
│   ├── react/          # @isomorph-agency/cookie-consent — React components + core
│   ├── strapi-v5/      # strapi-plugin-cookie-consent — Strapi v5 plugin
│   └── strapi-v4/      # strapi-plugin-cookie-consent-v4 — Strapi v4 plugin
├── shared/             # Shared schema, validation, constants
└── tests/
    └── e2e/            # Playwright E2E tests
```

### Running Tests

```bash
# Unit tests (all packages)
npm test

# Unit tests with watch mode
npm run test:watch --workspace=packages/react

# E2E tests
npm run test:e2e

# Lint + typecheck
npm run lint
```

## How to Contribute

### Reporting Bugs

Open an issue on GitHub with:
- A clear title describing the problem
- Steps to reproduce
- Expected behavior vs actual behavior
- Your environment (Strapi version, Next.js version, browser)

### Suggesting Features

Open an issue with the `enhancement` label. Describe:
- The problem you're solving
- Your proposed solution
- Any alternatives you've considered

### Submitting Pull Requests

1. Fork the repository
2. Create a feature branch from `develop`: `git checkout -b feature/my-feature`
3. Make your changes
4. Write or update tests as needed
5. Run the full test suite: `npm test && npm run lint`
6. Commit with conventional commit messages (see below)
7. Push and open a PR against `develop`

### Commit Convention

We use conventional commits:

```
feat: add Finnish locale support
fix: correct focus trap in CookiePreferences modal
docs: update integration guide for Next.js 15
test: add E2E test for keyboard navigation
chore: update Strapi v5 peer dependency
```

### Code Style

- TypeScript strict mode
- Prettier for formatting
- Functional React components with hooks
- Server Components by default, `"use client"` only when justified
- Comments in English for public-facing code

## Areas Where We Need Help

- **Translations / i18n**: Adding locale support for banner and modal text
- **Adapter plugins**: New adapters beyond Strapi (WordPress, Directus, Payload CMS...)
- **Framework support**: Vue.js, Svelte, or Astro components
- **Accessibility audits**: Real-world screen reader and keyboard testing
- **Documentation**: Tutorials, video guides, integration examples

## Compliance Guidelines

This project has strict compliance requirements. Any contribution MUST maintain:

- **CNIL compliance**: 13-month cookie expiry, no pre-checked boxes, equal button visibility
- **GDPR**: First-party cookie only, no third-party tracking before consent
- **Google Consent Mode V2**: Correct signal mapping, `security_storage` always granted
- **WCAG 2.1 AA / RGAA 4.1**: Focus traps, keyboard navigation, contrast ratios, ARIA attributes

PRs that weaken compliance will not be merged.

## Code of Conduct

Be respectful, constructive, and inclusive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Open a discussion on GitHub or reach out at support@isomorph.fr.
