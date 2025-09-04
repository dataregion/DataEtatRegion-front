import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  filter,
  finalize,
  Observable,
  of,
  startWith,
  switchMap,
  tap
} from 'rxjs';
import { GeoModel, TypeLocalisation } from 'apps/common-lib/src/public-api';
import { MarqueBlancheParsedParamsResolverModel } from '../../../resolvers/marqueblanche-parsed-params.resolver';
import { BeneficiaireFieldData } from './autocomplete/autocomplete-beneficiaire.service';
import { AutocompleteBeneficiaireService } from './autocomplete/autocomplete-beneficiaire.service';
import { AdvancedChipsMultiselectComponent, SelectedData } from 'apps/common-lib/src/lib/components/advanced-chips-multiselect/advanced-chips-multiselect.component';
import { TagFieldData } from './autocomplete/autocomplete-tags.service';
import { AutocompleteTagsService } from './autocomplete/autocomplete-tags.service';
import { LoggerService } from 'apps/common-lib/src/lib/services/logger.service';
import { BopModel } from '../../../models/refs/bop.models';
import { ReferentielProgrammation } from '../../../models/refs/referentiel_programmation.model';
import { OtherTypeCategorieJuridique, SearchParameters, SearchParamsService, SearchTypeCategorieJuridique } from '../../../services/search-params.service';
import { TypeCategorieJuridique } from '../../../models/financial/common.models';
import { Beneficiaire } from '../../../models/search/beneficiaire.model';
import { Bop } from '../../../models/search/bop.model';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { SelectMultipleComponent } from 'apps/common-lib/src/lib/components/select-multiple/select-multiple.component';
import { LocalisationComponent } from 'apps/common-lib/src/lib/components/localisation/localisation.component';
import { BopsReferentielsComponent } from 'apps/common-lib/src/lib/components/bops-referentiels/bops-referentiels.component';
import { FinancialDataResolverModel } from '../../../models/financial/financial-data-resolvers.models';
import { MatButtonModule } from '@angular/material/button';
import { tag_fullname } from '@models/refs/tag.model';
import { PrefilterMapperService } from './prefilter-mapper.services';
import { PreferenceService } from '@services/preference.service';
import { SearchDataService } from '@services/search-data.service';
import { GroupedData, LignesResponse } from 'apps/clients/v3/financial-data';
import { ColonnesService } from '@services/colonnes.service';
import { FinancialDataModel } from '@models/financial/financial-data.models';

/**
 * Interface du formulaire de recherche
 */
export interface FormSearch {
  themes: FormControl<string[] | null>;
  programmes: FormControl<Bop[] | null>;
  referentiels_programmation: FormControl<ReferentielProgrammation[] | null>;
  niveau: FormControl<TypeLocalisation | null>;
  localisations: FormControl<GeoModel[] | null>;
  annees: FormControl<number[] | null>;
  beneficiaires: FormControl<Beneficiaire[] | null>;
  types_beneficiaires: FormControl<SearchTypeCategorieJuridique[] | null>;
  tags: FormControl<TagFieldData[] | null>;
  domaines_fonctionnels: FormControl<string[] | null>;
  sources_region: FormControl<string[] | null>;
}

@Component({
  selector: 'budget-search-data',
  templateUrl: './search-data.component.html',
  styleUrls: ['./search-data.component.scss'],
  providers: [AutocompleteBeneficiaireService, AutocompleteTagsService],
  imports: [MatIconModule, ReactiveFormsModule,MatButtonModule, CommonModule, BopsReferentielsComponent,AdvancedChipsMultiselectComponent, LocalisationComponent, SelectMultipleComponent]
})
export class SearchDataComponent implements OnInit {

  private _route = inject(ActivatedRoute);
  private _preferenceService = inject(PreferenceService)
  private _prefilterMapperService = inject(PrefilterMapperService);
  private _searchDataService = inject(SearchDataService);
  private _searchParamsService = inject(SearchParamsService);
  private _logger = inject(LoggerService);
  private _autocompleteBeneficiaires = inject(AutocompleteBeneficiaireService);
  private _autocompleteTags = inject(AutocompleteTagsService);
  private _colonnesService = inject(ColonnesService)

