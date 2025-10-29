import { Injectable, inject } from '@angular/core';
import { GeoModel, TypeLocalisation } from 'apps/common-lib/src/public-api';
import { FormSearch } from './search-data.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PreFilters } from '../../../models/search/prefilters.model';
import { SearchParameters, SearchParamsService, SearchTypeCategorieJuridique } from '../../../services/search-params.service';
import { AutocompleteBeneficiaireService } from './autocomplete/autocomplete-beneficiaire.service';
import { SearchDataService } from '../../../services/search-data.service';
import { forkJoin, map, mergeMap, Observable, of } from 'rxjs';
import { LoggerService } from 'apps/common-lib/src/lib/services/logger.service';
import { catchError } from 'rxjs/operators';
import { CentreCouts } from '../../../models/financial/common.models';
import { RefSiret } from 'apps/common-lib/src/lib/models/refs/RefSiret';
import { ThemeModel } from '../../../models/refs/bop.models';
import { RefQpvWithCommune } from '../../../models/refs/qpv.model';

@Injectable({
  providedIn: 'root'
})
export class PrefilterMapperService {

  private logger = inject(LoggerService).getLogger(PrefilterMapperService.name);

  private _formBuilder: FormBuilder = inject(FormBuilder)
  private _searchDataService: SearchDataService = inject(SearchDataService)
  private _searchParamsService: SearchParamsService = inject(SearchParamsService)
  private _autocompleteBeneficiaireService: AutocompleteBeneficiaireService = inject(AutocompleteBeneficiaireService)

  public init: boolean = false
  public themes: ThemeModel[] = []
  public annees: number[] = []

  initService(annees: number[], themes: ThemeModel[]) {
    this.annees = annees;
    this.themes = themes;
    this.init = true
  }

  mapAndResolvePrefiltersToSearchParams$(prefilter: PreFilters): Observable<SearchParameters | undefined> {
    const res$ = 
      of(this.mapPrefilterToSearchParams(prefilter))
        .pipe(
          mergeMap(searchParams => {
            const benefs = searchParams?.beneficiaires ?? []
            if (benefs.length === 0)
              return of(searchParams)
            
            // Pour chaque bénéficiaire, on fait un appel pour récupérer les infos complètes
            const arrAutoComplete$ = benefs
              .map(b => this._autocompleteBeneficiaireService.autocompleteSingleBeneficiaire$(b.siret));

            const resolvedBenefsFilter$ = 
              forkJoin(arrAutoComplete$)
                .pipe(
                  map(benefs => {
                    const resolved = {
                      ...searchParams,
                      beneficiaires: benefs
                    } as SearchParameters
                    return resolved
                  }),
                  catchError(error => {
                    this.logger.error("Erreur lors de la résolution des bénéficiaires", error, prefilter);
                    return of(searchParams);
                  })
                )
            
            return resolvedBenefsFilter$;
          }
        )
      )
    return res$;
  }

  private mapPrefilterToSearchParams(prefilter: PreFilters): SearchParameters | undefined {
    const searchParams = this._searchDataService.searchParams() ?? this._searchParamsService.getEmpty()
    const newSearchParam = {
      ...searchParams,
    }
    newSearchParam.page = 1
    newSearchParam.page_size = 100
    newSearchParam.years = this._mapAnnees(prefilter)
    newSearchParam.niveau = this._mapNiveau(prefilter)
    newSearchParam.locations = this._mapLocalisations(prefilter)
    newSearchParam.code_qpv = this._mapQpv(prefilter)
    newSearchParam.centres_couts = this._mapFinanceurs(prefilter)
    newSearchParam.themes = this._mapThematiques(prefilter)
    newSearchParam.beneficiaires = this._mapPorteurs(prefilter)
    newSearchParam.types_beneficiaires = this._mapTypesPorteur(prefilter)
    this.logger.debug("==> MAP : PreFilters => SearchParameters", prefilter, searchParams);

    return newSearchParam
  }

  mapSearchParamsToForm(params: SearchParameters): FormGroup<FormSearch> {
    return this._formBuilder.group({
      annees: this._formBuilder.control(params.years ?? null),
      niveau: this._formBuilder.control(params.niveau ?? null),
      localisations: this._formBuilder.control(params.locations ?? null),
      qpv: this._formBuilder.control(params.code_qpv ?? null),
      financeurs: this._formBuilder.control(params.centres_couts ?? null),
      thematiques: this._formBuilder.control(params.themes ?? null),
      porteurs: this._formBuilder.control(params.beneficiaires ?? null),
      types_porteur: this._formBuilder.control(params.types_beneficiaires ?? null),
    });
  }

  private _mapAnnees(pf: PreFilters): number[] | undefined {
    if (!pf.annees)
      return undefined
    return Array.isArray(pf.annees) ? pf.annees : [pf.annees];
  }

  private _mapNiveau(pf: PreFilters): TypeLocalisation | undefined {
    return pf.localisation != null
      ? (this._mapLocalisations(pf)?.map((gm) => gm.type)[0] as TypeLocalisation)
      : undefined
  }

  private _mapLocalisations(pf: PreFilters): GeoModel[] | undefined {
    return pf.localisation as unknown as GeoModel[]
  }

  private _mapQpv(pf: PreFilters): RefQpvWithCommune[] | undefined {
    return pf.qpv as unknown as RefQpvWithCommune[]
  }

  private _mapFinanceurs(pf: PreFilters): CentreCouts[] | undefined {
    if (!pf.porteurs)
      return undefined;
    return pf.porteurs as unknown as CentreCouts[];
  }

  private _mapThematiques(pf: PreFilters): ThemeModel[] | undefined {
    if (!pf.thematiques)
      return undefined;
    const pfThemes: ThemeModel[] = pf.thematiques as unknown as ThemeModel[]
    return this.themes?.filter((theme) => pfThemes.findIndex(t => t === theme) !== -1);
  }

  private _mapPorteurs(pf: PreFilters): RefSiret[] | undefined {
    if (!pf.porteurs)
      return undefined;
    const selected: RefSiret[] = pf.porteurs as unknown as RefSiret[];
    const mappedSelected = selected.map(benef => {
      return {
        ...benef,
        item: benef.siret,
      }
    })
    return mappedSelected;
  }

  private _mapTypesPorteur(pf: PreFilters): SearchTypeCategorieJuridique[] | undefined {
    if (!pf.types_porteur)
      return undefined
    return pf.types_porteur as unknown as SearchTypeCategorieJuridique[]
  }

}
