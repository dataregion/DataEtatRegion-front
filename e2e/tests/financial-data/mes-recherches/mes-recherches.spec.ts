import { test, expect } from '@playwright/test';
import mockPreferencesApi from './mock-preferences';

test.describe("Mes recherches", () => {

  test.beforeEach(
    async ({ page }) => {
      await mockPreferencesApi(page);
      await page.goto('./preference')
      await page.waitForURL('./preference')
    }
  )

  test("L'application d'un filtre bénéficiaires fonctionne", async ({ page }) => {
    await expect(page.getByRole('cell').first()).toContainText("decats");

    const apply_locator = page.locator('button[aria-roledescription="appliquer"]')
    await expect(apply_locator).toBeTruthy()
    await apply_locator.click()
    await page.waitForURL('./?uuid=**')

    await expect(page.getByLabel("Bénéficiaire").first()).toContainText('DECATHLON')
  })
})