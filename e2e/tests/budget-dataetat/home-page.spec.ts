import { expect, test } from '@playwright/test';
import mockRefApi from '../utils/mock-api';
import { financial_url_helper } from '../utils/urls.conf';

test.describe("Page d'accueil", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    const root = financial_url_helper(baseURL).root;

    await mockRefApi(page);
    await page.goto(root.pathname);
    await page.waitForURL(root.urlHavingSamePathname);
  });

  test("L'utilisateur est connecté", async ({ page }) => {
    await expect(page).toHaveTitle(/^Données financières de l'état*/);

    await page.getByRole('button', { name: "Information de l'utilisateur" }).isVisible();

    const clickOnBody = async () => {
      // XXX: for closing opened select
      // await page.locator('.cdk-overlay-backdrop').first().click();
      await page.locator('body').click();
    };

    // vérification du formulaire
    await page.getByLabel('Thème').click();
    await expect(
      page.getByRole('listbox', { name: 'Thème' }).locator('.mdc-list-item__primary-text')
    ).toHaveCount(16);
    await clickOnBody();

    await page.getByLabel('Programme').click();
    await expect(
      page.getByRole('listbox', { name: 'Programme' }).locator('.mdc-list-item__primary-text')
    ).toHaveCount(26);
    await clickOnBody();

    // vérification des niveaux de localisation
    await page.locator('[data-test-id="localisation-select"]').click();
    await expect(page.getByText('Aucun résultat')).toBeTruthy();
    await clickOnBody();

    await page.getByLabel('Zone géographique').click();
    await expect(
      page
        .getByRole('listbox', { name: 'Zone géographique' })
        .locator('.mdc-list-item__primary-text')
    ).toHaveCount(8);
    await clickOnBody();

    await page.getByLabel('Type de bénéficiaire').click();
    await expect(
      page
        .getByRole('listbox', { name: 'Type de bénéficiaire' })
        .locator('.mdc-list-item__primary-text')
    ).toHaveCount(5);
    await clickOnBody();

    await page.getByLabel('Année').isVisible();
    await page.getByLabel('Bénéficiaire', { exact: true }).isVisible();
    expect((await page.locator('form').getByRole('button').count()) == 1);
  });
});