  /**
   * Formulaire de recherche
   */
  public formSearch: FormGroup<FormSearch> = new FormGroup<FormSearch>({
    themes: new FormControl<string[] | null>(null),
    programmes: new FormControl<Bop[] | null>(null),
    referentiels_programmation: new FormControl<ReferentielProgrammation[] | null>(null),
    niveau: new FormControl<TypeLocalisation | null>(null),
    localisations: new FormControl<GeoModel[] | null>([]),
    annees: new FormControl<number[] | null>(null, {
      validators: [Validators.min(2000), Validators.max(new Date().getFullYear())]
    }),
    beneficiaires: new FormControl<Beneficiaire[] | null>(null),
    types_beneficiaires: new FormControl<SearchTypeCategorieJuridique[] | null>(null),
    tags: new FormControl<TagFieldData[] | null>(null),
    domaines_fonctionnels: new FormControl<string[] | null>(null),
    sources_region: new FormControl<string[] | null>(null),
  });

  public bops: BopModel[] = [];
  public themes: string[] = [];
  public annees: number[] = [];
  public filteredBops: BopModel[] = [];
  public filteredReferentiels: ReferentielProgrammation[] = [];

  /**
   * Thèmes, Programmes, Référentiels programmation
   */
  get selectedThemes(): string[] | null {
    return this.formSearch.controls.themes.value ?? null;
  }
  set selectedThemes(data: string[] | null) {
    this.formSearch.controls.themes.setValue(data ?? null);
  }
  get selectedBops(): Bop[] | null {
    return this.formSearch.controls.programmes.value ?? null;
  }
  set selectedBops(data: Bop[] | null) {
    this.formSearch.controls.programmes.setValue(data ?? null);
  }
  get selectedReferentiels(): ReferentielProgrammation[] | null {
    return this.formSearch.controls.referentiels_programmation.value ?? null;
  }
  set selectedReferentiels(data: ReferentielProgrammation[] | null) {
    this.formSearch.controls.referentiels_programmation.setValue(data ?? null);
  }

  /**
   * Localisations
   */
  get selectedNiveau(): TypeLocalisation | null {
    return this.formSearch.controls.niveau.value ?? null;
  }
  set selectedNiveau(data: TypeLocalisation | null) {
    this.formSearch.controls.niveau.setValue(data ?? null);
  }
  get selectedLocation(): GeoModel[] | null {
    return this.formSearch.controls.localisations.value ?? null;
  }
  set selectedLocation(data: GeoModel[] | null) {
    this.formSearch.controls.localisations.setValue(data ?? null);
  }

  /**
   * Années
   */
  get selectedYear(): number[] | null {
    const annees = this.formSearch.controls.annees.value;
    return annees && annees.length != 0 ? annees : null;
  }
  set selectedYear(data: number[] | null) {
    this.formSearch.controls.annees.setValue(data ?? null);
  }


  get selectedTypesBenef(): SearchTypeCategorieJuridique[] | null {
    return this.formSearch.controls.types_beneficiaires.value ?? null;
  }
  set selectedTypesBenef(data: SearchTypeCategorieJuridique[] | null) {
    this.formSearch.controls.types_beneficiaires.setValue(data ?? null);
  }
  public typesBenef: SearchTypeCategorieJuridique[] = [
    TypeCategorieJuridique.COLLECTIVITE,
    TypeCategorieJuridique.ASSOCIATION,
    TypeCategorieJuridique.ENTREPRISE,
    TypeCategorieJuridique.ETAT,
    OtherTypeCategorieJuridique.AUTRES
  ];
  private _prettyTypes = new Map<SearchTypeCategorieJuridique, string>([
    [TypeCategorieJuridique.ETAT, 'État'],
    [OtherTypeCategorieJuridique.AUTRES, 'Autres']
  ]);
  public renderTypesBenefOption = (t: SearchTypeCategorieJuridique): string => {
    const type: string | undefined = this._prettyTypes.has(t) ? this._prettyTypes.get(t) : t;
    return type ? type.charAt(0).toUpperCase() + type.slice(1) : '';
  };
  public renderTypesBenefLabel = (types: SearchTypeCategorieJuridique[]) => {
    return types?.map((t) => (this._prettyTypes.has(t) ? this._prettyTypes.get(t) : t)).join(', ');
  };

