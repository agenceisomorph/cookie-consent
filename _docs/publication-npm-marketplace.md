# Procédure de publication — npm + Strapi Marketplace

> Instructions pas à pas pour publier les 3 packages sur npm public
> et soumettre les plugins Strapi au marketplace.

---

## Prérequis

1. **Compte npm** avec l'organisation `@isomorph` créée sur npmjs.com
2. **Repo GitHub public** : `github.com/agenceisomorph/cookie-consent`
3. **npm login** exécuté sur le poste de publication

```bash
npm login
# Vérifier : npm whoami → doit afficher le compte ISOMORPH
```

---

## Étape 1 — Créer le repo GitHub public

```bash
cd cookie-consent

# Initialiser git si pas déjà fait
git init
git add -A
git commit -m "feat: initial release v1.0.0 — GDPR cookie consent (React + Strapi v4/v5)"

# Créer le repo sur GitHub (via gh CLI)
gh repo create agenceisomorph/cookie-consent \
  --public \
  --description "GDPR cookie consent — React + Strapi v4/v5 — Google Consent Mode V2" \
  --source . \
  --push
```

---

## Étape 2 — Créer l'organisation npm @isomorph

Si l'organisation npm `@isomorph` n'existe pas :

1. Aller sur https://www.npmjs.com/org/create
2. Nom : `isomorph`
3. Type : **Public** (gratuit, packages publics illimités)

---

## Étape 3 — Publier le package shared

Le shared doit être publié en premier (c'est une dépendance des 3 autres) :

```bash
cd shared

# Vérifier le package.json — doit avoir :
# "name": "@isomorph/cookie-consent-shared"
# "publishConfig": { "access": "public" }

npm publish --access public
cd ..
```

---

## Étape 4 — Build et publier le package React

```bash
cd packages/react

# Build le package
npm run build

# Vérifier le contenu qui sera publié
npm pack --dry-run

# Publier
npm publish --access public
cd ../..
```

Package publié : `@isomorph/cookie-consent@1.0.0`

---

## Étape 5 — Publier le plugin Strapi v5

```bash
cd packages/strapi-v5

# Vérifier le contenu
npm pack --dry-run

# Publier (pas de scope → pas besoin de --access public, mais on le met par sécurité)
npm publish --access public
cd ../..
```

Package publié : `strapi-plugin-cookie-consent@1.0.0`

---

## Étape 6 — Publier le plugin Strapi v4

```bash
cd packages/strapi-v4
npm pack --dry-run
npm publish --access public
cd ../..
```

Package publié : `strapi-plugin-cookie-consent-v4@1.0.0`

---

## Étape 7 — Soumettre au Strapi Marketplace

### Plugin v5 : `strapi-plugin-cookie-consent`

1. Aller sur **https://market.strapi.io/submit-plugin**
2. Remplir le formulaire :
   - **npm package name** : `strapi-plugin-cookie-consent`
   - **GitHub repo** : `https://github.com/agenceisomorph/cookie-consent`
3. Soumettre — Strapi review en 1-2 jours ouvrés

### Plugin v4 : `strapi-plugin-cookie-consent-v4`

1. Même processus sur **https://market.strapi.io/submit-plugin**
2. **npm package name** : `strapi-plugin-cookie-consent-v4`

---

## Étape 8 — Vérification post-publication

```bash
# Vérifier que les packages sont accessibles
npm info @isomorph/cookie-consent
npm info strapi-plugin-cookie-consent
npm info strapi-plugin-cookie-consent-v4

# Tester l'installation dans un projet vierge
mkdir /tmp/test-install && cd /tmp/test-install
npm init -y
npm install @isomorph/cookie-consent
npm install strapi-plugin-cookie-consent
```

---

## Mises à jour futures

```bash
# Bumper la version (respecter semver)
npm version patch   # 1.0.0 → 1.0.1 (bug fix)
npm version minor   # 1.0.0 → 1.1.0 (new feature)
npm version major   # 1.0.0 → 2.0.0 (breaking change)

# Publier depuis chaque package
cd packages/react && npm publish --access public && cd ../..
cd packages/strapi-v5 && npm publish --access public && cd ../..
cd packages/strapi-v4 && npm publish --access public && cd ../..
```

Le marketplace Strapi se met à jour automatiquement quand une nouvelle version est publiée sur npm.

---

## Checklist de release

- [ ] Tous les tests passent (`npm test && npm run lint`)
- [ ] CHANGELOG.md mis à jour
- [ ] Version bumped dans les 4 package.json (shared + react + strapi-v5 + strapi-v4)
- [ ] Code poussé sur GitHub (`main`)
- [ ] `npm publish` exécuté pour chaque package
- [ ] Tag git créé (`git tag v1.0.0 && git push --tags`)
- [ ] GitHub Release créée avec le changelog
- [ ] Plugins soumis au marketplace Strapi (première fois uniquement)
