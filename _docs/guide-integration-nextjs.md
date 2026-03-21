# Guide d'intégration — @isomorph/cookie-consent + Next.js App Router

> Guide pas à pas pour intégrer le bandeau cookies ISOMORPH dans un projet Next.js App Router.
> Destiné aux développeurs ISOMORPH (agent FORGE).

---

## Prérequis

- Next.js 14+ (App Router)
- React 18+
- Instance Strapi avec le plugin `@isomorph/strapi-plugin-cookie-consent` (v5) ou `@isomorph/strapi-plugin-cookie-consent-v4` (v4)
- Google Tag Manager ou GA4 configuré

---

## 1. Installation

```bash
npm install @isomorph/cookie-consent
```

Le package expose 2 points d'entrée :
- `@isomorph/cookie-consent` : core (types, consent, storage, gcm, adapters)
- `@isomorph/cookie-consent/react` : composants React (CookieProvider, CookieBanner, CookiePreferences, useConsent, facades)

---

## 2. Variables d'environnement

Ajouter dans `.env.local` et dans Vercel :

```env
NEXT_PUBLIC_PROD_BACKEND_URL=https://admin.monsite.fr/api
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

Ne jamais exposer l'URL Strapi sans le préfixe `NEXT_PUBLIC_` — Next.js ne l'injectera pas côté client.

---

## 3. Configuration du layout.tsx

L'ordre des scripts dans le `<head>` est critique pour la conformité GCM V2. Le principe :

1. `gtag consent default` (tous les signaux à `denied`) — AVANT tout script Google
2. GTM/GA4 — se charge et respecte les signaux par défaut
3. `CookieProvider` — lit le cookie first-party et envoie `gtag consent update`

### Fichier layout.tsx complet

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next';
import Script from 'next/script';
import { getInlineConsentScript } from '@isomorph/cookie-consent';
import { CookieConsentWrapper } from '@/components/CookieConsentWrapper';

export const metadata: Metadata = {
  title: 'Mon Site',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <html lang="fr">
      <head>
        {/* ── 1. GCM V2 consent default — OBLIGATOIREMENT en premier ── */}
        <Script
          id="gcm-default"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: getInlineConsentScript() }}
        />

        {/* ── 2. Google Tag Manager — APRÈS le consent default ── */}
        {gtmId && (
          <Script
            id="gtm"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`,
            }}
          />
        )}
      </head>
      <body>
        {/* ── 3. CookieProvider — lit le cookie et fait consent update ── */}
        <CookieConsentWrapper>
          <Header />
          <main>{children}</main>
          <Footer />
        </CookieConsentWrapper>
      </body>
    </html>
  );
}
```

### Pourquoi `beforeInteractive` ?

Le script inline GCM V2 DOIT se charger avant GTM. Si GTM se charge avant que `gtag('consent', 'default', ...)` soit exécuté, les pings Google partiront sans les signaux de consentement. C'est une violation du Consent Mode V2 et Google peut désactiver les features avancées du compte Ads.

---

## 4. CookieConsentWrapper (Client Component)

```tsx
// src/components/CookieConsentWrapper.tsx
'use client';

import {
  CookieProvider,
  CookieBanner,
  CookiePreferences,
} from '@isomorph/cookie-consent/react';

interface Props {
  children: React.ReactNode;
}

export function CookieConsentWrapper({ children }: Props) {
  return (
    <CookieProvider
      config={{
        strapiUrl: process.env.NEXT_PUBLIC_PROD_BACKEND_URL ?? 'http://localhost:1337/api',
        siteDomain: window?.location?.hostname ?? 'localhost',
        // expiryMonths: 13 (défaut CNIL, ne pas changer sauf raison légale)
        // onConsentChange: (state) => { /* callback custom */ }
      }}
    >
      {children}

      {/* Le bandeau se masque automatiquement si un cookie valide existe */}
      <CookieBanner />

      {/* La modale s'ouvre via openPreferences() ou depuis les façades */}
      <CookiePreferences />
    </CookieProvider>
  );
}
```

Note sur `siteDomain` : utiliser `window.location.hostname` pour que le champ `source` dans Strapi reflète le domaine réel. En SSR, `window` n'existe pas — le fallback `'localhost'` est utilisé côté serveur (mais le composant est `"use client"`, donc ce cas ne se produit pas en pratique).

---

## 5. Lien "Gérer mes cookies" dans le footer

Obligation CNIL : l'utilisateur doit pouvoir modifier ses préférences à tout moment. Le standard français est un lien texte dans le footer (pas d'icône flottante).

```tsx
// src/components/Footer.tsx
'use client';

import { useConsent } from '@isomorph/cookie-consent/react';

