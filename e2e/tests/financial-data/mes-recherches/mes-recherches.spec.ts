import { expect, test } from '@playwright/test';
import mockPreferencesApi from './mock-preferences';
import { financial_url_helper } from 'e2e/tests/utils/urls.conf';

test.describe('Mes recherches', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    const preference = financial_url_helper(baseURL).preference;

    await mockPreferencesApi(page);
    await page.goto(preference.pathname);
    await page.waitForURL(preference.urlHavingSamePathname);
  });

  test("L'application d'un filtre bénéficiaires fonctionne", async ({ page }) => {
    await expect(page.getByRole('cell').first()).toContainText('decats');

    const apply_locator = page.locator('button[aria-roledescription="appliquer"]');
    await expect(apply_locator).toBeTruthy();
    await apply_locator.click();
    await page.waitForURL('./?uuid=**');

    const search_benef = page.getByTestId('search-beneficiaires-control');
    await expect(search_benef).toContainText('DECATHLON');
  });
});
