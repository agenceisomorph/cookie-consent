# @isomorph-agency/cookie-consent

[![npm version](https://img.shields.io/npm/v/@isomorph-agency/cookie-consent.svg)](https://www.npmjs.com/package/@isomorph-agency/cookie-consent)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/agenceisomorph/cookie-consent/blob/main/LICENSE)

**A free, open-source GDPR cookie consent banner for React / Next.js — Google Consent Mode V2 (Advanced), CNIL-compliant, WCAG 2.1 AA.**

React components + TypeScript core. Pairs with the [Strapi v5 plugin](https://www.npmjs.com/package/strapi-plugin-cookie-consent) (or [v4](https://www.npmjs.com/package/strapi-plugin-cookie-consent-v4)) for proof-of-consent logging. No third-party services, no subscription fees, first-party cookies only.

Built and maintained by [ISOMORPH](https://isomorph.fr) — a web development agency based in Paris and Toulon, France.

## Why this package?

Most cookie consent tools are either paid SaaS (Axeptio, Cookiebot, OneTrust) or client-side only (no proof logging). This package gives you the full stack for free:

- **React banner + preferences modal** with full keyboard accessibility
- **Google Consent Mode V2** (Advanced) built-in, with correct signal mapping
- **CNIL-compliant** out of the box (13-month expiry, no pre-checked boxes, equal button visibility)
- **Zero third-party cookies** before explicit consent
- **Consent proof logging** in Strapi via the companion plugin (fire & forget, non-blocking)

## Installation

```bash
npm install @isomorph-agency/cookie-consent
```

## Quick Start (Next.js App Router)

The order in `layout.tsx` is critical for GCM V2 compliance:

```tsx
// src/app/layout.tsx
import Script from 'next/script';
// note the /server entry — safe to import from a Server Component
import { getInlineConsentScript } from '@isomorph-agency/cookie-consent/server';
import { CookieConsentWrapper } from '@/components/CookieConsentWrapper';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* 1. GCM V2 default — BEFORE any Google script.
            getInlineConsentScript() returns a static script generated
            by this package (trusted, no user input). */}
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

import { CookieProvider, CookieBanner, CookiePreferences } from '@isomorph-agency/cookie-consent/react';

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

Add "Manage cookies" to your footer:

```tsx
'use client';
import { useConsent } from '@isomorph-agency/cookie-consent/react';

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

## Banner customization

```tsx
<CookieBanner
  icon="🍪"                     // emoji shown next to the title
  title="Cookie preferences"    // banner title
  message="We use cookies…"     // banner body text
  acceptLabel="Accept all"
  refuseLabel="Refuse all"
  customizeLabel="Customize"
/>
```

Colors adapt to your brand with CSS custom properties:

```css
:root {
  --cc-primary: #2563eb;
  --cc-primary-text: #ffffff;
}
```

## Blocked Content Facades

Components that depend on cookies display an informative facade with a one-click activation button when consent is missing.

```tsx
import { YoutubeEmbed, GoogleMap, BlockedContent } from '@isomorph-agency/cookie-consent/react';

// YouTube — loads youtube-nocookie.com iframe when consented
<YoutubeEmbed videoId="dQw4w9WgXcQ" title="Demo video" />

// Google Maps — wraps your existing map component
<GoogleMap mapComponent={<MyMap />} title="Our location" />

// Generic — any component behind any category
<BlockedContent category="analytics" title="Dashboard">
  <AnalyticsDashboard />
</BlockedContent>
```

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

## Google Consent Mode V2 — Signals

| UI Category | GCM V2 Signals | Blocked when denied |
|-------------|---------------|---------------------|
| Necessary | `security_storage: granted` (always) | Never blocked |
| Analytics | `analytics_storage` | GA4, GTM |
| Advertising | `ad_storage` + `ad_user_data` + `ad_personalization` | Google Ads, Meta Pixel |
| Functional | `functionality_storage` | YouTube, Google Maps, Intercom |

Advanced Consent Mode sends cookieless pings to Google before consent (Google Ads compliance).

## Compliance

- **CNIL**: 13-month cookie expiry, no pre-checked boxes, "Refuse all" equally visible, anonymized IP (first 3 octets only)
- **WCAG 2.1 AA / RGAA 4.1**: `role="dialog"` + `aria-modal`, focus trap, full keyboard navigation, contrast >= 4.5:1, touch targets >= 44x44px
- **GDPR**: first-party cookie only (SameSite=Lax, Secure on HTTPS), zero third-party cookies before consent, proof-of-consent logging

## Related packages

| Package | Description |
|---------|-------------|
| [`strapi-plugin-cookie-consent`](https://www.npmjs.com/package/strapi-plugin-cookie-consent) | Strapi v5 plugin — consent logging collection + public POST endpoint |
| [`strapi-plugin-cookie-consent-v4`](https://www.npmjs.com/package/strapi-plugin-cookie-consent-v4) | Strapi v4 plugin |
| [`@isomorph-agency/cookie-consent-shared`](https://www.npmjs.com/package/@isomorph-agency/cookie-consent-shared) | Shared schema, validation and constants |

Full documentation, contributing guide and issue tracker: [github.com/agenceisomorph/cookie-consent](https://github.com/agenceisomorph/cookie-consent)

## License

[MIT](https://github.com/agenceisomorph/cookie-consent/blob/main/LICENSE) — free for personal and commercial use.

Built with care by [ISOMORPH](https://isomorph.fr).
