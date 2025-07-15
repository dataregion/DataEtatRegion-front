import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn } from '@angular/common/http';
import { AlertService, LoaderService } from 'apps/common-lib/src/public-api';
import { inject } from '@angular/core';
import Keycloak from 'keycloak-js';
import { finalize, tap } from 'rxjs';


export const budgetHttpInterceptorInterceptor: HttpInterceptorFn = (req, next: HttpHandlerFn) => {

  const keycloak = inject(Keycloak);
  const loader = inject(LoaderService);
  const alertService = inject(AlertService);

  loader.startLoader();
  return next(req).pipe(
    finalize(() => {
      setTimeout(() => {
        loader.endLoader();
      });
    })
  ).pipe(
    tap({
      error: (_error: HttpErrorResponse) => {
        if (_error?.status == 401) {
          keycloak.logout().then(() => {
            keycloak.clearToken();
            alertService.openAlertError('Votre session a expiré.');
          });
        }

        if (_error?.status >= 500) {
          alertService.openAlertError('Une erreur est survenue');
        }
      }
    })
  );
};
