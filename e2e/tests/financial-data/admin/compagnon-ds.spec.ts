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

  test("Vérification d'une démarche déjà intégrée", async ({ page }) => {
    // Goto page d'intégration
    await page.goto('/administration/demarches/integration');

    // Récupération de la démarche (mock)
    await page.getByTestId('numeroDemarche').fill('99999');
    await page.getByTestId('searchDemarcheBtn').click();
    await expect(page.getByTestId('nomDemarche')).toHaveText('Titre démarche');
    await expect(page.getByTestId('dateIntegration')).toHaveText(
      'Cette démarche a été intégrée le 29/07/2024'
    );
  });

  test('Navigate by click => Réconciliation de la démarche + submit réconciliation EJ', async ({
    page
  }) => {
    // Goto page d'intégration
    await page.goto('/administration/demarches/integration');

    // Récupération de la démarche (mock)
    await page.getByTestId('numeroDemarche').fill('99999');
    await page.getByTestId('searchDemarcheBtn').click();

    // Navigate by click => Page de réconciliation
    await page.getByTestId('btnSubmit').click();
    await expect(page.getByTestId('stepperTitle')).toContainText('Réconcilier ma démarche');

    // Select champ EJ
    await page.getByTestId('checkboxEJ').click({ force: true });
    await expect(page.getByTestId('checkboxEJ')).toBeChecked();
    await page.getByLabel('Numéro EJ *').selectOption('4');

    // Submit et vérification de l'arrivée sur la page d'affichage
    await page.getByTestId('btnSubmit').click();
    await expect(page.getByTestId('stepperTitle')).toContainText('Afficher ma démarche');
  });
});
