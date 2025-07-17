import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn } from '@angular/common/http';
import { AlertService, LoaderService } from 'apps/common-lib/src/public-api';
import { inject } from '@angular/core';
import { finalize, tap } from 'rxjs';


export const budgetHttpInterceptorInterceptor: HttpInterceptorFn = (req, next: HttpHandlerFn) => {

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
        if (_error?.status === 401) {
          alertService.openAlertError('Accès non autorisé');
        }

        if (_error?.status >= 500) {
          alertService.openAlertError('Une erreur est survenue');
        }
      }
    })
  );
};
