# tasks/lessons.md — Mémoire des corrections

> Fichier vivant. Mettre à jour après chaque correction apportée par Florent.
> Claude doit lire ce fichier en début de chaque session avant toute action.

---

## Format des entrées

```
### [DATE] Titre court décrivant le problème
**Contexte :** Ce qui se passait quand l'erreur a eu lieu.
**Erreur commise :** Ce que Claude a fait de travers.
**Règle corrective :** Ce qu'il faut faire à la place, de façon impérative.
```

---

## Leçons

_Aucune leçon enregistrée pour l'instant. Ce fichier sera alimenté au fil des sessions._

### [2026-07-09] Publish npm sans build = tarball vide silencieux
**Contexte :** `@isomorph-agency/cookie-consent@1.0.0` a été publié à la main sans
`npm run build` préalable : `files: ["dist"]` + dist/ absent → npm a publié un tarball
réduit à package.json, sans erreur ni warning. Le package était inutilisable (bloquait l'intégration pilote).
**Erreur commise :** publish manuel sans vérifier le contenu du tarball ; le job CI de
publish était de toute façon inopérant (NODE_AUTH_TOKEN=GITHUB_TOKEN, invalide sur npm).
**Règle corrective :** ne JAMAIS publier sans le garde-fou `_scripts/verify-tarball.mjs`
(branché en prepublishOnly — ne pas le contourner avec --ignore-scripts). Après tout
publish, contrôler avec `npm view <pkg> dist.tarball` + `tar tzf`. Le publish CI exige
le secret repo `NPM_TOKEN` (token granulaire bypass-2FA, expire tous les 90 jours max).

### [2026-07-09] Un seul nom de scope canonique : @isomorph-agency
**Contexte :** deux sessions ont divergé (mars : publish avec tiret ; avril : "uniformisation"
sans tiret) → packages doublons sur npm, consommateurs cassés.
**Erreur commise :** renommage local sans vérifier ce qui était publié/référencé (README,
projets consommateurs).
**Règle corrective :** le scope npm ISOMORPH est `@isomorph-agency` (avec tiret), point.
Tout renommage de package publié = décision NEXUS + plan de dépréciation explicite.
