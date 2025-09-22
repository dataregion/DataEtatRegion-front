import config from './playwright.config';

const devConfig = {
  ...config,

  use: {
    testIdAttribute: 'data-test-id',
  }
};

export default devConfig;
