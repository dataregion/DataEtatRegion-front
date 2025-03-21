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
    baseURL: 'https://budget-bretagne.nocode.csm.ovh',
    testIdAttribute: 'data-test-id'
  },

  projects: [
    {
      name: 'no-login-chrome',
      testDir: './tests/no-login',
      use: {
        ...devices['Desktop Chrome']
      }
    },
    {
      name: 'no-login-firefox',
      testDir: './tests/no-login',
      use: {
        ...devices['Desktop Firefox']
      }
    },

    // test profile USE SImple
    {
      name: 'login-simple-chrome',
      testIgnore: ['**/no-login/**', '**/admin/**'],
      use: {
        storageState: 'storage-state/storageState-simple.json',
        ...devices['Desktop Chrome']
      }
    },
    {
      name: 'login-simple-firefox',
      testIgnore: ['**/no-login/**', '**/admin/**'],
      use: {
        storageState: 'storage-state/storageState-simple.json',
        ...devices['Desktop Firefox']
      }
    },
    // test profile ADMIN
    {
      name: 'admin-profile-chrome',
      testMatch: '**/admin/**.spec.ts',
      use: {
        storageState: 'storage-state/storageState-admin.json',
        ...devices['Desktop Chrome']
      }
    },
    {
      name: 'admin-profile-firefox',
      testMatch: '**/admin/**.spec.ts',
      use: {
        storageState: 'storage-state/storageState-admin.json',
        ...devices['Desktop Firefox']
      }
    }
    // {
    //   name: 'firefox',
    //   use: {
    //     ...devices['Desktop Firefox'],
    //   },
    // },

    // {
    //   name: 'webkit',
    //   use: {
    //     ...devices['Desktop Safari'],
    //   },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: {
    //     ...devices['Pixel 5'],
    //   },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: {
    //     ...devices['iPhone 12'],
    //   },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: {
    //     channel: 'msedge',
    //   },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: {
    //     channel: 'chrome',
    //   },
    // },
  ]

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  // outputDir: 'test-results/',

  /* Run your local dev server before starting the tests */
  // use: {
  //   baseURL: 'https://budget.nocode.csm.ovh',
  // },
};

export default config;
