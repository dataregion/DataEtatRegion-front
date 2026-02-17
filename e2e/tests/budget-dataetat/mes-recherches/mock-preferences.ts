import { default as preferences } from './mock-preferences.data.json';
import { default as preferencesdetails } from './mock-preferences-details.data.json';

import { Page, Route } from '@playwright/test';

function is_url_user_preferences(url: URL) {
  const match_v3 = url.pathname == '/administration/api/v3/users/preferences';
  return match_v3;
}

function is_url_user_preferences_detail(url: URL) {
  const match_v3 =
    url.pathname == '/administration/api/v3/users/preferences/193591ae-deb3-49f2-bdd5-1842d93dd2b5';
  return match_v3;
}

async function mockPreferencesApi(page: Page) {
  await page.route(is_url_user_preferences, async (route: Route) => {
    const json = preferences;
    await route.fulfill({ json });
  });

  await page.route(is_url_user_preferences_detail, async (route: Route) => {
    const json = preferencesdetails;
    await route.fulfill({ json });
  });
}

export default mockPreferencesApi;
