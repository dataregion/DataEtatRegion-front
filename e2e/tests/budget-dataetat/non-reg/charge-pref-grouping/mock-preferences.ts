import { default as preferences } from './mock-preferences.data.json';
import { default as preferencesdetails1 } from './mock-preferences-details1.data.json';
import { default as preferencesdetails2 } from './mock-preferences-details2.data.json';
import { default as preferencesdetails3 } from './mock-preferences-details3.data.json';

import { Page, Route } from '@playwright/test';

function is_url_user_preferences(url: URL) {
  const match_v1 = url.pathname == '/administration/api/v1/users/preferences';
  const match_v3 = url.pathname == '/administration/api/v3/users/preferences';
  return match_v1 || match_v3;
}

function is_url_user_preferences_detail_one(url: URL) {
  const match_v3 =
    url.pathname == '/administration/api/v3/users/preferences/01b7fd86-3192-4079-8898-5a57dc8a3970';
  return match_v3;
}

function is_url_user_preferences_detail_two(url: URL) {
  const match_v3 =
    url.pathname == '/administration/api/v3/users/preferences/a4fd18d0-f1fa-4388-9e71-b1019ed67a13';
  return match_v3;
}

function is_url_user_preferences_detail_three(url: URL) {
  const match_v3 =
    url.pathname == '/administration/api/v3/users/preferences/690cbc4b-7153-480f-81b7-409bf8b6db40';
  return match_v3;
}

async function mockPreferencesApi(page: Page) {
  await page.route(is_url_user_preferences, async (route: Route) => {
    const json = preferences;
    await route.fulfill({ json });
  });

  await page.route(is_url_user_preferences_detail_one, async (route: Route) => {
    const json = preferencesdetails1;
    await route.fulfill({ json });
  });

  await page.route(is_url_user_preferences_detail_two, async (route: Route) => {
    const json = preferencesdetails2;
    await route.fulfill({ json });
  });

  await page.route(is_url_user_preferences_detail_three, async (route: Route) => {
    const json = preferencesdetails3;
    await route.fulfill({ json });
  });
}

export default mockPreferencesApi;
