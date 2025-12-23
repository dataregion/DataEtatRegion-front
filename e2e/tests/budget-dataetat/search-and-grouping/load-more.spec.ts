import { expect, test, Page } from '@playwright/test';
import mockRefApi from '../../utils/mock-api';
import { financial_url_helper } from '../../utils/urls.conf';
import { SearchAndGroupingUtils } from './utils';


test.describe('Chargement de données supplémentaires', () => {
    test.beforeEach(async ({ page, baseURL }) => {
        const root = financial_url_helper(baseURL).root;

        await mockRefApi(page);
        await page.goto(root.pathname);
        await page.waitForURL(root.urlHavingSamePathname);
    });

    // Test Issues #395 
    test('Groupe par Programme et Beneficiaire puis ouvre les données d\'un programme contenant des beneficiaires', async ({ page }) => {

        // Effectue une recherche sur "Bretagne"
        await performSearchOnYear(page);

        const buttonLoadMore = page.getByTestId('load-more-button-node-programme_code');
       

        await SearchAndGroupingUtils.waitForSearchResultsLine(page);

        await SearchAndGroupingUtils.waitForGrouping(page, ['Programme', 'Bénéficiaire']);

        // pas de bouton charger plus
        await expect(buttonLoadMore).toHaveCount(0);
         // Déplier le premier nœud
        await SearchAndGroupingUtils.unfoldFirstNode(page);

        // il y a 100 lignes affichées
        const level1Headers = page.locator('tr.accordion-header[data-lvl="1"]');
        let level1Count = await level1Headers.count();
        expect(level1Count).toBe(100);

        await expect(buttonLoadMore).toBeVisible();

        await page.route('**/financial-data/api/v3/lignes*', async (route) => {
            const url = new URL(route.request().url());
            expect(url.searchParams.get('grouping')).toBe('programme_code,beneficiaire_code');
            expect(url.searchParams.get('grouped')).toBeTruthy();
            expect(url.searchParams.get('page')).toBe('2'); // on charge la page 2
            
            const response = await route.fetch();
            await route.fulfill({ response });
        });

        // click sur le charger plus
        await buttonLoadMore.click();

        const spinner  = page.getByTestId('load-more-spinner-node-programme_code');
        await expect(spinner).toBeVisible();
        await spinner.waitFor({ state: 'hidden', timeout: 10000 });


        // il y a 100 lignes affichées de plus
        level1Count = await level1Headers.count();
        expect(level1Count).toBe(200);
    })


    test('Groupe par Beneficiaire puis charge plus de page',async ({ page }) => {
        // Effectue une recherche sur "Bretagne"
        await performSearchOnYear(page);

        await SearchAndGroupingUtils.waitForSearchResultsLine(page);

        await SearchAndGroupingUtils.waitForGrouping(page, ['Bénéficiaire']);

        const buttonLoadMore = page.getByTestId('load-more-button-root')
        await expect(buttonLoadMore).toBeVisible();

        // il y a 100 lignes affichées
        const level0Headers = page.locator('tr.accordion-header[data-lvl="0"]');
        let level0Count = await level0Headers.count();
        expect(level0Count).toBe(100);


         await page.route('**/financial-data/api/v3/lignes*', async (route) => {
            const url = new URL(route.request().url());
            expect(url.searchParams.get('grouping')).toBe('beneficiaire_code');
            expect(url.searchParams.get('grouped')).toBe("")
            expect(url.searchParams.get('page')).toBe('2'); // on charge la page 2
            
            const response = await route.fetch();
            await route.fulfill({ response });
        });

        // click sur le charger plus
        await buttonLoadMore.click();

        const spinner  = page.getByTestId('load-more-spinner-root');
        await expect(spinner).toBeVisible();
        await spinner.waitFor({ state: 'hidden', timeout: 10000 });

        // il y a 100 lignes affichées de plus
        level0Count = await level0Headers.count();
        expect(level0Count).toBe(200);
    })

})


/**
 * Effectue une recherche simple en sélectionnant des critères de base
 */
async function performSearchOnYear(page: Page): Promise<void> {

  // Sélectionner une année
  await page.getByTestId('annees-form-field').click();
  await page.getByRole('option', { name: '2023' }).click();
  await page.locator('body').click(); // Fermer le dropdown

  // Lancer la recherche
  await page.getByTestId('search').click();
}