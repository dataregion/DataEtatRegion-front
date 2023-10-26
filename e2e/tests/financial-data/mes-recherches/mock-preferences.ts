import { default as preferences } from './mock-preferences.data.json';
import { default as preferencesdetails } from './mock-preferences-details.data.json'

import { Page } from '@playwright/test';

function is_url_user_preferences(url: URL) {
  const match = url.pathname == '/administration/api/v1/users/preferences'
  return match
}

function is_url_user_preferences_detail(url: URL) {
  const match = url.pathname == '/administration/api/v1/users/preferences/7dd35a3d-c43c-4fea-b329-2a1ba58d5941'
  return match
}


async function mockPreferencesApi(page: Page) {
  await page.route(
    is_url_user_preferences,
    async (route: any) => {
      const json = preferences;
      await route.fulfill({ json });
    }
  );

  await page.route(
    is_url_user_preferences_detail,
    async (route: any) => {
      const json = preferencesdetails;
      await route.fulfill({ json });
    }
  );
}

export default mockPreferencesApi;
