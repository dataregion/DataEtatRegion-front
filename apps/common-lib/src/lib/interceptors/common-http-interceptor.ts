import { Injectable } from '@angular/core';
import {
  HttpContextToken,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { finalize, Observable, tap } from 'rxjs';
import { AlertService, LoaderService } from 'apps/common-lib/src/public-api';
import { KeycloakService } from 'keycloak-angular';

export const BYPASS_ALERT_INTERCEPTOR = new HttpContextToken<boolean>(() => false);
export const DO_NOT_ALERT_ON_NON_IMPLEMTENTED = new HttpContextToken<boolean>(() => false);

@Injectable()
export class CommonHttpInterceptor implements HttpInterceptor {
  constructor(
    private _keycloak: KeycloakService,
    private _loader: LoaderService,
    private _alertService: AlertService
  ) {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this._loader.startLoader();
    const handler = next.handle(req).pipe(
      finalize(() => {
        setTimeout(() => {
          this._loader.endLoader();
        });
      })
    );

    const bypass = req.context.get(BYPASS_ALERT_INTERCEPTOR);
    if (bypass) return handler;

    const doNotalertOnNonImplemented = req.context.get(DO_NOT_ALERT_ON_NON_IMPLEMTENTED);
    return handler.pipe(
      tap({
        error: (_error: HttpErrorResponse) => {
          if (_error?.status == 401) {
            this._keycloak.logout().then(() => {
              this._keycloak.clearToken();
              this._alertService.openAlertError('Votre session a expiré.');
            });
          }

          if (_error?.status >= 500) {
            const bypassAlert = doNotalertOnNonImplemented && _error?.status === 501;
            if (!bypassAlert) this._alertService.openAlertError('Une erreur est survenue');
          }
        }
      })
    );
  }
}
