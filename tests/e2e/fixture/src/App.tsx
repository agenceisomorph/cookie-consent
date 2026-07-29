/**
 * Application de demonstration servie aux tests de navigation.
 *
 * Elle reproduit le montage attendu chez un client : les signaux Google sont
 * refuses par defaut dans index.html, le bandeau et la modale sont montes en
 * tete de page, et le script de mesure n'est injecte que si la categorie
 * analytique a ete acceptee. C'est cette injection conditionnelle qui donne
 * leur valeur aux tests "aucune requete Google avant consentement".
 *
 * Trois adresses : / (bandeau et pied de page), /youtube, /maps.
 */

import { useEffect } from 'react';
import {
  CookieProvider,
  CookieBanner,
  CookiePreferences,
  GoogleMap,
  YoutubeEmbed,
  useConsent,
} from '@isomorph-agency/cookie-consent';

// Le journal de consentement part sur la meme origine : le middleware Vite
// l'absorbe, la fixture n'a donc besoin d'aucun Strapi.
const CONFIG = {
  strapiUrl: '/api',
  siteDomain: 'fixture.test',
};

// ─── Mesure d'audience conditionnelle ────────────────────────────

function MesureAudience() {
  const { isGranted } = useConsent();
  const autorise = isGranted('analytics');

  useEffect(() => {
    if (!autorise) return;
    if (document.getElementById('script-mesure')) return;

    const script = document.createElement('script');
    script.id = 'script-mesure';
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-FIXTURE00';
    document.head.appendChild(script);
  }, [autorise]);

  return null;
}

// ─── Pied de page ────────────────────────────────────────────────

function PiedDePage() {
  const { openPreferences } = useConsent();

  return (
    <footer
      style={{
        borderTop: '1px solid #e4e4e7',
        marginTop: '48px',
        padding: '24px 32px',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '14px',
      }}
    >
      <button
        type="button"
        onClick={() => openPreferences()}
        style={{
          minHeight: '44px',
          padding: '0 16px',
          border: '1px solid #e4e4e7',
          borderRadius: '8px',
          backgroundColor: '#ffffff',
          color: '#3f3f46',
          font: 'inherit',
          cursor: 'pointer',
        }}
      >
        Gérer mes cookies
      </button>
    </footer>
  );
}

// ─── Pages ───────────────────────────────────────────────────────

function PageAccueil() {
  return (
    <>
      <h1 style={{ fontSize: '22px', margin: '0 0 12px' }}>Fixture de recette</h1>
      <p style={{ margin: 0, color: '#52525b' }}>
        Page servie aux tests de navigation. Le bandeau doit apparaître à la première visite.
      </p>
    </>
  );
}

function PageYoutube() {
  return (
    <>
      <h1 style={{ fontSize: '22px', margin: '0 0 12px' }}>Vidéo intégrée</h1>
      <YoutubeEmbed videoId="fixture-video" title="Présentation de la fixture" height="320px" />
    </>
  );
}

function PageMaps() {
  return (
    <>
      <h1 style={{ fontSize: '22px', margin: '0 0 12px' }}>Carte intégrée</h1>
      <GoogleMap title="Carte Google Maps" height="320px">
        <div
          data-testid="carte-chargee"
          style={{
            height: '320px',
            backgroundColor: '#e4e4e7',
            borderRadius: '8px',
          }}
        />
      </GoogleMap>
    </>
  );
}

function Page() {
  const chemin = window.location.pathname;
  if (chemin.startsWith('/youtube')) return <PageYoutube />;
  if (chemin.startsWith('/maps')) return <PageMaps />;
  return <PageAccueil />;
}

// ─── Racine ──────────────────────────────────────────────────────

export function App() {
  return (
    <CookieProvider config={CONFIG}>
      {/* Montes en tete : l'ordre du DOM fixe l'ordre de tabulation, que le
          test de navigation clavier verifie. */}
      <CookieBanner />
      <CookiePreferences />
      <MesureAudience />

      {/* La marge basse evite que le bandeau flottant ne recouvre les boutons
          des facades, ce qui bloquerait les clics. */}
      <main
        style={{
          maxWidth: '720px',
          padding: '32px',
          paddingBottom: '280px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <Page />
      </main>

      <PiedDePage />
    </CookieProvider>
  );
}