  /**
   * Beneficiaires
   */
  get selectedBeneficiaires(): BeneficiaireFieldData[] {
    return this.formSearch.get('beneficiaires')?.value as BeneficiaireFieldData[];
  }

  set selectedBeneficiaires(data: SelectedData[]) {
    this.formSearch.get('beneficiaires')?.setValue(data as BeneficiaireFieldData[]);
  }

  public filteredBeneficiaire$: Observable<BeneficiaireFieldData[]> = of([]);

  public get beneficiaireFieldOptions$(): Observable<BeneficiaireFieldData[]> {
    return this.filteredBeneficiaire$;
  }

  public beneficiaireInputChange$ = new BehaviorSubject<string>('');

  public onBeneficiaireInputChange(v: string) {
    this.beneficiaireInputChange$.next(v);
  }


  /**
   * Tags
   */
  public get selectedTags(): TagFieldData[] {
    return this.formSearch.get('tags')?.value as TagFieldData[];
  }

  public set selectedTags(value: SelectedData[]) {
    this.formSearch.get('tags')?.setValue(value as TagFieldData[]);
  }

  public _filteredTags$: Observable<TagFieldData[]> = of([]);

  public get tagsFieldOptions$(): Observable<TagFieldData[]> {
    return this._filteredTags$;
  }

  public tagsInputChange$ = new BehaviorSubject<string>('');

  public onTagInputChange(v: string) {
    this.tagsInputChange$.next(v);
  }


  get searchFinish() {
    return this._searchDataService.searchFinish
  }

