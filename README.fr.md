# @isomorph-agency/cookie-consent

Bandeau cookies RGPD natif — Google Consent Mode V2, conforme CNIL, accessible RGAA 4.1.

Remplace Axeptio sur tous les projets ISOMORPH. Plugin cookie first-party, zéro dépendance tierce, conforme Google Consent Mode V2 (Advanced).

---

## Architecture

Monorepo npm workspaces avec 3 packages :

| Package | Description | Registre |
|---------|-------------|----------|
| `@isomorph-agency/cookie-consent` | Core TypeScript + composants React | npm public |
| `strapi-plugin-cookie-consent` | Plugin Strapi v5 (Document Service API) | npm public |
| `strapi-plugin-cookie-consent-v4` | Plugin Strapi v4 (Entity Service API) | npm public |

Un dossier `shared/` contient le schéma de collection, la validation et les constantes partagées entre les plugins Strapi et le package React.

---

## Installation

### 1. Package React (projet Next.js)

```bash
npm install @isomorph-agency/cookie-consent
```

### 2. Plugin Strapi v5

```bash
npm install strapi-plugin-cookie-consent
```

Ajouter dans `config/plugins.ts` :

```ts
export default {
  'cookie-consent': {
    enabled: true,
  },
};
```

Relancer Strapi — le plugin crée automatiquement la collection `cookie-consents` et configure la permission `POST` publique au bootstrap.

### 3. Plugin Strapi v4 (projets legacy)

```bash
npm install strapi-plugin-cookie-consent-v4
```

Ajouter dans `config/plugins.js` :

```js
module.exports = {
  'cookie-consent-v4': {
    enabled: true,
  },
};
```

---

## Intégration Next.js (App Router)

L'intégration se fait en 3 étapes dans `layout.tsx`. L'ordre est critique pour la conformité GCM V2.

### Étape 1 — Script inline `beforeInteractive`

Ce script DOIT se charger avant GTM/GA4. Il initialise tous les signaux GCM V2 à `denied`.

```tsx
// src/app/layout.tsx
import Script from 'next/script';
import { getInlineConsentScript } from '@isomorph-agency/cookie-consent';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        {/* 1. GCM V2 default — AVANT tout script Google */}
        <Script
          id="gcm-default"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: getInlineConsentScript() }}
        />

        {/* 2. GTM/GA4 — APRÈS le consent default */}
        <Script
          id="gtm"
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
        />
      </head>
      <body>
        {/* 3. CookieProvider — lit le cookie et fait gtag consent update */}
        <CookieConsentWrapper>
          {children}
        </CookieConsentWrapper>
      </body>
    </html>
  );
}
```

### Étape 2 — CookieProvider (Client Component)

Le provider doit être dans un composant `"use client"` séparé :

```tsx
// src/components/CookieConsentWrapper.tsx
'use client';

import {
  CookieProvider,
  CookieBanner,
  CookiePreferences,
} from '@isomorph-agency/cookie-consent/react';

export function CookieConsentWrapper({ children }: { children: React.ReactNode }) {
  return (
    <CookieProvider
      config={{
        strapiUrl: process.env.NEXT_PUBLIC_PROD_BACKEND_URL ?? 'http://localhost:1337/api',
        siteDomain: 'monsite.fr',
        // expiryMonths: 13 (par défaut, conforme CNIL)
        // onConsentChange: (state) => console.log('Consent:', state)
      }}
    >
      {children}
      <CookieBanner />
      <CookiePreferences />
    </CookieProvider>
  );
}
```

### Étape 3 — Lien "Gérer mes cookies" dans le footer

```tsx
// src/components/Footer.tsx
'use client';

import { useConsent } from '@isomorph-agency/cookie-consent/react';

export function Footer() {
  const { openPreferences } = useConsent();

  return (
    <footer>
      {/* ... autres éléments footer ... */}
      <button onClick={() => openPreferences()}>
        Gérer mes cookies
      </button>
    </footer>
  );
}
```

---

## Façades de contenu bloqué

Chaque composant dynamique qui dépend d'une catégorie de cookies affiche une façade informative si le consentement n'a pas été donné.

### YouTube

```tsx
import { YoutubeEmbed } from '@isomorph-agency/cookie-consent/react';

<YoutubeEmbed
  videoId="dQw4w9WgXcQ"
  title="Ma vidéo YouTube"
/>
```

Si les cookies fonctionnels ne sont pas acceptés, le composant affiche un message d'information avec un bouton qui ouvre directement les préférences sur la catégorie "Fonctionnel". Une fois accepté, l'iframe `youtube-nocookie.com` se charge sans rechargement de page.

