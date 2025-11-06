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
    // Setup grouping avec 2 critères
    await setupGroupingTest(page, ['Année Exercice comptable', 'Programme']);
    await verifyGroupingIsApplied(page);

    // Vérifications spécifiques au grouping à 2 niveaux
    await verifyGroupingStructure(page, 2, true);
    await verifyTableColumns(page);
    await verifyTotalCellContent(page);
  })

  test("Effectue une recherche et groupe uniquement par Année", async ({page})=> {
    // Setup grouping avec 1 critère
    await setupGroupingTest(page, ['Année Exercice comptable']);
    await verifyGroupingIsAppliedSingleCriteria(page);

    // Vérifications spécifiques au grouping à 1 niveau
    await verifyGroupingStructure(page, 2, false);
    await verifyTableColumns(page);
  })


  test("Effectue la recherche, groupe par Année/programme et navigue dans les nœuds du grouping", async ({page})=> {
    // 1. Effectuer une recherche simple
    await performBasicSearch(page);

     // 2. Attendre que les résultats soient affichés
    await waitForSearchResultsLine(page);

    // 3. Cliquer sur le bouton de grouping
    await page.getByTestId("group-by-btn").click();

    await selectGroupingOption(page, 'Année Exercice comptable');
    // 7. Sélectionner le deuxième élément de grouping (par exemple "Programme")
    await selectGroupingOption(page, 'Programme');

    await page.getByTestId("modal-grouping-validate-btn").click();

    await verifyGroupingIsApplied(page);

    // Vérifier l'état initial : 2 nœuds fermés
    await verifyCollapsedNodesCount(page, 2);
    await verifyTotalClickableNodesCount(page,2);
    await verifyExpandedNodesCount(page, 0);

    // Déplier le premier nœud
    await page.locator(".accordion-header.clickable td.td-group span.collapse-arrow").first().click();

    // affichage d'un champ de recherche temporaire
    await expect(page.getByRole('status', { name: 'Chargement…' })).toBeVisible();
    await expect(page.getByRole('status', { name: 'Chargement…' })).not.toBeVisible();

    // Vérifier que les sous-groupes de niveau 1 (Programme) sont maintenant visibles
    const level1Headers = page.locator('tr.accordion-header[data-lvl="1"]');
    await expect(level1Headers).toHaveCount(await level1Headers.count());
    const level1Count = await level1Headers.count();
    expect(level1Count).toBeGreaterThan(0);
    
    // Vérifier que chaque sous-groupe contient "Programme"
    for (let i = 0; i < level1Count; i++) {
      const headerText = await level1Headers.nth(i).textContent();
      await expect(headerText).toMatch(/^Programme/);
    }

     // Vérifier l'état après dépliage : 1 nœud fermé, 1 nœud ouvert
    await verifyCollapsedNodesCount(page, 1);
    await verifyExpandedNodesCount(page, 1);
    await verifyTotalClickableNodesCount(page,2);

    // on replie le premier noeud
    await page.locator(".accordion-header.clickable td.td-group span.collapse-arrow").first().click();
    
    // Vérifier l'état initial : 2 nœuds fermés
    await verifyCollapsedNodesCount(page, 2);
    await verifyTotalClickableNodesCount(page,2);
    await verifyExpandedNodesCount(page, 0);
  })


  test("Effectue la recherche, groupe par Année/programme et rentre dans les données du groupe", async ({page})=> {
    // 1. Effectuer une recherche simple
    await performBasicSearch(page);

    //TODO
  })


  test("Effectue la recherche, groupe par Année/programme et annule le grouping", async ({page})=> {
    // 1. Effectuer une recherche simple
    await performBasicSearch(page);

    //TODO
  })

  test("Effectue la recherche, groupe par Année/programme et change le grouping pour passer en Programme/Année", async ({page})=> {
    // 1. Effectuer une recherche simple
    await performBasicSearch(page);

    //TODO
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

/**
 * Vérifie le nombre de nœuds d'accordéon fermés (collapse-arrow avec icône droite)
 */
async function verifyCollapsedNodesCount(page: Page, expectedCount: number): Promise<void> {
  await expect(page.locator(".accordion-header.clickable td.td-group span.collapse-arrow.fr-icon-arrow-right-s-line")).toHaveCount(expectedCount);
}

/**
 * Vérifie le nombre de nœuds d'accordéon ouverts (collapse-arrow avec icône bas)
 */
async function verifyExpandedNodesCount(page: Page, expectedCount: number): Promise<void> {
  await expect(page.locator(".accordion-header.clickable td.td-group span.collapse-arrow.fr-icon-arrow-down-s-line")).toHaveCount(expectedCount);
}

/**
 * Vérifie le nombre total de nœuds d'accordéon cliquables
 */
async function verifyTotalClickableNodesCount(page: Page, expectedCount: number): Promise<void> {
  await expect(page.locator(".accordion-header.clickable td.td-group span.collapse-arrow")).toHaveCount(expectedCount);
}

/**
 * Configure et exécute un test de grouping complet (recherche + sélection critères + validation)
 */
async function setupGroupingTest(page: Page, groupingOptions: string[]): Promise<void> {
  // 1. Effectuer une recherche simple
  await performBasicSearch(page);

  // 2. Attendre que les résultats soient affichés
  await waitForSearchResultsLine(page);

  // 3. Ouvrir le modal de grouping
  await page.getByTestId("group-by-btn").click();
  await expect(page.locator('#modalGrouping')).toBeVisible();

  // 4. Sélectionner les critères de grouping
  for (const option of groupingOptions) {
    await selectGroupingOption(page, option);
  }

  // 5. Valider le grouping
  await page.getByTestId("modal-grouping-validate-btn").click();

  // 6. Attendre la fin de la recherche
  await expect(page.getByText('Recherche en cours')).toBeVisible();
  await expect(page.getByText('Recherche en cours')).not.toBeVisible({ timeout: 15000 });
}

/**
 * Vérifie la structure du tableau groupé
 */
async function verifyGroupingStructure(page: Page, expectedHeaderCount: number, isClickable: boolean): Promise<void> {
  await expect(page.locator("#table-10")).toBeVisible();
  
  const headerSelector = isClickable ? ".accordion-header.clickable" : ".accordion-header";
  await expect(page.locator(headerSelector)).toHaveCount(expectedHeaderCount);
  
  const groupHeaders = page.locator(`${headerSelector} td.td-group`);
  const groupHeadersCount = await groupHeaders.count();
  
  for (let i = 0; i < groupHeadersCount; i++) {
    const textExpected = await groupHeaders.nth(i).textContent();
    await expect(textExpected).toMatch(/^Année Exercice comptable/);

    const arrowSpan = groupHeaders.nth(i).locator('span.collapse-arrow');
    if (isClickable) {
      await expect(arrowSpan).toHaveClass(/fr-icon-arrow-right-s-line/);
    } else {
      await expect(arrowSpan).not.toHaveClass(/fr-icon-arrow-right-s-line/);
      await expect(arrowSpan).not.toHaveClass(/fr-icon-arrow-down-s-line/);
    }
  }
}

/**
 * Vérifie la présence des colonnes financières dans l'en-tête du tableau
 */
async function verifyTableColumns(page: Page): Promise<void> {
  await expect(page.locator("#table-10 thead tr th")).toHaveCount(4);
  await expect(page.getByRole('cell', { name: 'Montant engagé' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Montant Payé' })).toBeVisible();
}

/**
 * Vérifie le contenu de la cellule total
 */
async function verifyTotalCellContent(page: Page): Promise<void> {
  const totalCellText = await page.locator("#table-10-row-key-0 > td").first().textContent();
  expect(totalCellText).toMatch(/^TOTAL.*lignes$/s);
}
