import { inject } from '@angular/core';
import { ReferentielsHttpService } from '../../services/referentiels.service';
import { Observable } from 'rxjs';
import { BopModel } from '../../models/refs/bop.models';
import { ReferentielProgrammation } from '../../models/refs/referentiel_programmation.model';

export class BopsReferentielsComponentService {
  private refs = inject(ReferentielsHttpService);

  public filterRefs(
    term: string | null,
    programmes: BopModel[] | null
  ): Observable<ReferentielProgrammation[]> {
    return this.refs.searchReferentielProgrammation(term, programmes);
  }
}
