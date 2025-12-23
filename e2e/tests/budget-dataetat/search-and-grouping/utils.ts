import { expect, Page } from '@playwright/test';

/**
 * Attend que les résultats de recherche soient affichés
 */
async function waitForSearchResultsLine(page: Page): Promise<void> {
    // Attendre que le message "Recherche en cours" apparaisse
    await expect(page.getByText('Recherche en cours')).toBeVisible();

    // Puis attendre qu'il disparaisse (recherche terminée)
    await page.getByText('Recherche en cours').waitFor({ state: 'hidden', timeout: 10000 });

    // Vérifier que le composant d'affiche des lignes apparait ainsi que la toolbar
    await expect(page.locator('budget-table-toolbar')).toBeVisible();
    await expect(page.locator('budget-lines-table')).toBeVisible();
}

/**
 * Effectue un grouping et lance la recherche
 * @param page 
 * @param groupingOptions 
 */
async function waitForGrouping(page: Page, groupingOptions: string[]): Promise<void> {
    // 3. Ouvrir le modal de grouping
    await page.getByTestId("group-by-btn").click();
    await expect(page.locator('#modalGrouping')).toBeVisible();

    for (const option of groupingOptions) {
        await page.locator('#selectColonne').selectOption({ label: option });
    }

    await page.getByTestId("modal-grouping-validate-btn").click();

    // Attendre la fin de la recherche
    await expect(page.getByText('Recherche en cours')).toBeVisible();
    await page.getByText('Recherche en cours').waitFor({ state: 'hidden', timeout: 10000 });
}

async function unfoldFirstNode(page: Page): Promise<void> {
    await page.locator(".accordion-header.clickable td.td-group span.collapse-arrow").first().click();
    // affichage d'un champ de recherche temporaire
    await expect(page.getByRole('status', { name: 'Chargement…' })).toBeVisible();
    await page.getByRole('status', { name: 'Chargement…' }).waitFor({ state: 'hidden', timeout: 10000 });
}


async function waitResponseFetchApiV3(page: Page): Promise<void> {
  await page.waitForResponse('**/financial-data/api/v3/lignes*');
}

export const SearchAndGroupingUtils = {
    waitForSearchResultsLine,
    waitForGrouping,
    unfoldFirstNode,
    waitResponseFetchApiV3
};