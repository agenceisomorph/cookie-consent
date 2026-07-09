# Guide d'intégration — Plugin Strapi cookie-consent

> Guide d'installation du plugin Strapi ISOMORPH pour le logging des consentements cookies.
> Deux versions : Strapi v5 (projets récents) et Strapi v4 (projets legacy).

---

## Strapi v5 — `strapi-plugin-cookie-consent`

### Installation

```bash
npm install strapi-plugin-cookie-consent
```

### Activation

Ajouter dans `config/plugins.ts` (ou `config/plugins.js`) :

```ts
export default {
  'cookie-consent': {
    enabled: true,
  },
};
```

### Démarrage

```bash
npm run develop
```

Au premier démarrage, le plugin :
1. Enregistre la collection `cookie-consents` avec 12 attributs (sessionId, necessary, analytics, advertising, functional, gcmVersion, consentDate, expiryDate, userAgent, ipAnonymized, source, action)
2. Configure automatiquement la permission `POST /api/cookie-consents` en accès public (bootstrap)
3. Log dans la console Strapi la confirmation de la configuration

### Vérification

```bash
# Tester l'endpoint POST public
curl -X POST http://localhost:1337/api/cookie-consents \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "sessionId": "test-123",
      "necessary": true,
      "analytics": true,
      "advertising": false,
      "functional": false,
      "gcmVersion": "v2",
      "consentDate": "2026-03-21T10:00:00.000Z",
      "expiryDate": "2027-04-21T10:00:00.000Z",
      "userAgent": "Mozilla/5.0 Test",
      "ipAnonymized": "192.168.1.xxx",
      "source": "monsite.fr",
      "action": "custom"
    }
  }'
```

Réponse attendue : `201 Created` avec l'objet créé.

```bash
# Vérifier que le GET est protégé (doit retourner 403)
curl http://localhost:1337/api/cookie-consents
```

### API Strapi v5

Le plugin utilise le Document Service API de Strapi v5 :

| Méthode | Endpoint | Accès | Description |
|---------|----------|-------|-------------|
| `POST` | `/api/cookie-consents` | Public | Créer un consentement |
| `GET` | `/api/cookie-consents` | Admin | Lister les consentements |
| `GET` | `/api/cookie-consents/:id` | Admin | Voir un consentement |
| `GET` | `/api/cookie-consents/count?source=monsite.fr` | Admin | Compter par domaine |

### Services disponibles

Le plugin expose 2 services côté serveur :

```js
// Compter les consentements d'un domaine
const count = await strapi
  .plugin('cookie-consent')
  .service('cookie-consent')
  .countBySource('otrepaca.fr');

// Purger les consentements expirés
const deleted = await strapi
  .plugin('cookie-consent')
  .service('cookie-consent')
  .purgeExpired();
```

### Rate limiting

Le plugin inclut un rate limiter en mémoire sur l'endpoint POST (10 requêtes par IP par minute). Configurable via le controller si nécessaire.

---

## Strapi v4 — `strapi-plugin-cookie-consent-v4`

### Installation

```bash
npm install strapi-plugin-cookie-consent-v4
```

### Activation

Ajouter dans `config/plugins.js` :

```js
module.exports = {
  'cookie-consent-v4': {
    enabled: true,
  },
};
```

### Différences avec la v5

| Aspect | Strapi v5 | Strapi v4 |
|--------|-----------|-----------|
| API interne | Document Service (`strapi.documents()`) | Entity Service (`strapi.entityService`) |
| Schéma | Identique (via shared/schema.json) | Identique |
| Bootstrap | Identique (auto-config permission POST) | Identique |
| Rate limiting | Inclus | Inclus |
| Package name | `strapi-plugin-cookie-consent` | `strapi-plugin-cookie-consent-v4` |
| Peer dependency | `@strapi/strapi ^5.0.0` | `@strapi/strapi ^4.0.0` |

### Vérification v4

Même procédure que pour la v5. L'endpoint et le format de requête sont identiques.

---

## Collection `cookie-consents` — Schéma

Le schéma est partagé entre les deux versions via `shared/schema.json` :

| Attribut | Type | Description |
|----------|------|-------------|
| `sessionId` | `string` | Hash anonyme de session (généré côté client) |
| `necessary` | `boolean` | Toujours `true` |
| `analytics` | `boolean` | Consent analytics (`analytics_storage`) |
| `advertising` | `boolean` | Consent publicité (`ad_storage` + `ad_user_data` + `ad_personalization`) |
| `functional` | `boolean` | Consent fonctionnel (`functionality_storage`) |
| `gcmVersion` | `string` | Version GCM (`"v2"`) |
| `consentDate` | `datetime` | Date du consentement |
| `expiryDate` | `datetime` | Date d'expiration (consentDate + 13 mois) |
| `userAgent` | `string` | User-Agent du navigateur |
| `ipAnonymized` | `string` | IP tronquée (3 octets, ex: `192.168.1.xxx`) |
| `source` | `string` | Domaine du site source |
| `action` | `enumeration` | `accept_all`, `refuse_all`, `custom` |

### Validation serveur

Le controller valide chaque requête côté serveur :
- Tous les champs boolean doivent être présents
- `necessary` doit être `true`
- `action` doit être une des 3 valeurs valides
- `gcmVersion` doit être `"v2"`
- L'IP est anonymisée côté serveur (3 premiers octets uniquement)

---

## Sécurité

### Permissions par défaut

Le bootstrap du plugin configure automatiquement :
- `POST /api/cookie-consents` → rôle **Public** (requis pour que le frontend puisse logger les consentements sans authentification)
- `GET /api/cookie-consents` → rôle **Admin** uniquement (défaut Strapi, les consentements ne sont pas accessibles publiquement)

### Données personnelles

- L'IP est tronquée à 3 octets (`192.168.1.xxx`) avant enregistrement — conforme RGPD
- Le `sessionId` est un hash aléatoire sans lien avec l'utilisateur
- Le `userAgent` est stocké tel quel (pas de donnée personnelle au sens RGPD)

### Rate limiting

10 requêtes POST par IP par minute (protection contre les abus). En cas de dépassement, le serveur retourne `429 Too Many Requests`.

---

## Maintenance

### Purge des consentements expirés

Les consentements expirent après 13 mois. Pour nettoyer les anciens enregistrements, appeler le service `purgeExpired()` via un cron ou manuellement :

```js
// Dans un cron Strapi (config/cron-tasks.js)
module.exports = {
  '0 3 * * 0': async ({ strapi }) => {
    // Tous les dimanches à 3h du matin
    const deleted = await strapi
      .plugin('cookie-consent')
      .service('cookie-consent')
      .purgeExpired();
    strapi.log.info(`[cookie-consent] ${deleted} consentements expirés supprimés.`);
  },
};
```

### Statistiques par domaine

```js
const count = await strapi
  .plugin('cookie-consent')
  .service('cookie-consent')
  .countBySource('otrepaca.fr');

console.log(`${count} consentements enregistrés pour otrepaca.fr`);
```
