#!/usr/bin/env node
/**
 * Garde-fou pré-publication — vérifie que le tarball npm contient bien
 * tous les fichiers déclarés dans `exports` et `main` du package.json.
 *
 * Contexte : la 1.0.0 de @isomorph-agency/cookie-consent a été publiée
 * sans build préalable → tarball réduit à package.json (dist/ absent).
 * Ce script est branché sur `prepublishOnly` de chaque package publiable :
 * publish impossible si un chemin exporté manque dans le tarball.
 *
 * Usage : node ../../_scripts/verify-tarball.mjs  (cwd = dossier du package)
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

const required = new Set();
const collect = (value) => {
  if (typeof value === 'string') {
    if (value.startsWith('./')) required.add(value.slice(2));
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach(collect);
  }
};
collect(pkg.exports ?? {});
for (const field of ['main', 'module', 'types']) {
  if (typeof pkg[field] === 'string') required.add(pkg[field].replace(/^\.\//, ''));
}

// Plugin Strapi : le loader v5 résout la partie serveur via `strapi-server.js`
// (ou l'export `strapi-server`), PAS via `main`. Un tarball sans ce fichier
// installe un plugin qui ne charge jamais ses routes/bootstrap (bug 1.0.1).
if (pkg.strapi?.kind === 'plugin') {
  const hasServerExport = typeof pkg.exports === 'object'
    && pkg.exports?.['./strapi-server'] !== undefined;
  if (!hasServerExport) required.add('strapi-server.js');
}

if (required.size === 0) {
  console.error('✖ verify-tarball : aucun chemin à vérifier (ni exports, ni main) — package.json suspect.');
  process.exit(1);
}

const raw = execFileSync('npm', ['pack', '--dry-run', '--json', '--silent'], {
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
});
const [report] = JSON.parse(raw);
const files = new Set(report.files.map((f) => f.path));

const missing = [...required].filter((f) => !files.has(f));
if (missing.length > 0) {
  console.error(`✖ Tarball ${pkg.name}@${pkg.version} INCOMPLET — fichiers exportés manquants :`);
  for (const f of missing) console.error(`    ${f}`);
  console.error('  → lancer `npm run build` dans le package avant de publier.');
  process.exit(1);
}

console.log(
  `✔ Tarball ${pkg.name}@${pkg.version} OK — ${files.size} fichiers, ${required.size} chemins exportés présents.`,
);