  ngOnInit(): void {
    // Subscribe pour l'autocomplete des beneficiaires
    this.filteredBeneficiaire$ = this.beneficiaireInputChange$.pipe(
      startWith(''),
      debounceTime(300),
      switchMap((value) => {
        if (!value || value.length <= 3)
          return of([]);
        return this._autocompleteBeneficiaires.autocomplete$(value);
      })
    );
    // Subscribe pour l'autocomplete des tags
    this._filteredTags$ = this.tagsInputChange$.pipe(
      startWith(''),
      debounceTime(300),
      switchMap((value) => {
        const term = value || '';
        if (term && term?.length < 1)
          return of([]);
        return this._autocompleteTags.autocomplete$(term);
      })
    );

    // Resolve des référentiels et de la marque blanche
    const resolvedFinancial = this._route.snapshot.data['financial'] as FinancialDataResolverModel;
    const resolvedMarqueBlanche = this._route.snapshot.data['mb_parsed_params'] as MarqueBlancheParsedParamsResolverModel;
    
    // Sauvegarde des référentiels dans les listes
    this.themes = resolvedFinancial.data?.themes ?? [];
    this.bops = resolvedFinancial.data?.bop ?? [];
    this.filteredBops = this.bops ?? []
    this.filteredReferentiels = resolvedFinancial.data?.referentiels_programmation ?? [];
    this.annees = resolvedFinancial.data?.annees ?? [];

    // Création d'un prefilter avec la marque blanche
    const mb_hasParams = resolvedMarqueBlanche.data?.has_marqueblanche_params;
    const mb_prefilter = resolvedMarqueBlanche.data?.preFilters;
    this._preferenceService.currentPrefilter = mb_prefilter ?? null

    if (mb_hasParams) {
      this._logger.debug(`Mode marque blanche actif.`);
      if (mb_prefilter) {
        this._logger.debug(`Application des filtres`);
        this._preferenceService.currentPrefilter = mb_prefilter;
        // Mapping du prefilter vers le formulaire
        this._searchDataService.searchParams = this._prefilterMapperService.mapPrefilterToSearchParams(mb_prefilter)
      }
    }

    // Subscribe sur les paramètres de la recherche pour lancer la recherche
    this._searchDataService.searchParams$
      .pipe(
        filter((params): params is SearchParameters => !!params),
        tap(params => {
          this._searchDataService.searchResults = []
          this.formSearch = this._prefilterMapperService.mapSearchParamsToForm(params);
        }),
        switchMap(params => 
          this._searchDataService.search(params).pipe(
            finalize(() => {
              this._searchDataService.searchFinish = true;
              this._searchDataService.searchInProgress = false;
            })
          )
        ),
      )
      .subscribe({
        next: (response: LignesResponse) => {
          console.log("==> Résultat de la recherche");
          console.log(response);
          if (response.code == 204 && !response.data) {
            this._searchDataService.searchResults = []
            return
          }
          if (response.data?.type === 'groupings') {
            const newData = response.data?.groupings as GroupedData[]
            // Si page = 1, on reset, sinon on concat
            this._searchDataService.searchResults = response.pagination?.current_page == 1
              ? newData
              : (this._searchDataService.searchResults as GroupedData[]).concat(newData);
          } else if (response.data?.type === 'lignes_financieres') {
            const newData = response.data?.lignes.map(r => this._searchDataService.unflatten(r)) ?? []
            // Si page = 1, on reset, sinon on concat
            this._searchDataService.searchResults = response.pagination?.current_page == 1
              ? newData
              : (this._searchDataService.searchResults as FinancialDataModel[]).concat(newData);
          }
          this._searchDataService.total = response.data?.total;
          this._searchDataService.pagination = response.pagination;
        },
        error: (err: unknown) => {
          console.error("Erreur lors de la recherche :", err);
        }
      });
      

    // On subscribe également le changement des colonnes de tableau ou de grouping sélectionnées
    combineLatest([
      this._colonnesService.selectedColonnesTable$,
      this._colonnesService.selectedColonnesGrouping$,
    ])
    .subscribe(([tableCols, groupingCols]) => {
      const currentParams = this._searchDataService.searchParams
      if (!currentParams)
        return;
      this._searchDataService.searchParams = {
        ...currentParams,
        colonnes: tableCols.map(c => c.back.map(b => b.code)).flat().filter(c => c !== undefined && c !== null),
        grouping: groupingCols.map(c => c.grouping?.code).filter(c => c !== undefined && c !== null) ?? undefined,
        grouped: []
      };
      if (this._searchDataService.searchParams.grouping?.length === 0) {
        this._searchDataService.searchParams.grouping = undefined
      }
    });
  }

  /**
   * Retourne le ValidationErrors benefOrBopRequired
   */
  public get errorsBenefOrBop(): ValidationErrors | null {
    return this.formSearch.errors != null ? this.formSearch.errors['benefOrBopRequired'] : null;
  }

  // TODO : Accent thème
  public doSearch(): void {
    // Récupération des infos du formulaire
    const formValue = this.formSearch.value;
    const search_parameters: SearchParameters = {
      ...this._searchParamsService.getEmpty(),
      themes: formValue.themes || undefined,
      bops: formValue.programmes || undefined,
      referentiels_programmation: formValue.referentiels_programmation || undefined,
      niveau: formValue.niveau || undefined,
      locations: formValue.localisations || undefined,
      years: formValue.annees || undefined,
      beneficiaires: formValue.beneficiaires || undefined,
      types_beneficiaires: formValue.types_beneficiaires || undefined,
      tags: formValue.tags?.map((tag) => tag_fullname(tag)) ?? undefined,
      domaines_fonctionnels: formValue.domaines_fonctionnels || undefined,
      source_region: formValue.sources_region || undefined,
      grouping: this._colonnesService.selectedColonnesGrouping.map(c => c.label),
      grouped: this._colonnesService.selectedColonnesGrouped
    };
    // Set des paramètres qui trigger la recherche
    this._searchDataService.searchParams = search_parameters
  }

  /**
   * Reset du formulaire
   */
  public reset(): void {
    this._searchDataService.searchInProgress = false;
    this.formSearch.reset();
  }

}
