/**
 * Services Library — Catalogue centralisé de tous les services/traceurs connus.
 *
 * Chaque service est défini une seule fois ici avec son logo officiel,
 * le nom du cookie, la durée de conservation et la catégorie CNIL.
 *
 * Usage : dans CookieConsentWrapper, déclarer les clés des services actifs sur le site.
 * CookiePreferences ne rend que les services déclarés actifs.
 */

import type { ConsentCategory } from './types/consent.types';

import {
  adsLogo,
  tiktokLogo,
  recaptchaLogo,
  youtubeLogo,
  ga4Logo,
  strapiLogo,
  metaLogo,
  mapsLogo,
} from './services-logos';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ServiceKey =
  | 'google-analytics-4'
  | 'google-ads'
  | 'meta-pixel'
  | 'tiktok-pixel'
  | 'youtube'
  | 'google-maps'
  | 'recaptcha'
  | 'strapi-session';

export interface ServiceDefinition {
  name: string;
  logo: React.ReactNode;
  cookie?: string;
  duration?: string;
  category: ConsentCategory;
}

function Logo({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      width={20}
      height={20}
      aria-hidden="true"
      style={{ display: 'block', objectFit: 'contain' }}
    />
  );
}

// ─── Catalogue complet ────────────────────────────────────────────────────────

export const SERVICES_LIBRARY: Record<ServiceKey, ServiceDefinition> = {
  'google-analytics-4': {
    name: 'Google Analytics 4',
    logo: <Logo src={ga4Logo} alt="Google Analytics 4" />,
    cookie: '_ga, _ga_*',
    duration: '13 mois',
    category: 'analytics',
  },
  'google-ads': {
    name: 'Google Ads',
    logo: <Logo src={adsLogo} alt="Google Ads" />,
    cookie: '_gcl_au, _gads',
    duration: '90 jours',
    category: 'advertising',
  },
  'meta-pixel': {
    name: 'Meta Pixel',
    logo: <Logo src={metaLogo} alt="Meta" />,
    cookie: '_fbp, _fbc',
    duration: '90 jours',
    category: 'advertising',
  },
  'tiktok-pixel': {
    name: 'TikTok Pixel',
    logo: <Logo src={tiktokLogo} alt="TikTok" />,
    cookie: '_ttp, tt_webid_v2',
    duration: '13 mois',
    category: 'advertising',
  },
  'youtube': {
    name: 'YouTube',
    logo: <Logo src={youtubeLogo} alt="YouTube" />,
    cookie: 'VISITOR_INFO1_LIVE, YSC',
    duration: '6 mois / Session',
    category: 'functional',
  },
  'google-maps': {
    name: 'Google Maps',
    logo: <Logo src={mapsLogo} alt="Google Maps" />,
    cookie: 'NID, 1P_JAR',
    duration: '6 mois',
    category: 'functional',
  },
  'recaptcha': {
    name: 'Google reCAPTCHA',
    logo: <Logo src={recaptchaLogo} alt="reCAPTCHA" />,
    cookie: 'rc::a, rc::c',
    duration: 'Session / Persistant',
    category: 'necessary',
  },
  'strapi-session': {
    name: 'Strapi CMS',
    logo: <Logo src={strapiLogo} alt="Strapi" />,
    cookie: 'strapi_session',
    duration: 'Session',
    category: 'necessary',
  },
};
