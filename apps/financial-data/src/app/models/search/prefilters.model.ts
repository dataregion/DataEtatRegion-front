import { JSONObject } from "apps/preference-users/src/lib/models/preference.models"
import { Bop, BopCode } from "./bop.model"
import { Beneficiaire } from "./beneficiaire.model"
import { TagFieldData } from "../../components/search-data/tags-field-data.model"
import { SearchTypeCategorieJuridique } from "apps/common-lib/src/public-api"

export type ThemePreFilter =  string | null
export type BopsPreFilter = Bop | BopCode | null

export interface PreFilters {
  year?: number | number[]

  theme?: ThemePreFilter | ThemePreFilter[]
  bops?: BopsPreFilter | BopsPreFilter[]

  location?: JSONObject[]
  /** @deprecated ne pas utiliser, uniquement pour retro compatibilité */
  beneficiaire?: Beneficiaire
  beneficiaires?: Beneficiaire[]

  types_beneficiaires?: SearchTypeCategorieJuridique[]

  tags?: TagFieldData[]

  domaines_fonctionnels?: string[]
  referentiels_programmation?: string[]
  sources_region?: string[]
}
