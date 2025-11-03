import { expect, test, Page } from '@playwright/test';
import mockRefApi from '../../utils/mock-api';
import { financial_url_helper } from '../../utils/urls.conf';

test.describe('Recherche sur deux critères Année/Type et grouping', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    const root = financial_url_helper(baseURL).root;

    await mockRefApi(page);
    await page.goto(root.pathname);
    await page.waitForURL(root.urlHavingSamePathname);
  });

  test('Effectue la recherche et affiche le composant de résultat sans grouping', async ({ page }) => {
    // 1. Vérifier que la page est chargée
    await expect(page).toHaveTitle(/^Données financières de l'état*/);

    // 2. Effectuer une recherche simple
    await performBasicSearch(page);

    // 3. Attendre que les résultats soient affichés
    await waitForSearchResultsLine(page);

    await expect(page.locator('budget-table-toolbar')).toBeVisible();
    await expect(page.getByTestId("chose-columns-btn")).toBeVisible();
    await expect(page.getByTestId("group-by-btn")).toBeVisible();
    await expect(page.getByTestId('toggle-grid-fullscreen-btn')).toBeVisible();
  });

  test("Effectue la recherche et groupe par Année/programme", async ({ page }) => {
    // 1. Effectuer une recherche simple
    await performBasicSearch(page);

    // 2. Attendre que les résultats soient affichés
    await waitForSearchResultsLine(page);
    // 4 . click sur le grouping
    await page.getByTestId("group-by-btn").click()

    // 5. Vérifier que le modal de grouping est ouvert
    await expect(page.locator('#modalGrouping')).toBeVisible();

    // 6. Sélectionner le premier élément de grouping (par exemple "Année")
    await selectGroupingOption(page, 'Année Exercice comptable');

    // 7. Sélectionner le deuxième élément de grouping (par exemple "Programme")
    await selectGroupingOption(page, 'Programme');

    // 8. Valider le grouping
    await page.getByTestId("modal-grouping-validate-btn").click();

    // affichage de la recherche en cours
    await expect(page.getByText('Recherche en cours')).toBeVisible();
    // Puis attendre qu'il disparaisse (recherche terminée)
    await expect(page.getByText('Recherche en cours')).not.toBeVisible({ timeout: 15000 });

    // 11. Vérifier que le grouping est appliqué
    await verifyGroupingIsApplied(page);

    
    // On doit voir 2 ligne de grouping : 1 pour chaque annéee
    await expect(page.locator("#table-10")).toBeVisible();
    await expect(page.locator(".accordion-header.clickable")).toHaveCount(2);
    
    // Vérifier que chaque td.td-group contient "Année exercice comptable"
    const groupHeaders = page.locator(".accordion-header.clickable td.td-group");
    const groupHeadersCount = await groupHeaders.count();
    
    for (let i = 0; i < groupHeadersCount; i++) {
      // Vérifier le contenu textuel
      const textExpected = await groupHeaders.nth(i).textContent();
      await expect(textExpected).toMatch(/^Année Exercice comptable/);

      // check présence du bouton pour déplier le grouping
      const arrowSpan = groupHeaders.nth(i).locator('span.collapse-arrow');
      await expect(arrowSpan).toHaveClass(/fr-icon-arrow-right-s-line/);
    }

    // Vérifier la présence des colonnes spécifiques dans l'en-tête
    await expect(page.locator("#table-10 thead tr th")).toHaveCount(4);
    await expect(page.getByRole('cell', { name: 'Montant engagé' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Montant Payé' })).toBeVisible();

    // Vérifier que le texte commence par "Total" et finit par "Lignes"
    const totalCellText = await page.locator("#table-10-row-key-0 > td").first().textContent();
    expect(totalCellText).toMatch(/^TOTAL.*lignes$/s);
  })

  test("Effectue une recherche et groupe uniquement par Année", async ({page})=> {
    // 1. Effectuer une recherche simple
    await performBasicSearch(page);

    // 2. Attendre que les résultats soient affichés
    await waitForSearchResultsLine(page);

    // 3. Cliquer sur le bouton de grouping
    await page.getByTestId("group-by-btn").click();

    // 4. Vérifier que le modal de grouping est ouvert
    await expect(page.locator('#modalGrouping')).toBeVisible();

    // 5. Sélectionner uniquement "Année Exercice comptable"
    await selectGroupingOption(page, 'Année Exercice comptable');

    // 6. Valider le grouping
    await page.getByRole('button', { name: /valider/i }).click();

    // 7. Attendre la fin de la recherche
    await expect(page.getByText('Recherche en cours')).toBeVisible();
    await expect(page.getByText('Recherche en cours')).not.toBeVisible({ timeout: 15000 });

    // 8. Vérifier que le grouping avec 1 seul critère est appliqué
    await verifyGroupingIsAppliedSingleCriteria(page);

    // 9. Vérifier la structure du tableau groupé
    await expect(page.locator("#table-10")).toBeVisible();
    await expect(page.locator(".accordion-header")).toHaveCount(2);

    // 10. Vérifier que chaque groupe contient "Année Exercice comptable"
    const groupHeaders = page.locator(".accordion-header td.td-group");
    const groupHeadersCount = await groupHeaders.count();
    
    for (let i = 0; i < groupHeadersCount; i++) {
      // Vérifier le contenu textuel
      const textExpected = await groupHeaders.nth(i).textContent();
      await expect(textExpected).toMatch(/^Année Exercice comptable/);

      // Vérifier que le span collapse-arrow est présent mais vide (pas d'icône)
      const arrowSpan = groupHeaders.nth(i).locator('span.collapse-arrow');
      await expect(arrowSpan).not.toHaveClass(/fr-icon-arrow-right-s-line/);
      await expect(arrowSpan).not.toHaveClass(/fr-icon-arrow-down-s-line/);
    }

    // 11. Vérifier la présence des colonnes dans l'en-tête
    await expect(page.locator("#table-10 thead tr th")).toHaveCount(4);
    await expect(page.getByRole('cell', { name: 'Montant engagé' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Montant Payé' })).toBeVisible();
  })


  test("Effectue la recherche, groupe par Année/programme et navigue dans les nœuds du grouping", async ({page})=> {
    // 1. Effectuer une recherche simple
    await performBasicSearch(page);
  })


  test("Effectue la recherche, groupe par Année/programme et rentre dans les données du groupe", async ({page})=> {
    // 1. Effectuer une recherche simple
    await performBasicSearch(page);
  })


  test("Effectue la recherche, groupe par Année/programme et annule le grouping", async ({page})=> {
    // 1. Effectuer une recherche simple
    await performBasicSearch(page);
  })

  test("Effectue la recherche, groupe par Année/programme et change le grouping pour passer en Programme/Année", async ({page})=> {
    // 1. Effectuer une recherche simple
    await performBasicSearch(page);
  })
});

/**
 * Effectue une recherche simple en sélectionnant des critères de base
 */
async function performBasicSearch(page: Page): Promise<void> {
  // Sélectionner les types de bénéficiaires : Collectivité et Entreprise
  await page.getByTestId('types-beneficiaires-form-field').click();
  await page.getByRole('option', { name: 'Collectivité' }).click();
  await page.getByRole('option', { name: 'Entreprise' }).click();
  await page.keyboard.press('Escape'); // Fermer le dropdown avec Escape

  // Sélectionner une année
  await page.getByTestId('annees-form-field').click();
  await page.getByRole('option', { name: '2023' }).click();
  await page.getByRole('option', { name: '2024' }).click();
  await page.locator('body').click(); // Fermer le dropdown

  // Lancer la recherche
  await page.getByTestId('search').click();
}

/**
 * Attend que les résultats de recherche soient affichés
 */
async function waitForSearchResultsLine(page: Page): Promise<void> {
  // Attendre que le message "Recherche en cours" apparaisse
  await expect(page.getByText('Recherche en cours')).toBeVisible();
  
  // Puis attendre qu'il disparaisse (recherche terminée)
  await expect(page.getByText('Recherche en cours')).not.toBeVisible({ timeout: 15000 });
  
  // Vérifier que le composant d'affiche des lignes apparait ainsi que la toolbar
  await expect(page.locator('budget-table-toolbar')).toBeVisible();
  await expect(page.locator('budget-lines-table')).toBeVisible();
}

/**
 * Sélectionne une option de grouping dans le modal
 */
async function selectGroupingOption(page: Page, optionName: string): Promise<void> {
  // Sélectionner dans le dropdown du modal
  await page.locator('#selectColonne').selectOption({ label: optionName });
}

/**
 * Vérifie que le grouping est appliqué
 */
async function verifyGroupingIsApplied(page: Page): Promise<void> {
  // Vérifier que le bouton de grouping est en mode "primary" (actif)
  await expect(page.getByTestId('group-by-btn')).toHaveClass(/fr-btn--primary/);
  
  // Vérifier que le bouton affiche le nombre de critères sélectionnés
  await expect(page.getByTestId('group-by-btn')).toContainText('2');
  
  // Vérifier que le texte change pour indiquer le grouping actif
  await expect(page.getByTestId('group-by-btn')).toContainText('Grouper les lignes par');

  // vérifier que le composant de grouping est bien affiché
  await expect(page.locator('budget-groups-table')).toBeVisible();
  await expect(page.locator('budget-lines-table')).not.toBeVisible();
  // bouton pour revenir à l'affichage non groupé
  await expect(page.getByRole('button', { name: 'Revenir à l\'affichage non-groupé' })).toBeVisible();
}

/**
 * Vérifie que le grouping avec un seul critère est appliqué
 */
async function verifyGroupingIsAppliedSingleCriteria(page: Page): Promise<void> {
  // Vérifier que le bouton de grouping est en mode "primary" (actif)
  await expect(page.getByTestId('group-by-btn')).toHaveClass(/fr-btn--primary/);
  
  // Vérifier que le bouton affiche 1 critère sélectionné
  await expect(page.getByTestId('group-by-btn')).toContainText('1');
  
  // Vérifier que le texte change pour indiquer le grouping actif
  await expect(page.getByTestId('group-by-btn')).toContainText('Grouper les lignes par');

  // vérifier que le composant de grouping est bien affiché
  await expect(page.locator('budget-groups-table')).toBeVisible();
  await expect(page.locator('budget-lines-table')).not.toBeVisible();
  // bouton pour revenir à l'affichage non groupé
  await expect(page.getByRole('button', { name: 'Revenir à l\'affichage non-groupé' })).toBeVisible();
}
