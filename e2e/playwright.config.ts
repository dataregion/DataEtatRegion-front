import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  globalSetup: './global-setup',
  testDir: './tests',
  /* Maximum time one test can run for. */
  timeout: 30 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 5000
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env['CI'],
  /* Retry on CI only */
  retries: process.env['CI'] ? 0 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env['CI'] ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 5000,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'retain-on-failure',
    testIdAttribute: 'data-test-id'
  },
  
  projects: [
    // Page de login
    {
      name: 'no-login-chrome',
      testDir: './tests/no-login',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env['BUDGET_BRETAGNE_BASE_URL'],
      }
    },
    {
      name: 'no-login-firefox',
      testDir: './tests/no-login',
      use: {
        ...devices['Desktop Firefox'],
        baseURL: process.env['BUDGET_BRETAGNE_BASE_URL'],
      }
    },

    // Tests de non reg
    {
      name: 'budget-dataetat-nonreg-chrome',
      testDir: './tests/budget-dataetat/non-reg',
      use: {
        storageState: 'storage-state/storageState-simple.json',
        ...devices['Desktop Chrome'],
        baseURL: process.env['NEW_BUDGET_BRETAGNE_BASE_URL'],
      }
    },

    // Tests simples
    {
      name: 'financial-data-simple-chrome',
      testDir: './tests/financial-data',
      testIgnore: ['**/admin/**'],
      use: {
        storageState: 'storage-state/storageState-simple.json',
        ...devices['Desktop Chrome'],
        baseURL: process.env['BUDGET_BRETAGNE_BASE_URL'],
      }
    },
    {
      name: 'financial-data-simple-firefox',
      testDir: './tests/financial-data',
      testIgnore: ['**/admin/**'],
      use: {
        storageState: 'storage-state/storageState-simple.json',
        ...devices['Desktop Firefox'],
        baseURL: process.env['BUDGET_BRETAGNE_BASE_URL'],
      }
    },
    {
      name: 'budget-dataetat-simple-profile-firefox',
      testDir: './tests/budget-dataetat/',
      testIgnore: ['**/admin/**'],
      use: {
        storageState: 'storage-state/storageState-simple.json',
        ...devices['Desktop Firefox'],
        baseURL: process.env['NEW_BUDGET_BRETAGNE_BASE_URL'],
      }
    },
    {
      name: 'budget-dataetat-simple-profile-chrome',
      testDir: './tests/budget-dataetat/',
      testIgnore: ['**/admin/**'],
      use: {
        storageState: 'storage-state/storageState-simple.json',
        ...devices['Desktop Chrome'],
        baseURL: process.env['NEW_BUDGET_BRETAGNE_BASE_URL'],
      }
    },
    // tests profil ADMIN
    {
      name: 'financial-data-admin-profile-chrome',
      testDir: './tests/financial-data/admin/',
      use: {
        storageState: 'storage-state/storageState-admin.json',
        ...devices['Desktop Chrome'],
        baseURL: process.env['BUDGET_BRETAGNE_BASE_URL'],
      }
    },
    {
      name: 'financial-data-admin-profile-firefox',
      testDir: './tests/financial-data/admin/',
      use: {
        storageState: 'storage-state/storageState-admin.json',
        ...devices['Desktop Firefox'],
        baseURL: process.env['BUDGET_BRETAGNE_BASE_URL'],
      }
    },
    {
      name: 'budget-dataetat-admin-profile-chrome',
      testDir: './tests/budget-dataetat/admin/',
      use: {
        storageState: 'storage-state/storageState-admin.json',
        ...devices['Desktop Chrome'],
        baseURL: process.env['NEW_BUDGET_BRETAGNE_BASE_URL'],
      }
    },
    {
      name: 'budget-dataetat-admin-profile-firefox',
      testDir: './tests/budget-dataetat/admin/',
      use: {
        storageState: 'storage-state/storageState-admin.json',
        ...devices['Desktop Firefox'],
        baseURL: process.env['NEW_BUDGET_BRETAGNE_BASE_URL'],
      }
    },
  ]
};

export default config;
