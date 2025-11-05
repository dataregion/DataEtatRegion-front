import { Injectable, inject } from '@angular/core';
import { GeoModel, TypeLocalisation } from 'apps/common-lib/src/public-api';
import { FormSearch } from './search-data.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PreFilters, TagFieldData } from '@models/search/prefilters.model';
import { Bop } from '@models/search/bop.model';
import { SearchParameters, SearchParamsService } from '@services/search-params.service';
import { Beneficiaire } from '@models/search/beneficiaire.model';
import { BudgetDataHttpService } from '@services/http/budget.service';
import { forkJoin, map, mergeMap, Observable, of } from 'rxjs';
import { LoggerService } from 'apps/common-lib/src/lib/services/logger.service';
import { catchError } from 'rxjs/operators';
import { ReferentielProgrammation } from 'apps/common-lib/src/lib/models/refs/referentiel_programmation.model';
import { Tag } from '@models/refs/tag.model';
import { BopModel } from 'apps/common-lib/src/lib/models/refs/bop.models';
import { SearchTypeCategorieJuridique } from 'apps/common-lib/src/lib/models/refs/common.models';
import { AutocompleteBeneficiaireService, BeneficiaireFieldData } from 'apps/appcommon/src/lib/autocomplete/autocomplete-beneficiaire.service';

@Injectable({
  providedIn: 'root'
})
export class PrefilterMapperService {

  private logger = inject(LoggerService).getLogger(PrefilterMapperService.name);

  private _formBuilder: FormBuilder = inject(FormBuilder)
  private _referentielsService: BudgetDataHttpService = inject(BudgetDataHttpService)
  private _searchParamsService: SearchParamsService = inject(SearchParamsService)
  private _autocompleteBeneficiaireService: AutocompleteBeneficiaireService = inject(AutocompleteBeneficiaireService)

  public init: boolean = false
  public themes: string[] = []
  public programmes: Bop[] = []
  public referentiels_programmation: ReferentielProgrammation[] = []
  public annees: number[] = []
  public allTags: Tag[] = []

  initService(themes: string[], programmes: Bop[], referentiels_programmation : ReferentielProgrammation[], annees: number[]) {
    this.themes = themes;
    this.programmes = programmes;
    this.referentiels_programmation = referentiels_programmation;
    this.annees = annees;
    this.init = true
    this._referentielsService.allTags$().subscribe((tags: Tag[]) => {
      this.allTags = tags
    })
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
    const searchParams = this._searchParamsService.getEmpty()
    const newSearchParam = {
      ...searchParams,
    }
    newSearchParam.page = 1
    newSearchParam.page_size = 100
    newSearchParam.themes = this._mapThemes(prefilter)
    newSearchParam.bops = this._mapProgrammes(prefilter)
    newSearchParam.referentiels_programmation = this._mapReferentielsProgrammation(prefilter)
    newSearchParam.niveau = this._mapNiveau(prefilter)
    newSearchParam.locations = this._mapLocalisations(prefilter)
    newSearchParam.years = this._mapAnnees(prefilter)
    newSearchParam.beneficiaires = this._mapBeneficiaires(prefilter)
    newSearchParam.types_beneficiaires = this._mapTypesBeneficiaires(prefilter)
    newSearchParam.tags = this._mapTags(prefilter)?.map(t => t.value ? t.type + ':' + t.value : t.type)
    newSearchParam.domaines_fonctionnels = this._mapDomainesFonctionnels(prefilter)
    newSearchParam.source_region = this._mapSourcesRegion(prefilter)

    this.logger.debug("==> MAP : PreFilters => SearchParameters", prefilter, searchParams);

    return newSearchParam
  }

