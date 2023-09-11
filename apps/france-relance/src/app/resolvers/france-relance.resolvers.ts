import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';
import { SousAxePlanRelance } from '../models/axe.models';
import { FranceRelanceHttpService } from '../services/france-relance.http.service';
import { ResolveFn } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class FranceRelanceResolvers
{
  constructor(private _service: FranceRelanceHttpService) {}

  resolve(): Observable<SousAxePlanRelance[] | Error> {
    return this._service.getSousAxePlanRelance();
  }
}

export const resolveFranceRelance: ResolveFn<SousAxePlanRelance[] | Error> = () => {
  const resolver = inject(FranceRelanceResolvers);
  return resolver.resolve()
}
