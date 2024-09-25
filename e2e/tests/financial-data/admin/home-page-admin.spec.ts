import { expect, test } from '@playwright/test';
import mockRefApi from '../../utils/mock-api';
import { financial_url_helper } from 'e2e/tests/utils/urls.conf';

test.describe("Page d'accueil", () => {
  test.beforeEach(async ({ page }) => {
    await mockRefApi(page);
    await page.goto('./');
  });

  test("L'utilisateur a accès à la page de liste des utilisateurs", async ({ page, baseURL }) => {
    const management = financial_url_helper(baseURL).management;

    await expect(page.locator('id=administration')).toBeVisible();
    await page.locator('id=administration').click();

    await expect(page.getByRole('menuitem', { name: 'Gestion des utilisateurs' })).toBeVisible();

    await expect(page.getByRole('menuitem', { name: 'Charger des données' })).toBeVisible();

    await page.getByRole('menuitem', { name: 'Gestion des utilisateurs' }).click();

    await expect(page.locator('mat-card-title')).toHaveText('Liste des utilisateurs');

    expect(page.url()).toContain(management.pathname);
  });

  test("L'utilisateur a  accès à la page de management via le lien", async ({ page, baseURL }) => {
    const management = financial_url_helper(baseURL).management;

    await page.goto(management.pathname);
    expect(page.url()).toContain(management.pathname);
  });
});