  mapSearchParamsToForm(params: SearchParameters): FormGroup<FormSearch> {
    return this._formBuilder.group({
      themes: this._formBuilder.control(params.themes ?? null),
      programmes: this._formBuilder.control(params.bops ?? null),
      referentiels_programmation: this._formBuilder.control(params.referentiels_programmation ?? null),
      niveau: this._formBuilder.control(params.niveau ?? null),
      localisations: this._formBuilder.control(params.locations ?? null),
      annees: this._formBuilder.control(params.years ?? null),
      beneficiaires: this._formBuilder.control(params.beneficiaires ?? null),
      types_beneficiaires: this._formBuilder.control(params.types_beneficiaires ?? null),
      tags: this._formBuilder.control(this._mapTagsFromSearchParam(params.tags) ?? null),
      domaines_fonctionnels: this._formBuilder.control(params.domaines_fonctionnels ?? null),
      sources_region: this._formBuilder.control(params.source_region ?? null),
    });
  }

  private _mapThemes(pf: PreFilters): string[] | undefined {
    if (!pf.theme)
      return undefined;
    const pfThemes: string[] = Array.isArray(pf.theme) ? (pf.theme as string[]) : ([pf.theme] as string[])
    return this.themes?.filter((theme) => pfThemes.findIndex(t => t === theme) !== -1);
  }

  private _mapProgrammes(pf: PreFilters): BopModel[] | undefined {
    if (!pf.bops)
      return undefined;
    const programmes = pf.bops as unknown as BopModel[];
    const bopSelect = this.programmes?.filter(
      (bop) => programmes.findIndex((bopFilter) => bop.code === bopFilter.code) !== -1
    );
    return bopSelect ?? undefined;
  }

  private _mapReferentielsProgrammation(pf: PreFilters): ReferentielProgrammation[] | undefined {
    if (!pf.referentiels_programmation)
      return undefined;
    return pf.referentiels_programmation as ReferentielProgrammation[];
  }

  private _mapNiveau(pf: PreFilters): TypeLocalisation | undefined {
    return pf.location != null
      ? (this._mapLocalisations(pf)?.map((gm) => gm.type)[0] as TypeLocalisation)
      : undefined
  }

  private _mapLocalisations(pf: PreFilters): GeoModel[] | undefined {
    return pf.location as unknown as GeoModel[]
  }

  private _mapAnnees(pf: PreFilters): number[] | undefined {
    if (!pf.year)
      return undefined
    return Array.isArray(pf.year) ? pf.year : [pf.year];
  }

  private _mapBeneficiaires(pf: PreFilters): Beneficiaire[] | undefined {
    if (!pf.beneficiaires && !pf.beneficiaire)
      return undefined;
    let selected: BeneficiaireFieldData[] = [] 
    if (pf.beneficiaires)
      selected = pf.beneficiaires as BeneficiaireFieldData[];
    else if (pf.beneficiaire)
      selected = [pf.beneficiaire as BeneficiaireFieldData];

    const mappedSelected = selected.map(benef => {
      return {
        ...benef,
        item: benef.siret,
      }
    })

    return mappedSelected;
  }

  private _mapTypesBeneficiaires(pf: PreFilters): SearchTypeCategorieJuridique[] | undefined {
    if (!pf.types_beneficiaires)
      return undefined
    return pf.types_beneficiaires
  }

  private _mapTags(pf: PreFilters): TagFieldData[] | undefined {
    if (!pf.tags || pf.tags.length === 0)
      return undefined;
    return this.allTags.filter(t => {
      return pf.tags?.map(t => t.toString()).includes(t.value ? t.type + ':' + t.value : t.type)
    }).map(t => { return { ...t, item: t.display_name }})
  }
  
  private _mapTagsFromSearchParam(tags: string[] | undefined): TagFieldData[] | undefined {
    if (!tags || tags.length === 0)
      return undefined;
    return this.allTags.filter(t => {
      return tags.includes(t.value ? t.type + ':' + t.value : t.type)
    }).map(t => { return { ...t, item: t.display_name }})
  }


  private _mapDomainesFonctionnels(pf: PreFilters): string[] | undefined {
    if (!pf.domaines_fonctionnels)
      return undefined
    return pf.domaines_fonctionnels
  }

  private _mapSourcesRegion(pf: PreFilters): string[] | undefined {
    if (!pf.sources_region)
      return undefined
    return pf.sources_region
  }

}
