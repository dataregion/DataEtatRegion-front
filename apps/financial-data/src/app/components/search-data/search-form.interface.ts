import { FormControl } from '@angular/forms';
import { Beneficiaire } from '../../models/search/beneficiaire.model';
import { Bop } from '../../models/search/bop.model';
import { ReferentielProgrammation } from '../../models/refs/referentiel_programmation.model';
import { TypeLocalisation } from 'apps/common-lib/src/lib/models/geo.models';
import { SearchTypeCategorieJuridique } from '../../services/interface-data.service';
import { TagFieldData } from './tags-field-data.model';

export interface SearchForm {
  theme: FormControl<string[] | null>;
  bops: FormControl<Bop[] | null>;
  referentiels_programmation: FormControl<ReferentielProgrammation[] | null>;
  niveau: FormControl<TypeLocalisation | null>;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  location: FormControl<any>;
  year: FormControl<number[] | null>;
  beneficiaires: FormControl<Beneficiaire[] | null>;
  types_beneficiaires: FormControl<SearchTypeCategorieJuridique[] | null>;
  tags: FormControl<TagFieldData[] | null>;
}
