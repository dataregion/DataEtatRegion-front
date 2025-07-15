import { JSONObject } from 'apps/common-lib/src/lib/models/jsonobject';
import { Bop, BopCode } from './bop.model';
import { Beneficiaire } from './beneficiaire.model';
import { ReferentielProgrammation } from '@models/refs/referentiel_programmation.model';
import { SearchTypeCategorieJuridique } from '@services/interface-data.service';

export type ThemePreFilter = string | null;
export type BopsPreFilter = Bop | BopCode | null;

import { SelectedData } from 'apps/common-lib/src/lib/components/advanced-chips-multiselect/advanced-chips-multiselect.component';
import { Tag } from '../refs/tag.model';

export type TagFieldData = SelectedData & Tag;

export interface PreFilters {
  theme?: ThemePreFilter | ThemePreFilter[];
  bops?: BopsPreFilter | BopsPreFilter[];
  referentiels_programmation?: ReferentielProgrammation | ReferentielProgrammation[];

  location?: JSONObject[];
  year?: number | number[];

  /** @deprecated ne pas utiliser, uniquement pour retro compatibilité */
  beneficiaire?: Beneficiaire;
  beneficiaires?: Beneficiaire[];

  types_beneficiaires?: SearchTypeCategorieJuridique[];

  tags?: TagFieldData[];

  domaines_fonctionnels?: string[];
  sources_region?: string[];
}
