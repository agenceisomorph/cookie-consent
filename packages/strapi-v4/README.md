# strapi-plugin-cookie-consent-v4

[![npm version](https://img.shields.io/npm/v/strapi-plugin-cookie-consent-v4.svg)](https://www.npmjs.com/package/strapi-plugin-cookie-consent-v4)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/agenceisomorph/cookie-consent/blob/main/LICENSE)

**GDPR consent proof logging for Strapi v4 — the backend of a free, open-source cookie consent stack (Google Consent Mode V2, CNIL-compliant).**

This is the **Strapi v4** version of [`strapi-plugin-cookie-consent`](https://www.npmjs.com/package/strapi-plugin-cookie-consent). If you are on Strapi 5, use that package instead — this v4 version is maintained for existing v4 projects.

The plugin stores every consent choice made on your frontend in a Strapi collection, giving you the proof-of-consent record GDPR audits ask for. It pairs with the [`@isomorph-agency/cookie-consent`](https://www.npmjs.com/package/@isomorph-agency/cookie-consent) React package (banner, preferences modal, GCM V2 signals), but works with any frontend able to send a POST request.

Built and maintained by [ISOMORPH](https://isomorph.fr) — a web development agency based in Paris and Toulon, France.

## What it does

- Auto-creates a **`cookie-consents` collection** on first start — no manual content-type setup
- Auto-configures permissions: **POST is public** (consent logging), **GET is admin-only**
- Stores **anonymized data only**: session hash, anonymized IP (first 3 octets), no personal data

## Installation

```bash
npm install strapi-plugin-cookie-consent-v4
```

```js
// config/plugins.js
module.exports = {
  'cookie-consent-v4': { enabled: true },
};
```

Restart Strapi. The collection and permissions are created automatically.

## API

### `POST /api/cookie-consents` (public)

Log a consent choice. Called automatically by the React package, or manually from any frontend:

```json
{
  "data": {
    "sessionId": "a1b2c3…",
    "necessary": true,
    "analytics": false,
    "advertising": false,
    "functional": true,
    "gcmVersion": "v2",
    "consentDate": "2026-07-11T10:00:00.000Z",
    "expiryDate": "2027-08-11T10:00:00.000Z",
    "userAgent": "Mozilla/5.0 …",
    "ipAnonymized": "192.168.1.xxx",
    "source": "mysite.com",
    "action": "custom"
  }
}
```

All inputs are validated server-side. Invalid payloads are rejected.

### `GET /api/cookie-consents` (admin only)

Browse the consent log from the Strapi admin or via an authenticated API token — your GDPR proof-of-consent record.

## Collection schema

| Field | Type | Notes |
|-------|------|-------|
| `sessionId` | string | anonymous session hash |
| `necessary` | boolean | always `true` |
| `analytics` | boolean | maps to `analytics_storage` |
| `advertising` | boolean | maps to `ad_storage` + `ad_user_data` + `ad_personalization` |
| `functional` | boolean | maps to `functionality_storage` |
| `gcmVersion` | string | `"v2"` |
| `consentDate` / `expiryDate` | datetime | expiry = consent + 13 months (CNIL) |
| `userAgent` | string | |
| `ipAnonymized` | string | first 3 octets only — never the full IP |
| `source` | string | site domain (multi-site friendly) |
| `action` | enum | `accept_all` / `refuse_all` / `custom` |

## Complete stack

| Package | Description |
|---------|-------------|
| [`@isomorph-agency/cookie-consent`](https://www.npmjs.com/package/@isomorph-agency/cookie-consent) | React banner + preferences modal + GCM V2 + blocked-content facades |
| [`strapi-plugin-cookie-consent`](https://www.npmjs.com/package/strapi-plugin-cookie-consent) | Strapi v5 version |
| **`strapi-plugin-cookie-consent-v4`** | This plugin (Strapi v4) |

Full documentation, contributing guide and issue tracker: [github.com/agenceisomorph/cookie-consent](https://github.com/agenceisomorph/cookie-consent)

## Compliance

- **GDPR**: proof-of-consent logging, anonymized data only, 13-month auto-expiry
- **CNIL** (French DPA): 13-month expiry, anonymized IP, consent granularity per category
- Logging is **fire & forget** on the frontend side — never blocks the user experience

## License

[MIT](https://github.com/agenceisomorph/cookie-consent/blob/main/LICENSE) — free for personal and commercial use.

Built with care by [ISOMORPH](https://isomorph.fr).
