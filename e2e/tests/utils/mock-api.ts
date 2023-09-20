import { default as programmes } from '../../mock-data/financial-data/programme.json';
import { default as financial } from '../../mock-data/financial-data/financial.json';

import { Page } from '@playwright/test';

function is_url_ae_annees(url: URL) {
  return url.pathname == '/financial-data/api/v1/ae/annees'
}

function is_url_budget_programmes(url: URL) {
  return url.pathname == '/budget/api/v1/programme'
}

function is_url_ae(url: URL) {
  return url.pathname == '/financial-data/api/v1/ae'
}

async function mockRefApi(page: Page) {
  await page.route(
    is_url_budget_programmes,
    async (route: any) => {
      const json = programmes;
      await route.fulfill({ json });
    }
  );

  await page.route(
    is_url_ae_annees,
    async (route: any) => {
      const json = [2023];
      await route.fulfill({ json });
    }
  )

  await page.route(
    is_url_ae,
    async (route: any) => {
      const json = financial;
      await route.fulfill({ json });
    }
  );


  await page.route(
    /.*\/badministration\/api\/v1\/audit\/FINANCIAL_DATA_AE\/.*/,
    async (route: any) => {
      const json = {
        "date": "2023-06-02T10:21:06.167896+00:00"
    };
      await route.fulfill({ json });
    }
  );
}

export default mockRefApi;