export function Footer() {
  const { openPreferences } = useConsent();

  return (
    <footer>
      {/* ... autres éléments ... */}
      <nav aria-label="Liens légaux">
        <a href="/mentions-legales">Mentions légales</a>
        <a href="/politique-confidentialite">Politique de confidentialité</a>
        <button
          onClick={() => openPreferences()}
          className="text-sm underline"
        >
          Gérer mes cookies
        </button>
      </nav>
    </footer>
  );
}
```

---

## 6. Façades de contenu bloqué

Chaque composant dynamique qui dépend d'une catégorie de cookies DOIT afficher un message informatif + bouton d'action si le consentement n'est pas donné.

### YouTube

```tsx
import { YoutubeEmbed } from '@isomorph/cookie-consent/react';

// Remplace directement une iframe YouTube
<YoutubeEmbed
  videoId="dQw4w9WgXcQ"
  title="Présentation du projet"
/>
```

### Google Maps

```tsx
import { GoogleMap } from '@isomorph/cookie-consent/react';

// Wrapping du composant Maps existant
<GoogleMap
  mapComponent={<ContactMap position={position} />}
  title="Carte de localisation"
/>
```

### Contenu bloqué générique

Pour tout autre composant (Intercom, Crisp, widget custom...) :

```tsx
import { BlockedContent } from '@isomorph/cookie-consent/react';

<BlockedContent category="functional" title="Chat en ligne">
  <IntercomWidget />
</BlockedContent>
```

Le bouton dans la façade ouvre automatiquement la modale de préférences sur la catégorie concernée. Une fois accepté, le contenu se charge sans rechargement de page.

---

## 7. Personnalisation visuelle

Les couleurs du bandeau et de la modale s'adaptent via CSS custom properties :

```css
/* src/app/globals.css ou équivalent */
:root {
  --cc-primary: #1d4ed8;       /* Bleu ISOMORPH par défaut */
  --cc-primary-text: #ffffff;   /* Texte sur boutons primaires */
}
```

Les composants utilisent Tailwind CSS en interne. Si le projet utilise Tailwind, les styles sont compatibles. Sinon, les composants embarquent leurs propres styles via les custom properties.

---

## 8. Vérification post-intégration

### Checklist manuelle

1. Ouvrir le site en navigation privée
2. Vérifier que le bandeau s'affiche (3 boutons : Refuser, Personnaliser, Accepter)
3. Ouvrir les DevTools → Network → vérifier 0 requête Google Analytics avant consentement
4. Cliquer "Tout accepter" → le bandeau disparaît → requêtes GA4 présentes dans Network
5. Rafraîchir la page → le bandeau ne réapparaît pas (cookie valide)
6. Supprimer le cookie `isomorph_consent` dans DevTools → le bandeau réapparaît
7. Cliquer "Personnaliser" → vérifier la modale (4 catégories, "Nécessaires" verrouillé)
8. Navigation clavier : Tab entre les boutons, Escape ferme le bandeau/modale
9. Vérifier dans Google Tag Assistant que les signaux GCM V2 sont corrects

### Google Tag Assistant

1. Installer l'extension Chrome "Tag Assistant Legacy" ou "Tag Assistant Companion"
2. Naviguer sur le site
3. Vérifier dans la timeline :
   - `consent default` avec tous les signaux `denied` (sauf `security_storage: granted`)
   - Après acceptation : `consent update` avec les signaux mis à jour
4. Si les signaux ne s'affichent pas → vérifier l'ordre des scripts dans `layout.tsx`

---

## 9. Erreurs courantes

### Le bandeau flash au chargement

Le `CookieProvider` rend `null` tant que l'initialisation n'est pas terminée (lecture du cookie). Si un flash persiste, vérifier que le provider est bien un Client Component (`"use client"`) et qu'il n'est pas wrappé dans un Suspense sans fallback.

### GTM se charge avant le consent default

L'ordre dans `layout.tsx` est mauvais. Le script `getInlineConsentScript()` DOIT être en `strategy="beforeInteractive"` et GTM en `strategy="afterInteractive"`.

### Le cookie n'est pas écrit

Vérifier que le domaine est en HTTPS (le flag `Secure` n'est posé qu'en HTTPS). En développement local sur `http://localhost`, le cookie est écrit sans le flag `Secure`.

### Les requêtes Strapi échouent

L'adapter Strapi fonctionne en fire & forget — les erreurs réseau ne bloquent jamais l'UX. Vérifier que l'URL Strapi est correcte et que le plugin est activé côté Strapi (la permission `POST` publique est configurée automatiquement au bootstrap).

---

## 10. Maintenance

### Expiration du cookie

Le cookie expire automatiquement après 13 mois (obligation CNIL). L'utilisateur reverra le bandeau et pourra redonner son consentement.

### Mise à jour du package

```bash
npm update @isomorph/cookie-consent
```

Les mises à jour respectent le semver. Les breaking changes sont documentées dans le CHANGELOG.
