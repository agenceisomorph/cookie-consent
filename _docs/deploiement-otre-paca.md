# Plan de déploiement test — OTRE PACA

> Instructions pour le premier déploiement de `@isomorph/cookie-consent` sur le projet OTRE PACA.
> Ce document sert de checklist pour FORGE lors de l'intégration.

---

## Contexte

- **Projet** : OTRE PACA (otrepaca.fr)
- **Stack** : Next.js 16, Strapi v5, Vercel
- **Repo frontend** : `github.com/agenceisomorph/otre-front`
- **Backend** : `https://admin.otrepaca.fr/api`
- **Branche de travail** : `fix/cookie-consent-integration` (à créer depuis `develop`)

---

## Étape 1 — Plugin Strapi v5

### Sur le serveur Strapi (EC2)

```bash
# Se connecter à l'instance EC2 (via SSM ou SSH)
cd /chemin/vers/otre-back

# Installer le plugin
npm install @isomorph/strapi-plugin-cookie-consent

# Activer le plugin dans config/plugins.ts
# Ajouter : 'cookie-consent': { enabled: true }

# Redémarrer Strapi
npm run build && npm run start
# ou via Docker : docker compose up -d --build
```

### Vérification Strapi

```bash
# Tester l'endpoint POST public
curl -X POST https://admin.otrepaca.fr/api/cookie-consents \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "sessionId": "test-deploy-001",
      "necessary": true,
      "analytics": false,
      "advertising": false,
      "functional": false,
      "gcmVersion": "v2",
      "consentDate": "2026-03-21T10:00:00.000Z",
      "expiryDate": "2027-04-21T10:00:00.000Z",
      "userAgent": "Test ISOMORPH",
      "ipAnonymized": "0.0.0.xxx",
      "source": "otrepaca.fr",
      "action": "refuse_all"
    }
  }'
```

Résultat attendu : `201 Created`. Vérifier dans l'admin Strapi que l'entrée apparaît dans Content Manager → Cookie Consents.

---

## Étape 2 — Frontend Next.js (otre-front)

### Branche de travail

```bash
cd otre-front
git checkout develop && git pull origin develop
git checkout -b fix/cookie-consent-integration
```

### Installation

```bash
npm install @isomorph/cookie-consent
```

### Fichiers à modifier

#### 1. `src/app/layout.js`

Ajouter le script GCM V2 default en `beforeInteractive` et wrapper l'app avec `CookieConsentWrapper` :

```jsx
import Script from 'next/script';
import { getInlineConsentScript } from '@isomorph/cookie-consent';
import { CookieConsentWrapper } from '@/components/CookieConsentWrapper';

// Dans le JSX, AVANT </head> :
<Script
  id="gcm-default"
  strategy="beforeInteractive"
  dangerouslySetInnerHTML={{ __html: getInlineConsentScript() }}
/>

// Wrapper le body content :
<CookieConsentWrapper>
  {/* contenu existant */}
</CookieConsentWrapper>
```

Note : ne PAS toucher au `robots` dans le layout (règle anti-régression de l'audit 20/03/2026).

#### 2. Nouveau fichier `src/components/CookieConsentWrapper.js`

```jsx
'use client';

import {
  CookieProvider,
  CookieBanner,
  CookiePreferences,
} from '@isomorph/cookie-consent/react';

export function CookieConsentWrapper({ children }) {
  return (
    <CookieProvider
      config={{
        strapiUrl: process.env.NEXT_PUBLIC_PROD_BACKEND_URL || 'http://localhost:1337/api',
        siteDomain: 'otrepaca.fr',
      }}
    >
      {children}
      <CookieBanner />
      <CookiePreferences />
    </CookieProvider>
  );
}
```

#### 3. `src/components/Footer/FooterChild.js`

Ajouter le lien "Gérer mes cookies" dans le footer existant :

```jsx
import { useConsent } from '@isomorph/cookie-consent/react';

// Dans le composant :
const { openPreferences } = useConsent();

// Dans le JSX footer :
<button
  onClick={() => openPreferences()}
  className="text-sm underline text-gray-400 hover:text-white"
>
  Gérer mes cookies
</button>
```

#### 4. Personnalisation CSS (optionnel)

Dans `src/app/globals.css`, ajouter les couleurs OTRE PACA :

```css
:root {
  --cc-primary: #1a5276;        /* Bleu OTRE PACA */
  --cc-primary-text: #ffffff;
}
```

#### 5. Composants bloqués

Modifier les composants Google Maps et vidéo existants pour utiliser les façades :

- `src/components/Contact/ContactMap.js` → wrapper avec `<GoogleMap>`
- `src/components/Home/HeaderHome.js` → si vidéo YouTube, wrapper avec `<YoutubeEmbed>`

---

## Étape 3 — Test sur Vercel Preview

```bash
git add -A
git commit -m "feat: intégration @isomorph/cookie-consent RGPD GCM V2"
git push origin fix/cookie-consent-integration
```

Vercel déploie automatiquement un preview. Vérifier :

### Checklist de test

- [ ] Bandeau visible à la première visite (3 boutons)
- [ ] 0 requête Google Analytics/GTM dans Network avant consentement
- [ ] "Tout accepter" → bandeau disparaît + cookie `isomorph_consent` créé
- [ ] "Tout refuser" → bandeau disparaît + 0 requête Google
- [ ] "Personnaliser" → modale avec 4 catégories (Nécessaires verrouillé)
- [ ] Toggle analytique → enregistrer → cookie mis à jour
- [ ] Refresh page → bandeau absent (cookie valide)
- [ ] Lien footer "Gérer mes cookies" → ouvre la modale
- [ ] Navigation clavier : Tab entre boutons, Escape ferme
- [ ] Google Maps : façade visible si cookies fonctionnels refusés
- [ ] POST Strapi visible dans Network (fire & forget, pas de blocage UX)
- [ ] Console : 0 erreur JS liée au cookie-consent
- [ ] Google Tag Assistant : signaux GCM V2 corrects

### Test mobile

Vérifier sur l'aperçu mobile Chrome DevTools (iPhone SE, Galaxy S21) :
- [ ] Bandeau responsive (pleine largeur, pas de scroll horizontal)
- [ ] Boutons touch targets ≥ 44x44px
- [ ] Modale scrollable si contenu dépasse la hauteur

---

## Étape 4 — Merge et production

Après validation Florent :

```bash
# Merger dans develop (déjà fait par le push de la branche)
# Tester sur le preview develop

# Merger dans main (une seule fois, en fin de session)
git checkout main && git pull origin main
git merge develop
git push origin main
```

---

## Rollback

Si un problème est détecté en production :

1. Supprimer le `CookieConsentWrapper` du layout (revenir au commit précédent)
2. Push sur main → Vercel redéploie automatiquement
3. Le plugin Strapi peut rester actif (il ne provoque aucun effet secondaire côté frontend)

---

## Points d'attention OTRE PACA

Rappels des audits précédents :

- **Ne pas toucher** au `robots` dans `layout.js` (audit 20/03/2026 — doublon robots)
- **Ne pas réactiver** Vercel Authentication (injecte `noindex`)
- **reCAPTCHA** : `security_storage` est toujours `granted` — reCAPTCHA n'est jamais bloqué par le bandeau cookies
- **Sentry** : L'intégration Sentry existante n'est pas impactée par le cookie consent (SDK Sentry n'utilise pas de cookies marketing)
- **ISR** : Le `CookieProvider` est un Client Component — il ne bloque pas l'ISR du layout
