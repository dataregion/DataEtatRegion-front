import { expect, test, Page } from '@playwright/test';
import mockRefApi from '../../utils/mock-api';
import { financial_url_helper } from '../../utils/urls.conf';
import { SearchAndGroupingUtils } from './utils';

test.describe('Recherche sur deux critères Année/Type et grouping', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    const root = financial_url_helper(baseURL).root;

    await mockRefApi(page);
    await page.goto(root.pathname);
    await page.waitForURL(root.urlHavingSamePathname);
  });

  test('Effectue la recherche et affiche le composant de résultat sans grouping', async ({ page }) => {
    // 1. Effectuer une recherche simple
    await performBasicSearch(page);

    // 3. Attendre que les résultats soient affichés
    await SearchAndGroupingUtils.waitForSearchResultsLine(page);

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
    await verifyGroupingStructure(page, 2, true, /^Année Exercice comptable/);
    await verifyTableColumns(page);
    await verifyTotalCellContent(page);
  })

  test("Effectue une recherche et groupe uniquement par Année", async ({ page }) => {
    // Setup grouping avec 1 critère
    await setupGroupingTest(page, ['Année Exercice comptable']);
    await verifyGroupingIsAppliedSingleCriteria(page);

    // Vérifications spécifiques au grouping à 1 niveau
    await verifyGroupingStructure(page, 2, false, /^Année Exercice comptable/);
    await verifyTableColumns(page);
  })

  // non reg fix #396 
  test("Effectue une recherche et groupe uniquement par Année, rentre dans un groupe et affiche une colonne supplémentaire", async ({ page }) => {
    // Setup grouping avec 1 critère
    await setupGroupingTest(page, ['Année Exercice comptable']);

    await page.getByRole('button', { name: 'Voir les données de ce groupe' }).first().click(); // on rentre dans le premier groupe

    // affichage d'un champ de recherche temporaire
    await expect(page.getByRole('status', { name: 'Chargement…' })).toBeVisible();
    // await page.getByRole('status', { name: 'Chargement…' }).waitFor({ state: 'hidden', timeout: 10000 });

    // On check la présence des bouttons retour, grouping, choix des colonnes
    await SearchAndGroupingUtils.checkButtonEnterGroupingVisibile(page);
    await expect(page.getByText('Année Exercice comptable :')).toBeVisible();

    // check la colonne Programme n'est pas visibile
    await expect(page.getByRole('columnheader', { name: 'Programme' })).not.toBeVisible();

    await SearchAndGroupingUtils.waitForSelectColumnsModal(page, 'Programme');

    // check la colonne est visibile
    await expect(page.getByRole('columnheader', { name: 'Programme' })).toBeVisible();

    // On check que les boutons sont tjs présent
    await SearchAndGroupingUtils.checkButtonEnterGroupingVisibile(page);
    await expect(page.getByText('Année Exercice comptable :')).toBeVisible();

  })


  test("Effectue la recherche, groupe par Année/programme et navigue dans les nœuds du grouping", async ({ page }) => {
    // 1. Effectuer une recherche simple
    await performBasicSearch(page);

    // 2. Attendre que les résultats soient affichés
    await SearchAndGroupingUtils.waitForSearchResultsLine(page);

    // 3. Cliquer sur le bouton de grouping
    await makeGroupingAnneeProgramme(page);

    await verifyGroupingIsApplied(page);

    // Vérifier l'état initial : 2 nœuds fermés
    await verifyCollapsedNodesCount(page, 2);
    await verifyTotalClickableNodesCount(page, 2);
    await verifyExpandedNodesCount(page, 0);

    // Déplier le premier nœud
    await SearchAndGroupingUtils.unfoldFirstNode(page);

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
    await verifyTotalClickableNodesCount(page, 2);

    // on replie le premier noeud
    await page.locator(".accordion-header.clickable td.td-group span.collapse-arrow").first().click();

    // Vérifier l'état initial : 2 nœuds fermés
    await verifyCollapsedNodesCount(page, 2);
    await verifyTotalClickableNodesCount(page, 2);
    await verifyExpandedNodesCount(page, 0);
  })


  test("Effectue la recherche, groupe par Année/programme et rentre dans les données du groupe", async ({ page }) => {
    // 1. Effectuer une recherche simple
    await performBasicSearch(page);

    // 2. Attendre que les résultats soient affichés
    await SearchAndGroupingUtils.waitForSearchResultsLine(page);

    // on a pas le bouton de retour
    await expect(page.getByRole('button', { name: 'Retour' })).not.toBeVisible()

    await makeGroupingAnneeProgramme(page);

    // Vérifier l'état initial : 2 nœuds fermés
    await verifyCollapsedNodesCount(page, 2);


    // on replie le premier noeud
    await page.locator(".accordion-header.clickable td.td-group span.collapse-arrow").first().click();

    // affichage d'un champ de recherche temporaire
    await expect(page.getByRole('status', { name: 'Chargement…' })).toBeVisible();
    await page.getByRole('status', { name: 'Chargement…' }).waitFor({ state: 'hidden', timeout: 10000 });

    // Vérifier que les sous-groupes de niveau 1 (Programme) sont maintenant visibles
    const boutton = page.locator('tr.accordion-header[data-lvl="1"] td button.fr-icon-search-line');
    await expect(boutton).toHaveCount(await boutton.count());
    const level1Count = await boutton.count();
    expect(level1Count).toBeGreaterThan(0);


    //clic sur un bouton voir les données du groupe
    await page.locator('tr.accordion-header[data-lvl="1"] td button.fr-icon-search-line').first().click();

    // mise sur la page de ligne
    await SearchAndGroupingUtils.waitForSearchResultsLine(page);

    // Vérifier que le bouton affiche le nombre de critères sélectionnés
    await expect(page.getByTestId('group-by-btn')).toContainText('2');

    // bouton de retour présent
    await expect(page.getByRole('button', { name: 'Retour' })).toBeVisible()


    const boutonAnnee = await page.getByText('Année Exercice comptable :').textContent();
    const boutonProgramme = await page.getByText('Programme :').textContent();

    expect(boutonAnnee).toMatch(/^Année Exercice comptable : (2023|2024)$/);

    expect(boutonProgramme).toMatch(/^Programme : .{2,5}$/);
    //click sur le bouton retour

    await page.getByRole('button', { name: 'Retour' }).click();
    await SearchAndGroupingUtils.waitResponseFetchApiV3(page);

    // on revient au grouping initiale
    await verifyGroupingIsApplied(page);
  })


  test("Effectue la recherche, groupe par Année/programme et annule le grouping", async ({ page }) => {
    // 1. Effectuer une recherche simple
    await performBasicSearch(page);

    // 2. Attendre que les résultats soient affichés
    await SearchAndGroupingUtils.waitForSearchResultsLine(page);

    // 3. Cliquer sur le bouton de grouping
    await makeGroupingAnneeProgramme(page);

    await verifyGroupingIsApplied(page);

    // annule le grouping sur le bouton "revenir à l'afficha non groupé"
    await page.getByRole('button', { name: 'Revenir à l\'affichage non-' }).click();

    // 2. Attendre que les résultats soient affichés
    await SearchAndGroupingUtils.waitForSearchResultsLine(page);

  })

  test("Effectue la recherche, groupe par Année/programme et change le grouping pour passer en Programme/Année", async ({ page }) => {
    // Setup grouping avec 2 critères
    await setupGroupingTest(page, ['Année Exercice comptable', 'Programme']);
    await verifyGroupingIsApplied(page);

    await verifyGroupingStructure(page, 2, true, /^Année Exercice comptable/);

    // changement du grouping
     // 3. Ouvrir le modal de grouping
    await page.getByTestId("group-by-btn").click();
    await expect(page.locator('#modalGrouping')).toBeVisible();

    // delete du grouping Annee

    await page.locator("button.fr-btn.fr-icon-delete-fill").first().click();

    selectGroupingOption(page,'Année Exercice comptable');

     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let capturedResponse: any = null;

    await page.route('**/financial-data/api/v3/lignes*', async (route) => {
      const response = await route.fetch();     
      capturedResponse = {
        url: response.url(),
        json: await response.json()
      };
      await route.fulfill({ response });
    });

    await page.getByTestId("modal-grouping-validate-btn").click();
    // Attendre que la réponse soit capturée
    await SearchAndGroupingUtils.waitResponseFetchApiV3(page);

    expect(capturedResponse).not.toBeNull();
    const url = new URL(capturedResponse.url);
    const grouping = url.searchParams.get('grouping');
    expect(grouping).toContain('programme_code');

    // on récupère le nombre de ligne retourné par l'api pour avoir le nombre de grouping
    await verifyGroupingStructure(page, capturedResponse.json.data.groupings.length, true, /^Programme/);
  })
});

