'use strict';

/**
 * Policy rate-limit — Anti-spam sur le POST public.
 * Limite simple en mémoire : max 10 requêtes par IP par minute.
 * Pour la prod, un rate limiter plus robuste (Redis) est recommandé.
 */

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;

// Store en mémoire (reset au redémarrage Strapi — acceptable pour ce use case)
const store = new Map();

// Nettoyage périodique pour éviter les fuites mémoire
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now - entry.windowStart > WINDOW_MS * 2) {
      store.delete(key);
    }
  }
}, WINDOW_MS * 5);

module.exports = (policyContext, config, { strapi }) => {
  const ip =
    policyContext.request.headers['x-forwarded-for'] ||
    policyContext.request.headers['x-real-ip'] ||
    policyContext.request.ip ||
    'unknown';

  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    // Nouvelle fenêtre
    store.set(ip, { windowStart: now, count: 1 });
    return true;
  }

  entry.count += 1;

  if (entry.count > MAX_REQUESTS) {
    strapi.log.warn(`[cookie-consent] Rate limit dépassé pour IP: ${ip}`);
    policyContext.status = 429;
    policyContext.body = { error: 'Trop de requêtes. Réessayez dans une minute.' };
    return false;
  }

  return true;
};
