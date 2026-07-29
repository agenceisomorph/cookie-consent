import { test, expect } from '@playwright/test';

/**
 * Tests E2E — Façades de contenu bloqué
 * YouTube, Google Maps, contenu générique
 */

const COOKIE_NAME = 'isomorph_consent';

// ─── YouTube sans consentement ───────────────────────────────────

test.describe('YouTube sans consentement', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('affiche la façade avec message et bouton', async ({ page }) => {
    await page.goto('/youtube');

    // Pas d'iframe YouTube
    await expect(page.locator('iframe[src*="youtube"]')).not.toBeVisible();

    // Façade visible avec message
    // Phrase complete du message : « cookies fonctionnels » seul correspond
    // aussi au libelle du bouton d'activation.
    await expect(page.getByText(/ce contenu nécessite les cookies fonctionnels/i)).toBeVisible();
    await expect(
      page.getByRole('button', { name: /activer les cookies fonctionnels/i }),
    ).toBeVisible();
  });

  test('clic sur le bouton ouvre les préférences sur la catégorie fonctionnel', async ({
    page,
  }) => {
    await page.goto('/youtube');

    await page.getByRole('button', { name: /activer les cookies fonctionnels/i }).click();

    // La modale de préférences s'ouvre
    await expect(page.locator('[role="dialog"][aria-modal="true"]')).toBeVisible();

    // La catégorie "Fonctionnel" est visible et scrollée
    await expect(page.locator('[data-category="functional"]')).toBeVisible();
  });

  test('activer fonctionnel → iframe YouTube chargée', async ({ page }) => {
    await page.goto('/youtube');

    // Ouvrir préférences depuis la façade
    await page.getByRole('button', { name: /activer les cookies fonctionnels/i }).click();

    // Activer le toggle fonctionnel
    await page.getByRole('switch', { name: /fonctionnel/i }).click();

    // Enregistrer
    await page.getByRole('button', { name: 'Enregistrer mes choix' }).click();

    // L'iframe YouTube doit maintenant être visible
    await expect(page.locator('iframe[src*="youtube-nocookie.com"]')).toBeVisible();
  });
});

// ─── Google Maps sans consentement ───────────────────────────────

test.describe('Google Maps sans consentement', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('affiche la façade', async ({ page }) => {
    await page.goto('/maps');

    // Phrase complete du message : « cookies fonctionnels » seul correspond
    // aussi au libelle du bouton d'activation.
    await expect(page.getByText(/ce contenu nécessite les cookies fonctionnels/i)).toBeVisible();
    await expect(
      page.getByRole('button', { name: /activer les cookies fonctionnels/i }),
    ).toBeVisible();
  });
});

// ─── Lien "Gérer mes cookies" dans le footer ────────────────────

test.describe('Lien footer', () => {
  test('le lien ouvre la modale de préférences après consentement', async ({ page }) => {
    await page.goto('/');
    // D'abord accepter tout, et attendre que le bandeau ait fini de s'effacer
    // pour qu'il ne recouvre pas le pied de page au moment du clic.
    await page.getByRole('button', { name: 'Tout accepter' }).click();
    await expect(
      page.locator('[role="dialog"][aria-label="Gestion des cookies"]'),
    ).not.toBeVisible();

    // Le lien "Gérer mes cookies" dans le footer
    await page.getByRole('button', { name: /gérer mes cookies/i }).click();
    await expect(page.locator('[role="dialog"][aria-modal="true"]')).toBeVisible();
  });
});
