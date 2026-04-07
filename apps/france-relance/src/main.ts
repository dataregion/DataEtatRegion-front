import { CSP_NONCE } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

function getCspNonce(): string | undefined {
  const nonce = document
    .querySelector('meta[property="csp-nonce"], meta[name="csp-nonce"]')
    ?.getAttribute('content')
    ?.trim();

  return nonce && nonce !== '__CSP_NONCE__' ? nonce : undefined;
}

const cspNonce = getCspNonce();

platformBrowserDynamic(cspNonce ? [{ provide: CSP_NONCE, useValue: cspNonce }] : [])
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
