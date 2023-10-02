import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
  HttpContextToken,
} from '@angular/common/http';
import { Observable, finalize, tap } from 'rxjs';
import { AlertService, LoaderService } from 'apps/common-lib/src/public-api';

export const BYPASS_ALERT_INTERCEPTOR = new HttpContextToken<boolean>(() => false)

@Injectable()
export class CommonHttpInterceptor implements HttpInterceptor {
  constructor(
    private _loader: LoaderService,
    private _alertService: AlertService
  ) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    this._loader.startLoader();
    const handler = next.handle(req)
      .pipe(
        finalize(() => {
          setTimeout(() => {
            this._loader.endLoader();
          })
        }));


    const bypass = req.context.get(BYPASS_ALERT_INTERCEPTOR);
    if (bypass)
      return handler;

    return handler.pipe(
      tap({
        error: (_error: HttpErrorResponse) => {
          if (_error?.status >= 500)
            this._alertService.openAlertError('Une erreur est survenue');
        },
      })
    );
  }
}
