import { Page, Route } from '@playwright/test';
import mockRefApi from './mock-api';

import { default as financial_lignes_v3 } from '../../mock-data/financial-data/v3/simple-lignes/financial_lignes-v3.json';
import { default as detail_paiements_v3 } from '../../mock-data/financial-data/v3/simple-lignes/detail-paiement-v3.json';
import { default as no_details_detail_paiements_v3 } from '../../mock-data/financial-data/v3/simple-lignes/no-detail-paiement-v3.json';

function is_url_lignes_budgetaires_v3(url: URL) {
  return url.pathname == '/financial-data/api/v3/lignes';
}

function is_url_detail_paiement_v3(url: URL) {
  return url.pathname == '/financial-data/api/v3/lignes/67990/details-paiement';
}

function is_url_detail_paiement_v3_no_details(url: URL) {
  return url.pathname == '/financial-data/api/v3/lignes/67621/details-paiement';
}

const simple_lignes_v3 = async (page: Page) => {
  await page.route(is_url_lignes_budgetaires_v3, async (route: Route) => {
    const json = financial_lignes_v3;
    await route.fulfill({ json });
  });
  
  await page.route(is_url_detail_paiement_v3, async (route: Route) => {
    const json = detail_paiements_v3;
    await route.fulfill({ json });
  });

  await page.route(is_url_detail_paiement_v3_no_details, async (route: Route) => {
    const json = no_details_detail_paiements_v3;
    await route.fulfill({ json });
  });
};

const mockers = {
    'exhaustiveMockApi': mockRefApi,
    'simple_lignes_v3': simple_lignes_v3,
}

export default mockers;