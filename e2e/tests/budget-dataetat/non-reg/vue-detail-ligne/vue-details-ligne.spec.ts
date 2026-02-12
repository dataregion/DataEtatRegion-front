import { expect, test } from '@playwright/test';
import mockers from '../../../utils/mockers';

import { financial_url_helper } from 'e2e/tests/utils/urls.conf';

test.describe('Vue détail ligne - non reg', () => {
  
  test.beforeEach(async ({ page }) => {
    await mockers['exhaustiveMockApi'](page);
    await mockers['simple_lignes_v3'](page);
  });

  test('Affiche les détails d’une ligne avec du détails de paiment', async ({ page, baseURL }) => {
    const accueil = financial_url_helper(baseURL).root;

    await page.goto(accueil.pathname);
    await page.getByTestId('search').click();

    await expect(page.locator('budget-lines-table')).toBeVisible();
    await page.getByRole('cell', { name: 'Bénéficiaire A' }).click();

    await expect(page.locator('.wrapper-table-detail-cp')).toBeVisible();
  });

  test('Affiche les détails d’une ligne sans détails de paiment', async ({ page, baseURL }) => {
    const accueil = financial_url_helper(baseURL).root;

    await page.goto(accueil.pathname);
    await page.getByTestId('search').click();

    await expect(page.locator('budget-lines-table')).toBeVisible();
    await page.getByRole('cell', { name: 'Bénéficiaire B' }).click();

    
    const txt = await page.getByText('Aucun crédit de paiement');
    await expect(txt).toBeVisible();
  });
});