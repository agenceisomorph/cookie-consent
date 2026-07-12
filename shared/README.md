# @isomorph-agency/cookie-consent-shared

[![npm version](https://img.shields.io/npm/v/@isomorph-agency/cookie-consent-shared.svg)](https://www.npmjs.com/package/@isomorph-agency/cookie-consent-shared)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/agenceisomorph/cookie-consent/blob/main/LICENSE)

Shared schema, validation and constants for the **ISOMORPH cookie consent stack** — a free, open-source GDPR cookie consent solution (Google Consent Mode V2, CNIL-compliant).

**This is an internal dependency.** You normally don't install it directly — it is pulled in by the packages below. It exists so the Strapi v4 and v5 plugins and the React package share a single source of truth for the consent content-type schema, payload validation and category constants.

## The stack

| Package | Description |
|---------|-------------|
| [`@isomorph-agency/cookie-consent`](https://www.npmjs.com/package/@isomorph-agency/cookie-consent) | React banner + preferences modal + GCM V2 + blocked-content facades |
| [`strapi-plugin-cookie-consent`](https://www.npmjs.com/package/strapi-plugin-cookie-consent) | Strapi v5 plugin — consent proof logging |
| [`strapi-plugin-cookie-consent-v4`](https://www.npmjs.com/package/strapi-plugin-cookie-consent-v4) | Strapi v4 plugin |
| **`@isomorph-agency/cookie-consent-shared`** | This package |

## Contents

- `schema.json` — single source of truth for the `cookie-consents` content-type
- `validation.js` — consent payload validation (shared by v4/v5 controllers)
- `constants.js` — consent categories, cookie duration (13 months, CNIL), config defaults

Full documentation, contributing guide and issue tracker: [github.com/agenceisomorph/cookie-consent](https://github.com/agenceisomorph/cookie-consent)

## License

[MIT](https://github.com/agenceisomorph/cookie-consent/blob/main/LICENSE) — free for personal and commercial use.

Built with care by [ISOMORPH](https://isomorph.fr).
