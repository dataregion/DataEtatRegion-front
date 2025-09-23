import { default as programmes } from '../../mock-data/financial-data/programme.json';
import { default as themes } from '../../mock-data/financial-data/themes.json';
import { default as financial } from '../../mock-data/financial-data/financial.json';

import { default as demarcheDS } from '../../mock-data/demarches/demarcheDS.json';
import { default as demarcheDB } from '../../mock-data/demarches/demarcheDB.json';
import { default as donnees } from '../../mock-data/demarches/donnees.json';
import { default as demarche_reconciliee } from '../../mock-data/demarches/demarcheDB_reconciliee.json';

import { Page, Route } from '@playwright/test';

function is_url_ae_annees(url: URL) {
  return url.pathname == '/financial-data/api/v2/budget/annees';
}

function is_url_budget_programmes(url: URL) {
  return url.pathname == '/budget/api/v1/programme';
}

function is_url_budget_themes(url: URL) {
  return url.pathname == '/budget/api/v1/themes';
}

function is_url_lignes_budgetaires(url: URL) {
  return url.pathname == '/financial-data/api/v2/budget';
}

function is_url_graphql_demarche(url: URL) {
  return url.pathname == '/apis-externes/demarche-simplifie';
}

function is_url_data_demarche(url: URL) {
  return url.pathname == '/data-demarches/demarche';
}

function is_url_data_demarche_donnees(url: URL) {
  return url.pathname == '/data-demarches/donnees';
}

function is_url_data_demarche_reconciliation(url: URL) {
  return url.pathname == '/data-demarches/reconciliation';
}

async function mockRefApi(page: Page) {
  await page.route(is_url_budget_themes, async (route: Route) => {
    const json = themes;
    await route.fulfill({ json });
  });

  await page.route(is_url_budget_programmes, async (route: Route) => {
    const json = programmes;
    await route.fulfill({ json });
  });

  await page.route(is_url_ae_annees, async (route: Route) => {
    const json = [2019,2022,2021,2022,2023,2024,2025,2026,2027];
    await route.fulfill({ json });
  });

  await page.route(is_url_lignes_budgetaires, async (route: Route) => {
    const json = financial;
    await route.fulfill({ json });
  });

  await page.route(
    /.*\/badministration\/api\/v1\/audit\/FINANCIAL_DATA_AE\/.*/,
    async (route: Route) => {
      const json = {
        date: '2023-06-02T10:21:06.167896+00:00'
      };
      await route.fulfill({ json });
    }
  );

  await page.route(is_url_graphql_demarche, async (route: Route) => {
    const json = demarcheDS;
    await route.fulfill({ json });
  });

  await page.route(is_url_data_demarche, async (route: Route) => {
    const json = demarcheDB;
    await route.fulfill({ json });
  });

  await page.route(is_url_data_demarche_donnees, async (route: Route) => {
    const json = donnees;
    await route.fulfill({ json });
  });

  await page.route(is_url_data_demarche_reconciliation, async (route: Route) => {
    const json = demarche_reconciliee;
    await route.fulfill({ json });
  });
}

export default mockRefApi;
