# @isomorph/cookie-consent

[![npm version](https://img.shields.io/npm/v/@isomorph/cookie-consent.svg)](https://www.npmjs.com/package/@isomorph/cookie-consent)
[![Strapi v5](https://img.shields.io/npm/v/strapi-plugin-cookie-consent.svg?label=strapi-v5-plugin)](https://www.npmjs.com/package/strapi-plugin-cookie-consent)
[![Strapi v4](https://img.shields.io/npm/v/strapi-plugin-cookie-consent-v4.svg?label=strapi-v4-plugin)](https://www.npmjs.com/package/strapi-plugin-cookie-consent-v4)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![GDPR](https://img.shields.io/badge/GDPR-compliant-green.svg)](#compliance)
[![GCM V2](https://img.shields.io/badge/Google_Consent_Mode-V2-4285F4.svg)](#google-consent-mode-v2--signals)

**A free, open-source GDPR cookie consent solution for Strapi + Next.js.**

Drop-in cookie banner with Google Consent Mode V2 (Advanced), CNIL compliance, WCAG 2.1 AA accessibility, and consent proof logging in Strapi. No third-party services, no subscription fees. First-party cookies only.

Built and maintained by [ISOMORPH](https://isomorph.fr) — a web development agency based in Paris and Toulon, France.

---

## Why this project?

Most cookie consent tools are either paid SaaS (Axeptio, Cookiebot, OneTrust) or client-side only (no proof logging). This package gives you the full stack for free:

- **React banner + preferences modal** with full keyboard accessibility
- **Strapi plugin** that auto-creates the collection and logs every consent choice
- **Google Consent Mode V2** (Advanced) built-in, with correct signal mapping
- **CNIL-compliant** out of the box (13-month expiry, no pre-checked boxes, equal button visibility)
- **Zero third-party cookies** before explicit consent

---

## Packages

| Package | Description | Install |
|---------|-------------|---------|
| [`@isomorph/cookie-consent`](./packages/react) | React components + TypeScript core | `npm i @isomorph/cookie-consent` |
| [`strapi-plugin-cookie-consent`](./packages/strapi-v5) | Strapi v5 plugin | `npm i strapi-plugin-cookie-consent` |
| [`strapi-plugin-cookie-consent-v4`](./packages/strapi-v4) | Strapi v4 plugin | `npm i strapi-plugin-cookie-consent-v4` |

---

## Quick Start

### 1. Install the Strapi plugin

**Strapi v5:**

```bash
npm install strapi-plugin-cookie-consent
```

```ts
// config/plugins.ts
export default {
  'cookie-consent': { enabled: true },
};
```

**Strapi v4:**

```bash
npm install strapi-plugin-cookie-consent-v4
```

```js
// config/plugins.js
module.exports = {
  'cookie-consent-v4': { enabled: true },
};
```

Restart Strapi. The plugin auto-creates the `cookie-consents` collection and configures public POST permission.

### 2. Install the React package

```bash
npm install @isomorph/cookie-consent
```

### 3. Set up your Next.js layout

The order in `layout.tsx` is critical for GCM V2 compliance:

```tsx
// src/app/layout.tsx
import Script from 'next/script';
import { getInlineConsentScript } from '@isomorph/cookie-consent';
import { CookieConsentWrapper } from '@/components/CookieConsentWrapper';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* 1. GCM V2 default — BEFORE any Google script */}
        <Script
          id="gcm-default"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: getInlineConsentScript() }}
        />
        {/* 2. GTM/GA4 — AFTER consent default */}
        <Script id="gtm" strategy="afterInteractive" src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX" />
      </head>
      <body>
        {/* 3. CookieProvider reads cookie + sends gtag consent update */}
        <CookieConsentWrapper>{children}</CookieConsentWrapper>
      </body>
    </html>
  );
}
```

```tsx
// src/components/CookieConsentWrapper.tsx
'use client';

import { CookieProvider, CookieBanner, CookiePreferences } from '@isomorph/cookie-consent/react';

export function CookieConsentWrapper({ children }: { children: React.ReactNode }) {
  return (
    <CookieProvider config={{
      strapiUrl: process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:1337/api',
      siteDomain: 'mysite.com',
    }}>
      {children}
      <CookieBanner />
      <CookiePreferences />
    </CookieProvider>
  );
}
```

### 4. Add "Manage cookies" to your footer

```tsx
'use client';
import { useConsent } from '@isomorph/cookie-consent/react';

export function Footer() {
  const { openPreferences } = useConsent();
  return (
    <footer>
      <button onClick={() => openPreferences()}>Manage cookies</button>
    </footer>
  );
}
```

That's it. The banner shows on first visit, consent is logged in Strapi, and GCM V2 signals update automatically.

---

## Blocked Content Facades

Components that depend on cookies display an informative facade with a one-click activation button when consent is missing.

```tsx
import { YoutubeEmbed, GoogleMap, BlockedContent } from '@isomorph/cookie-consent/react';

// YouTube — loads youtube-nocookie.com iframe when consented
<YoutubeEmbed videoId="dQw4w9WgXcQ" title="Demo video" />

// Google Maps — wraps your existing map component
<GoogleMap mapComponent={<MyMap />} title="Our location" />

// Generic — any component behind any category
<BlockedContent category="analytics" title="Dashboard">
  <AnalyticsDashboard />
</BlockedContent>
```

---

## `useConsent` Hook

```tsx
const {
  consent,           // ConsentState | null
  showBanner,        // boolean
  acceptAll,         // () => void
  refuseAll,         // () => void
  updateCategory,    // (category, value) => void
  saveCustom,        // (state) => void
  openPreferences,   // (focusCategory?) => void
  closePreferences,  // () => void
  isGranted,         // (category) => boolean
} = useConsent();
```

---

## Google Consent Mode V2 — Signals

| UI Category | GCM V2 Signals | Blocked when denied |
|-------------|---------------|---------------------|
| Necessary | `security_storage: granted` (always) | Never blocked |
| Analytics | `analytics_storage` | GA4, GTM |
| Advertising | `ad_storage` + `ad_user_data` + `ad_personalization` | Google Ads, Meta Pixel |
| Functional | `functionality_storage` | YouTube, Google Maps, Intercom |

Advanced Consent Mode sends cookieless pings to Google before consent (Google Ads compliance).

---

## Visual Customization

Adapt colors to your brand with CSS custom properties:

```css
:root {
  --cc-primary: #2563eb;
  --cc-primary-text: #ffffff;
}
```

---

## Compliance

### CNIL (French Data Protection Authority)

- 13-month cookie expiry
- No pre-checked boxes
- "Refuse all" equally visible as "Accept all"
- IP anonymized (first 3 octets only)

### WCAG 2.1 AA / RGAA 4.1

- `role="dialog"` with `aria-modal`
- Focus trap (Tab / Shift+Tab)
- Keyboard navigation (Escape to close)
- Contrast ratios >= 4.5:1
- Touch targets >= 44x44px

### GDPR

- First-party cookie only (SameSite=Lax, Secure on HTTPS)
- Zero third-party cookies before consent
- Proof-of-consent logging in Strapi (fire & forget, non-blocking)
- 13-month auto-expiration

---

## Strapi Collection

Each consent is logged with: `sessionId`, `necessary`, `analytics`, `advertising`, `functional`, `gcmVersion`, `consentDate`, `expiryDate`, `userAgent`, `ipAnonymized`, `source`, `action` (`accept_all` / `refuse_all` / `custom`).

POST is public. GET is admin-only. Rate-limited at 10 req/IP/min.

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

Areas where we especially need help:

- **i18n / Translations** — locale support for banner and modal text
- **New adapters** — WordPress, Directus, Payload CMS, Supabase...
- **Framework support** — Vue.js, Svelte, Astro components
- **Accessibility audits** — real-world screen reader testing
- **Documentation** — tutorials, video guides, integration examples

---

## Development

```bash
git clone https://github.com/agenceisomorph/cookie-consent.git
cd cookie-consent
npm install

npm test                  # Unit tests (all packages)
npm run test:e2e          # E2E tests (Playwright)
npm run build             # Build all packages
npm run lint              # Lint + typecheck
```

---

## License

[MIT](./LICENSE) — free for personal and commercial use.

Built with care by [ISOMORPH](https://isomorph.fr).
