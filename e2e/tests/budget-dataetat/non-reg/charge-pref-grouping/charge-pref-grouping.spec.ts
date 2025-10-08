import { expect, Page, test } from '@playwright/test';
import mockPreferencesApi from './mock-preferences';
import { financial_url_helper } from 'e2e/tests/utils/urls.conf';

test.describe('Chargement des préférences - non reg', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    const preference = financial_url_helper(baseURL).preference;

    await mockPreferencesApi(page);
    await page.goto(preference.pathname);
    await page.waitForURL(preference.urlHavingSamePathname);
  });

  test("Applique deux filtres successifs et vérifie que les groupings s'appliquent bien", async ({ page }) => {
    let selected_groupings = await selectionne_filtre_et_check_grouping(page, 'grouping-annee')
    await expect(selected_groupings.nth(1)).toContainText('Année');
    await expect(page.getByRole('cell', { name: 'Année Exercice comptable 2019' }).getByRole('paragraph').first()).toBeVisible();

    await page.getByRole('button', { name: 'Fermer' }).click();
    await page.getByRole('button', { name: 'Mes recherches' }).click();

    selected_groupings = await selectionne_filtre_et_check_grouping(page, 'grouping-beneficiaire')
    await expect(selected_groupings.nth(1)).toContainText('Bénéficiaire');
    await page.getByRole('button', { name: 'Fermer' }).click();
    
    await expect(page.getByRole('cell', { name: 'Bénéficiaire' }).getByRole('paragraph').first()).toBeVisible();
  });
});

async function selectionne_filtre_et_check_grouping(page: Page, group_name: string) {

    const btn = page.getByRole('row', { name: group_name }).getByRole('button').nth(2)
    await btn.click();
    await page.waitForURL('./?uuid=**');

    const grouper_les_lignes = page.getByText("Grouper les lignes par")
    await expect(grouper_les_lignes).toBeVisible();
    await grouper_les_lignes.click();
    
    const progressBar = page.getByRole('progressbar').locator('div').nth(1)
    await expect(progressBar).not.toBeVisible();

    const selected_groups = page.getByTestId('group-modal_selected').locator('div')
    return selected_groups
}