/**
 * Effectue une recherche simple en sélectionnant des critères de base
 */
async function performBasicSearch(page: Page): Promise<void> {
  await expect(page).toHaveTitle(/^Données financières de l'état*/);

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

async function makeGroupingAnneeProgramme(page: Page): Promise<void> {

  await page.getByTestId("group-by-btn").click();

  await selectGroupingOption(page, 'Année Exercice comptable');
  await selectGroupingOption(page, 'Programme');

  await page.getByTestId("modal-grouping-validate-btn").click();
  // attente de la réponse de l'api
  await SearchAndGroupingUtils.waitResponseFetchApiV3(page);
}

/**
 * Vérifie le nombre de nœuds d'accordéon fermés (collapse-arrow avec icône droite)
 */
async function verifyCollapsedNodesCount(page: Page, expectedCount: number): Promise<void> {
  await expect(page.locator("span.collapse-arrow.fr-icon-arrow-right-s-line")).toHaveCount(expectedCount);
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
  await SearchAndGroupingUtils.waitForSearchResultsLine(page);
  // 3. Cliquer sur le bouton de grouping
  await SearchAndGroupingUtils.waitForGrouping(page, groupingOptions);
}

/**
 * Vérifie la structure du tableau groupé
 */
async function verifyGroupingStructure(page: Page, expectedHeaderCount: number, isClickable: boolean, textPaternLevelOne: RegExp): Promise<void> {
  await expect(page.locator("#table-10")).toBeVisible();

  const headerSelector = isClickable ? ".accordion-header.clickable" : ".accordion-header";
  await expect(page.locator(headerSelector)).toHaveCount(expectedHeaderCount);

  const groupHeaders = page.locator(`${headerSelector} td.td-group`);
  const groupHeadersCount = await groupHeaders.count();

  for (let i = 0; i < groupHeadersCount; i++) {
    const textExpected = await groupHeaders.nth(i).textContent();
    await expect(textExpected).toMatch(textPaternLevelOne);

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
  await expect(page.getByRole('columnheader', { name: 'Montant engagé' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Montant Payé' })).toBeVisible();
}

/**
 * Vérifie le contenu de la cellule total
 */
async function verifyTotalCellContent(page: Page): Promise<void> {
  const totalCellText = await page.locator("#table-10-row-key-0 > td").first().textContent();
  expect(totalCellText).toMatch(/^TOTAL.*lignes$/s);
}
