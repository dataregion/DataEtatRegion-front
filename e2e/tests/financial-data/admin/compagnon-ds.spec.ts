import { expect, test } from '@playwright/test';
import mockRefApi from '../../utils/mock-api';

test.describe('Compagnon DS', () => {
  test.beforeEach(async ({ page }) => {
    await mockRefApi(page);
    await page.goto('./');
  });

  test('Redirection si accès à une étape en aval', async ({ page }) => {
    // Goto page de réconciliation => redirection
    await page.goto('/administration/demarches/reconciliation');
    await expect(page.getByTestId('stepperTitle')).toContainText('Intégrer ma démarche');

    // Goto page d'affichage => redirection
    await page.goto('/administration/demarches/affichage');
    await expect(page.getByTestId('stepperTitle')).toContainText('Intégrer ma démarche');
  });

  test("L'utilisateur a accès au compagnon DS", async ({ page }) => {
    // Présence du menu d'admin et vérification du contenu
    await expect(page.locator('#administration')).toBeVisible();
    await page.locator('#administration').click();
    await expect(page.getByRole('menuitem', { name: 'Gestion des utilisateurs' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Charger des données' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Compagnon DS' })).toBeVisible();

    // Navigate by click => Intégration d'une démarche
    await expect(page.getByRole('menuitem', { name: 'Compagnon DS' })).toBeVisible();
    await page.getByRole('menuitem', { name: 'Compagnon DS' }).click();
    await expect(page.getByTestId('stepperTitle')).toContainText('Intégrer ma démarche');
  });
});
