import { test, expect } from '@playwright/test';

/**
 * Tests E2E — Bandeau cookies + consentement
 * Parcours critiques définis dans le CLAUDE.md
 */

// ─── Helpers ─────────────────────────────────────────────────────

const BANNER_SELECTOR = '[role="dialog"][aria-label="Gestion des cookies"]';
const PREFERENCES_SELECTOR = '[role="dialog"][aria-modal="true"]';
const COOKIE_NAME = 'isomorph_consent';

async function clearConsentCookie(page: import('@playwright/test').Page) {
  await page.context().clearCookies();
}

// ─── Nouvelle visite ─────────────────────────────────────────────

test.describe('Nouvelle visite', () => {
  test.beforeEach(async ({ page }) => {
    await clearConsentCookie(page);
  });

  test('affiche le bandeau cookies', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator(BANNER_SELECTOR)).toBeVisible();
  });

  test('affiche les 3 boutons (Refuser, Personnaliser, Accepter)', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Tout refuser' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Personnaliser' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Tout accepter' })).toBeVisible();
  });

  test('0 requête Google Analytics avant consentement', async ({ page }) => {
    const gaRequests: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('google-analytics.com') || req.url().includes('googletagmanager.com')) {
        gaRequests.push(req.url());
      }
    });

    await page.goto('/');
    await page.waitForTimeout(2000);
    expect(gaRequests).toHaveLength(0);
  });
});

// ─── Accepter tout ───────────────────────────────────────────────

test.describe('Accepter tout', () => {
  test.beforeEach(async ({ page }) => {
    await clearConsentCookie(page);
  });

  test('masque le bandeau après clic', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Tout accepter' }).click();
    await expect(page.locator(BANNER_SELECTOR)).not.toBeVisible();
  });

  test('crée le cookie de consentement', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Tout accepter' }).click();

    const cookies = await page.context().cookies();
    const consentCookie = cookies.find((c) => c.name === COOKIE_NAME);
    expect(consentCookie).toBeDefined();
  });

  test('le bandeau ne réapparaît pas au rechargement', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Tout accepter' }).click();
    await page.reload();
    await expect(page.locator(BANNER_SELECTOR)).not.toBeVisible();
  });
});

// ─── Refuser tout ────────────────────────────────────────────────

test.describe('Refuser tout', () => {
  test.beforeEach(async ({ page }) => {
    await clearConsentCookie(page);
  });

  test('masque le bandeau après clic', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Tout refuser' }).click();
    await expect(page.locator(BANNER_SELECTOR)).not.toBeVisible();
  });

  test('0 requête Google après refus', async ({ page }) => {
    const gaRequests: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('google-analytics.com') || req.url().includes('googletagmanager.com')) {
        gaRequests.push(req.url());
      }
    });

    await page.goto('/');
    await page.getByRole('button', { name: 'Tout refuser' }).click();
    await page.waitForTimeout(2000);
    expect(gaRequests).toHaveLength(0);
  });
});

// ─── Personnaliser ───────────────────────────────────────────────

test.describe('Personnaliser', () => {
  test.beforeEach(async ({ page }) => {
    await clearConsentCookie(page);
  });

  test('ouvre la modale de préférences', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Personnaliser' }).click();
    await expect(page.locator(PREFERENCES_SELECTOR)).toBeVisible();
  });

  test('affiche les 4 catégories', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Personnaliser' }).click();

    await expect(page.getByText('Nécessaires')).toBeVisible();
    await expect(page.getByText('Analytique')).toBeVisible();
    await expect(page.getByText('Publicité')).toBeVisible();
    await expect(page.getByText('Fonctionnel')).toBeVisible();
  });

  test('les catégories optionnelles sont désactivées par défaut', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Personnaliser' }).click();

    const analyticsToggle = page.getByRole('switch', { name: /analytique/i });
    await expect(analyticsToggle).toHaveAttribute('aria-checked', 'false');
  });

  test('"Nécessaires" n\'a pas de toggle (toujours actif)', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Personnaliser' }).click();

    const necessarySection = page.locator('[data-category="necessary"]');
    await expect(necessarySection.getByText('Actif')).toBeVisible();
    await expect(necessarySection.getByRole('switch')).not.toBeVisible();
  });

  test('Escape ferme la modale', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Personnaliser' }).click();
    await expect(page.locator(PREFERENCES_SELECTOR)).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.locator(PREFERENCES_SELECTOR)).not.toBeVisible();
  });

  test('activer analytique uniquement → enregistrer', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Personnaliser' }).click();

    // Activer analytique
    await page.getByRole('switch', { name: /analytique/i }).click();
    await expect(page.getByRole('switch', { name: /analytique/i })).toHaveAttribute(
      'aria-checked',
      'true'
    );

    // Enregistrer
    await page.getByRole('button', { name: 'Enregistrer mes choix' }).click();
    await expect(page.locator(PREFERENCES_SELECTOR)).not.toBeVisible();
    await expect(page.locator(BANNER_SELECTOR)).not.toBeVisible();

    // Vérifier le cookie
    const cookies = await page.context().cookies();
    const consentCookie = cookies.find((c) => c.name === COOKIE_NAME);
    expect(consentCookie).toBeDefined();

    const data = JSON.parse(decodeURIComponent(consentCookie!.value));
    expect(data.s.analytics).toBe(true);
    expect(data.s.advertising).toBe(false);
    expect(data.s.functional).toBe(false);
  });
});

// ─── Navigation clavier (RGAA) ──────────────────────────────────

test.describe('Navigation clavier', () => {
  test.beforeEach(async ({ page }) => {
    await clearConsentCookie(page);
  });

  test('Tab navigue entre les boutons du bandeau', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator(BANNER_SELECTOR)).toBeVisible();

    // Le premier bouton devrait avoir le focus
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.textContent);
    // Un des boutons du bandeau doit avoir le focus
    expect(['Tout refuser', 'Personnaliser', 'Tout accepter']).toContain(focused?.trim());
  });

  test('Escape sur le bandeau → refuse tout', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator(BANNER_SELECTOR)).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.locator(BANNER_SELECTOR)).not.toBeVisible();
  });
});

// ─── Retour sur le site ──────────────────────────────────────────

test.describe('Retour sur le site (cookie valide)', () => {
  test('pas de bandeau si cookie présent', async ({ page }) => {
    // D'abord accepter
    await page.goto('/');
    await page.getByRole('button', { name: 'Tout accepter' }).click();

    // Naviguer vers une autre page puis revenir
    await page.goto('/');
    await expect(page.locator(BANNER_SELECTOR)).not.toBeVisible();
  });
});
