import { Injectable, inject } from '@angular/core';
import { GeoModel, TypeLocalisation } from 'apps/common-lib/src/public-api';
import { FormSearch } from './search-data.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PreFilters, TagFieldData } from '@models/search/prefilters.model';
import { ReferentielProgrammation } from '@models/refs/referentiel_programmation.model';
import { Bop } from '@models/search/bop.model';
import { BopModel } from '@models/refs/bop.models';
import { SearchParameters, SearchParamsService, SearchTypeCategorieJuridique } from '@services/search-params.service';
import { BeneficiaireFieldData } from './autocomplete/autocomplete-beneficiaire.service';
import { Beneficiaire } from '@models/search/beneficiaire.model';
import { BudgetDataHttpService } from '@services/http/budget.service';
import { Tag } from '@models/refs/tag.model';
import { SearchDataService } from '@services/search-data.service';

@Injectable({
  providedIn: 'root'
})
export class PrefilterMapperService {

  private _formBuilder: FormBuilder = inject(FormBuilder)
  private _referentielsService: BudgetDataHttpService = inject(BudgetDataHttpService)
  private _searchDataService: SearchDataService = inject(SearchDataService)
  private _searchParamsService: SearchParamsService = inject(SearchParamsService)

  public init: boolean = false
  public themes: string[] = []
  public programmes: Bop[] = []
  public referentiels_programmation: ReferentielProgrammation[] = []
  public annees: number[] = []
  public tags: Tag[] = []

  initService(themes: string[], programmes: Bop[], referentiels_programmation : ReferentielProgrammation[], annees: number[]) {
    this.themes = themes;
    this.programmes = programmes;
    this.referentiels_programmation = referentiels_programmation;
    this.annees = annees;
    this.init = true
    this._referentielsService.allTags$().subscribe((tags: Tag[]) => {
      this.tags = tags
    })
  }

  mapPrefilterToSearchParams(prefilter: PreFilters): SearchParameters | undefined {
    const searchParams = this._searchDataService.searchParams ?? this._searchParamsService.getEmpty()
    searchParams.page = 1
    searchParams.page_size = 100
    searchParams.themes = this._mapThemes(prefilter)
    searchParams.bops = this._mapProgrammes(prefilter)
    searchParams.referentiels_programmation = this._mapReferentielsProgrammation(prefilter)
    searchParams.niveau = this._mapNiveau(prefilter)
    searchParams.locations = this._mapLocalisations(prefilter)
    searchParams.years = this._mapAnnees(prefilter)
    searchParams.beneficiaires = this._mapBeneficiaires(prefilter)
    searchParams.types_beneficiaires = this._mapTypesBeneficiaires(prefilter)
    searchParams.tags = this._mapTags(prefilter)?.map(t => t.item)
    searchParams.domaines_fonctionnels = this._mapDomainesFonctionnels(prefilter)
    searchParams.source_region = this._mapSourcesRegion(prefilter)
    console.log("==> MAP : PreFilters => SearchParameters")
    console.log(prefilter)
    console.log(searchParams)
    return searchParams
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
    return selected as Beneficiaire[];
    // forkJoin(
    //   selected
    //     .map((ref) => ref.siret)
    //     .map((siret) => this._autocompleteBeneficiaires.autocompleteSingleBeneficiaire$(siret))
    // ).subscribe((joined) => {
    //   this.selectedBeneficiaires = joined;
    // });
  }

  private _mapTypesBeneficiaires(pf: PreFilters): SearchTypeCategorieJuridique[] | undefined {
    if (!pf.types_beneficiaires)
      return undefined
    return pf.types_beneficiaires
  }

  private _mapTags(pf: PreFilters): TagFieldData[] | undefined {
    if (!pf.tags)
      return undefined;
    return pf.tags as unknown as TagFieldData[];
  }
  
  private _mapTagsFromSearchParam(tags: string[] | undefined): TagFieldData[] | undefined {
    if (!tags)
      return undefined;
    return tags.length !== this.tags.length ? this.tags.map(t => { return { ...t, item: t.display_name }}) : []
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
