import { Page, Route } from '@playwright/test';

function is_url_user_preferences(url: URL) {
  const match = url.pathname == '/administration/api/v1/users/preferences';
  return match;
}

function is_url_user_preferences_detail_one(url: URL) {
  const match =
    url.pathname == '/administration/api/v1/users/preferences/7dd35a3d-c43c-4fea-b329-2a1ba58d5941';
  return match;
}

function is_url_user_preferences_detail_two(url: URL) {
  const match =
    url.pathname == '/administration/api/v1/users/preferences/7dd35a3d-c43c-4fea-b329-2a1ba58d5942';
  return match;
}

function is_url_user_preferences_detail_three(url: URL) {
  const match =
    url.pathname == '/administration/api/v1/users/preferences/7dd35a3d-c43c-4fea-b329-2a1ba58d5943';
  return match;
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
