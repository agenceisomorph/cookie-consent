'use strict';

const { ACTIONS, IP_OCTETS_KEPT, CONSENT_EXPIRY_MONTHS } = require('./constants');

/**
 * Validation partagée — @isomorph/cookie-consent
 * Utilisée par les controllers Strapi v4 et v5.
 * Pas de dépendance externe (pas de Zod côté Strapi pour rester léger).
 */

const VALID_ACTIONS = Object.values(ACTIONS);

/**
 * Valide le body d'une requête POST /api/cookie-consents.
 * Retourne { valid: true, data } ou { valid: false, errors }.
 */
function validateConsentBody(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Le body est requis et doit être un objet.'] };
  }

  // sessionId — string, requis, max 64 chars
  if (typeof body.sessionId !== 'string' || body.sessionId.length === 0) {
    errors.push('sessionId est requis (string non vide).');
  } else if (body.sessionId.length > 64) {
    errors.push('sessionId ne doit pas dépasser 64 caractères.');
  }

  // Booléens requis
  for (const field of ['necessary', 'analytics', 'advertising', 'functional']) {
    if (typeof body[field] !== 'boolean') {
      errors.push(`${field} est requis (boolean).`);
    }
  }

  // necessary doit toujours être true
  if (body.necessary === false) {
    errors.push('necessary doit toujours être true.');
  }

  // action — enum
  if (!VALID_ACTIONS.includes(body.action)) {
    errors.push(`action doit être l'une de : ${VALID_ACTIONS.join(', ')}.`);
  }

  // source — string requis
  if (typeof body.source !== 'string' || body.source.length === 0) {
    errors.push('source est requis (domaine du site).');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Construire l'objet validé avec dates calculées
  const now = new Date();
  const expiry = new Date(now);
  expiry.setMonth(expiry.getMonth() + CONSENT_EXPIRY_MONTHS);

  return {
    valid: true,
    data: {
      sessionId: body.sessionId.trim(),
      necessary: true,
      analytics: body.analytics,
      advertising: body.advertising,
      functional: body.functional,
      gcmVersion: 'v2',
      consentDate: now.toISOString(),
      expiryDate: expiry.toISOString(),
      source: body.source.trim(),
      action: body.action,
      // userAgent et ipAnonymized sont ajoutés par le controller (depuis la requête HTTP)
    },
  };
}

/**
 * Anonymise une adresse IP en gardant uniquement les N premiers octets.
 * Ex: "192.168.1.42" → "192.168.1.xxx"
 */
function anonymizeIp(ip) {
  if (!ip || typeof ip !== 'string') return null;

  // IPv4
  const parts = ip.split('.');
  if (parts.length === 4) {
    return parts.slice(0, IP_OCTETS_KEPT).join('.') + '.xxx';
  }

  // IPv6 — on garde les 3 premiers groupes
  const v6parts = ip.split(':');
  if (v6parts.length > 3) {
    return v6parts.slice(0, 3).join(':') + ':xxx';
  }

  return null;
}

module.exports = {
  validateConsentBody,
  anonymizeIp,
};
