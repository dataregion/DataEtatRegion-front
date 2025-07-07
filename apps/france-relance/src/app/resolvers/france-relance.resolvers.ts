import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { SousAxePlanRelance } from '../models/axe.models';
import { ResolveFn } from '@angular/router';
import { LaureatHttpService } from '../services/laureat.http.service';

@Injectable({ providedIn: 'root' })
export class FranceRelanceResolvers {
  private _service = inject(LaureatHttpService);


  resolve(): Observable<SousAxePlanRelance[] | Error> {
    return this._service.getSousAxePlanRelance();
  }
}

export const resolveFranceRelance: ResolveFn<SousAxePlanRelance[] | Error> = () => {
  const resolver = inject(FranceRelanceResolvers);
  return resolver.resolve();
};
