import { expect, Page, test } from '@playwright/test';
import { financial_url_helper } from '../utils/urls.conf';

test.describe("Page d'authentification", () => {
  test.beforeEach(async ({ page }) => {
    await waitingRedirectKeycloak(page);
  });

  test("L'utilisateur non connecté est redirigé vers la page de login", async ({ page }) => {
    await expect(page).toHaveURL(/^https:\/\/auth.*/);

    await expect(page).toHaveTitle(/^Se connecter .*/);

    await expect(await page.textContent('h1')).toBe('Connexion');

    await expect(await page.getByRole('button', { name: 'Se connecter' }).textContent()).toBe(
      'Se connecter'
    );
  });

  test("L'utilisateur ne peux pas se connecter", async ({ page }) => {
    await page.locator('.fr-alert--error').isHidden();

    await page.locator('button', { hasText: 'Se connecter' }).click();

    const alert = page.locator('.fr-alert--error');
    await alert.isVisible();
    await expect(await alert.locator('p').textContent()).toContain(
      "Nom d'utilisateur ou mot de passe invalide"
    );
  });
});

// attente de redirection vers keycloak
async function waitingRedirectKeycloak(page: Page) {
  const root = financial_url_helper().root;
  await page.goto(root.pathname);
  await page.waitForURL(/^https:\/\/auth.*/);
}