### Google Maps

```tsx
import { GoogleMap } from '@isomorph-agency/cookie-consent/react';

<GoogleMap
  mapComponent={<MaCarteGoogleMaps />}
  title="Carte de localisation"
/>
```

### Contenu bloqué générique

```tsx
import { BlockedContent } from '@isomorph-agency/cookie-consent/react';

<BlockedContent
  category="analytics"
  title="Widget Matomo"
>
  <MonWidgetMatomo />
</BlockedContent>
```

---

## Hook `useConsent`

Le hook expose l'API complète du consentement :

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
  focusCategory,     // ConsentCategory | null
} = useConsent();
```

Exemple — charger un script conditionnel :

```tsx
const { isGranted } = useConsent();

useEffect(() => {
  if (isGranted('analytics')) {
    // Charger un script analytics custom
  }
}, [isGranted]);
```

---

## Google Consent Mode V2 — Signaux

| Catégorie UI | Signaux GCM V2 | Scripts bloqués si refusé |
|-------------|---------------|--------------------------|
| Nécessaires | `security_storage: granted` (toujours) | Jamais bloqués |
| Analytique | `analytics_storage` | GA4, GTM |
| Publicité | `ad_storage` + `ad_user_data` + `ad_personalization` | Google Ads, Meta Pixel |
| Fonctionnel | `functionality_storage` | YouTube, Google Maps, Intercom, Crisp |

Le mode Advanced Consent Mode envoie des pings cookieless à Google avant même le consentement (conformité Google Ads).

---

## Personnalisation visuelle

Les couleurs s'adaptent à la charte graphique du site via des CSS custom properties :

```css
:root {
  --cc-primary: #2563eb;       /* Couleur des boutons principaux */
  --cc-primary-text: #ffffff;   /* Couleur du texte sur les boutons */
}
```

---

## Conformité

### CNIL
- Durée du cookie : 13 mois maximum
- Pas de case pré-cochée (état initial `false` sur toutes les catégories non nécessaires)
- Bouton "Refuser tout" aussi visible que "Accepter tout"
- IP anonymisée (3 premiers octets uniquement)

### RGAA 4.1
- Bandeau et modale en `role="dialog"` avec `aria-modal`
- Focus trap complet (Tab, Shift+Tab)
- Navigation clavier (Escape pour fermer)
- Contrastes conformes (minimum 4.5:1)
- Touch targets minimum 44x44px

### RGPD
- Cookie first-party uniquement (SameSite=Lax, Secure sur HTTPS)
- Aucun cookie tiers avant consentement explicite
- Log de preuve dans Strapi (fire & forget, non bloquant)
- Expiration automatique à 13 mois

---

## Collection Strapi `cookie-consents`

Chaque consentement est loggé dans Strapi avec les champs suivants :

| Champ | Type | Description |
|-------|------|-------------|
| `sessionId` | string | Hash anonyme de session |
| `necessary` | boolean | Toujours `true` |
| `analytics` | boolean | `analytics_storage` |
| `advertising` | boolean | `ad_storage` + signaux pub |
| `functional` | boolean | `functionality_storage` |
| `gcmVersion` | string | `"v2"` |
| `consentDate` | datetime | Date du consentement |
| `expiryDate` | datetime | `consentDate + 13 mois` |
| `userAgent` | string | Navigateur |
| `ipAnonymized` | string | 3 premiers octets (`192.168.1.xxx`) |
| `source` | string | Domaine du site |
| `action` | enum | `accept_all`, `refuse_all`, `custom` |

L'endpoint `POST /api/cookie-consents` est ouvert en public. Le `GET` est restreint à l'admin Strapi.

---

## Scripts

```bash
# Développement (watch mode)
npm run dev --workspace=packages/react

# Build (ESM + CJS + types)
npm run build --workspace=packages/react

# Tests unitaires + coverage
npm run test --workspace=packages/react

# Tests E2E Playwright
npm run test:e2e --workspace=packages/react

# Lint + typecheck
npm run lint --workspace=packages/react
```

---

## Développement local

### Prérequis

- Node.js >= 18
- npm >= 9 (npm workspaces)
- Instance Strapi v5 locale (ou v4 pour le plugin legacy)

### Installation des dépendances

```bash
npm install
```

### Lancer les tests

```bash
# Tous les tests unitaires
npm test

# Tests E2E (lance la fixture locale sur le port 3099)
npm run test:e2e
```

---

## Licence

UNLICENSED — Usage interne ISOMORPH uniquement.
