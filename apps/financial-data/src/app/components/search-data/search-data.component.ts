import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Data } from '@angular/router';
import {
  switchMap,
  of,
  startWith,
  Observable,
  finalize,
  BehaviorSubject,
  debounceTime,
  Subscription,
  forkJoin,
} from 'rxjs';
import { BopModel } from '@models/refs/bop.models';
import { FinancialData, FinancialDataResolverModel } from '@models/financial/financial-data-resolvers.models';
import { FinancialDataModel } from '@models/financial/financial-data.models';
import {
  Preference,
} from 'apps/preference-users/src/lib/models/preference.models';
import { JSONObject } from "apps/common-lib/src/lib/models/jsonobject";
import {
  AlertService,
  GeoModel,
  TypeLocalisation,
} from 'apps/common-lib/src/public-api';
import { Bop } from '@models/search/bop.model';
import { ReferentielProgrammation } from '@models/refs/referentiel_programmation.model';
import { BudgetService } from '@services/budget.service';
import { NGXLogger } from 'ngx-logger';
import { PreFilters } from '@models/search/prefilters.model';
import { MarqueBlancheParsedParamsResolverModel } from '../../resolvers/marqueblanche-parsed-params.resolver';
import { AdditionalSearchParameters, empty_additional_searchparams } from './additional-searchparams';
import { BeneficiaireFieldData } from './beneficiaire-field-data.model';
import { SearchForm } from './search-form.interface';
import { AutocompleteBeneficiaireService } from './autocomplete-beneficiaire.service';
import { SelectedData } from 'apps/common-lib/src/lib/components/advanced-chips-multiselect/advanced-chips-multiselect.component';
import { Beneficiaire } from '@models/search/beneficiaire.model';
import { TagFieldData } from './tags-field-data.model';
import { AutocompleteTagsService } from './autocomplete-tags.service';
import { TypeCategorieJuridique } from '@models/financial/common.models';
import { tag_fullname } from '@models/refs/tag.model';
import { AutocompleteRefProgrammationService } from './autocomplete-ref-programmation.service';
import { OtherTypeCategorieJuridique, SearchParameters, SearchParameters_empty, SearchTypeCategorieJuridique } from '@services/interface-data.service';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'financial-search-data',
  templateUrl: './search-data.component.html',
  styleUrls: ['./search-data.component.scss'],
  providers: [
    AutocompleteBeneficiaireService,
    AutocompleteTagsService,
  ]
})
export class SearchDataComponent implements OnInit, AfterViewInit {
  public readonly TypeLocalisation = TypeLocalisation;

  public searchForm!: FormGroup<SearchForm>;


  public additional_searchparams: AdditionalSearchParameters = empty_additional_searchparams;

  public bops: BopModel[] = [];
  public themes: string[] = [];
  public annees: number[] = [];
  public filteredBops: BopModel[] | null = null;
  public filteredReferentiels: ReferentielProgrammation[] | null = null;

  /**
   * Thèmes, Programmes, Référentiels programmation
   */
  get selectedThemes() : string[] | null {
    return this.searchForm.get('theme')?.value ?? null;
  }
  set selectedThemes(data: string[] | null) {
    this.searchForm.get('theme')?.setValue(data ?? null);
  }
  get selectedBops() : BopModel[] | null {
    return this.searchForm.get('bops')?.value ?? null;
  }
  set selectedBops(data: BopModel[] | null) {
    this.searchForm.get('bops')?.setValue(data ?? null);
  }
  get selectedReferentiels() : ReferentielProgrammation[] | null {
    return this.searchForm.get('referentiels_programmation')?.value ?? null;
  }
  set selectedReferentiels(data: ReferentielProgrammation[] | null) {
    this.searchForm.get('referentiels_programmation')?.setValue(data ?? null);
  }

  /**
   * Localisations
   */
  get selectedNiveau() : TypeLocalisation | null {
    return this.searchForm.get('niveau')?.value ?? null;
  }
  set selectedNiveau(data: TypeLocalisation | null) {
    this.searchForm.get('niveau')?.setValue(data ?? null);
  }
  get selectedLocation() : GeoModel[] | null {
    return this.searchForm.get('location')?.value ?? null;
  }
  set selectedLocation(data: GeoModel[] | null) {
    this.searchForm.get('location')?.setValue(data ?? null);
  }

  /**
   * Années
   */
  get selectedYear() : number[] | null {
    const annees = this.searchForm.get('year')?.value;
    return annees && annees.length != 0 ? annees : null;
  }
  set selectedYear(data: number[] | null) {
    this.searchForm.get('year')?.setValue(data ?? null);
  }

  /**
   * Type bénéficiaire
   */
  public typesBenef: SearchTypeCategorieJuridique[] = [
    TypeCategorieJuridique.COLLECTIVITE,
    TypeCategorieJuridique.ASSOCIATION,
    TypeCategorieJuridique.ENTREPRISE,
    TypeCategorieJuridique.ETAT,
    OtherTypeCategorieJuridique.AUTRES,
  ]
  private _prettyTypes = new Map<SearchTypeCategorieJuridique, string>([
    [TypeCategorieJuridique.ETAT, "État"],
    [OtherTypeCategorieJuridique.AUTRES, "Autres"]
  ]);
  get selectedTypesBenef() : SearchTypeCategorieJuridique[] | null {
    return this.searchForm.get('types_beneficiaires')?.value ?? null;
  }
  set selectedTypesBenef(data: SearchTypeCategorieJuridique[] | null) {
    this.searchForm.get('types_beneficiaires')?.setValue(data ?? null);
  }
  public renderTypesBenefOption = (t: SearchTypeCategorieJuridique): string => {
    const type: string | undefined = this._prettyTypes.has(t) ? this._prettyTypes.get(t) : t;
    return type ? type.charAt(0).toUpperCase() + type.slice(1) : ""
  }
  public renderTypesBenefLabel = (types: SearchTypeCategorieJuridique[]) => {
    return types?.map(t => this._prettyTypes.has(t) ? this._prettyTypes.get(t) : t).join(', ')
  }

  /**
   * Beneficiaires
   */
  get selectedBeneficiaires() : BeneficiaireFieldData[] {
    return this.searchForm.get('beneficiaires')?.value as BeneficiaireFieldData[];
  }
  set selectedBeneficiaires(data: SelectedData[]) {
    this.searchForm.get('beneficiaires')?.setValue(data as BeneficiaireFieldData[]);
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
    return this.searchForm.get('tags')?.value as TagFieldData[]
  }
  public set selectedTags(value: SelectedData[]) {
    this.searchForm.get('tags')?.setValue(value as TagFieldData[])
  }
  public _filteredTags$: Observable<TagFieldData[]> = of([]);
  public get tagsFieldOptions$(): Observable<TagFieldData[]> {
    return this._filteredTags$;
  }
  public tagsInputChange$ = new BehaviorSubject<string>('');
  public onTagInputChange(v: string) {
    this.tagsInputChange$.next(v);
  }

  /**
   * Indique si la recherche a été effectué
   */
  public searchFinish = false;

  /**
   * Indique si la recherche est en cours
   */
  public searchInProgress = new BehaviorSubject(false);

  /**
   * Affiche une erreur
   */
  public displayError = false;
  public error: Error | any | null = null;

  /**
   * Resultats de la recherche.
   */
  @Output() searchResultsEventEmitter = new EventEmitter<FinancialDataModel[]>();

  /**
   * Les donnees de la recherche
   */
  private _searchResult: FinancialDataModel[] | null = null;
  searchResult(): FinancialDataModel[] | null {
    return this._searchResult;
  }

  /**
   * Resultats de la recherche.
   */
  @Output() currentFilter = new EventEmitter<Preference>();

  @Input() public set preFilter(value: PreFilters | undefined) {
    try {
      this._apply_prefilters(value);
    } catch(e) {
      this.displayError = true;
      this.error = e;
    }
  }

  constructor(
    private _route: ActivatedRoute,
    private _alertService: AlertService,
    private _budgetService: BudgetService,
    private _logger: NGXLogger,
    private _autocompleteBeneficiaires: AutocompleteBeneficiaireService,
    private _autocompleteTags: AutocompleteTagsService,
    private _autocompleteReferentiels: AutocompleteRefProgrammationService,
  ) {
    // Formulaire avc champs déclarés dans l'ordre
    this.searchForm = new FormGroup<SearchForm>({
      theme: new FormControl<string[] | null>(null),
      bops: new FormControl<Bop[] | null>(null),
      referentiels_programmation: new FormControl<ReferentielProgrammation[] | null>(null),
      niveau: new FormControl<TypeLocalisation | null>(null),
      location: new FormControl({ value: null, disabled: false }, []),
      year: new FormControl<number[]>([], {
        validators: [
          Validators.min(2000),
          Validators.max(new Date().getFullYear()),
        ],
      }),
      beneficiaires: new FormControl<Beneficiaire[] | null>(null),
      types_beneficiaires: new FormControl<SearchTypeCategorieJuridique[] | null>(null),
      tags: new FormControl<TagFieldData[] | null>(null),
    });
  }

  private _on_route_data(data: Data) {
    const response = data as { financial: FinancialDataResolverModel, mb_parsed_params: MarqueBlancheParsedParamsResolverModel }

    const error = response.financial.error || response.mb_parsed_params?.error

    if (error) {
      this.displayError = true;
      this.error = error;
      return;
    }

    const financial = response.financial.data! as FinancialData;
    const mb_has_params = response.mb_parsed_params?.data?.has_marqueblanche_params;
    const mb_prefilter = response.mb_parsed_params?.data?.preFilters;

    this.displayError = false;
    this.themes = financial.themes;
    this.bops = financial.bop;
    this.filteredReferentiels = financial.referentiels_programmation;
    this.annees = financial.annees;

    this.filteredBops = this.bops;

    if (!mb_has_params)
      return

    this._logger.debug(`Mode marque blanche actif.`)
    if (mb_prefilter) {
      this._logger.debug(`Application des filtres`);
      this.preFilter = mb_prefilter;
    }
  }

  ngOnInit(): void {
    this._setupFilters();
  }

  ngAfterViewInit(): void {
    // récupération des themes dans le resolver
    this._route.data.subscribe(
      (data: Data) => {
        setTimeout(() => { this._on_route_data(data) }, 0); 
      }
    );
  }

  /**
   * Retourne le ValidationErrors benefOrBopRequired
   */
  public get errorsBenefOrBop(): ValidationErrors | null {
    return this.searchForm.errors != null ? this.searchForm.errors['benefOrBopRequired'] : null;
  }

  /**
   * lance la recherche des lignes d'engagement financière
   */
  private _search_subscription?: Subscription;
  public doSearch(): void {

    this._search_subscription?.unsubscribe();

    const formValue = this.searchForm.value;
    this.searchInProgress.next(true);

    const search_parameters: SearchParameters = {
      ...SearchParameters_empty,
      themes: formValue.theme || null,
      bops: formValue.bops || null,
      referentiels_programmation: this.selectedReferentiels || null,//this.additional_searchparams?.referentiels_programmation || null,
      niveau:  formValue.niveau || null,
      locations:  formValue.location,
      years: this.selectedYear,
      beneficiaires: this.selectedBeneficiaires || null,
      types_beneficiaires: this.selectedTypesBenef || null,//this.additional_searchparams.types_beneficiaires,
      tags: formValue.tags?.map(tag => tag_fullname(tag)) ?? null,
      domaines_fonctionnels: this.additional_searchparams?.domaines_fonctionnels || null,
      source_region: this.additional_searchparams?.sources_region || null,
    }

    this._search_subscription = this._budgetService
      .search(search_parameters)
      .pipe(
        finalize(() => {
          this.searchInProgress.next(false);
        })
      )
      .subscribe({
        next: (response: FinancialDataModel[] | Error) => {
          this.searchFinish = true;
          this.currentFilter.next(this._buildPreference(formValue as JSONObject));
          this._searchResult = response as FinancialDataModel[];
          this.searchResultsEventEmitter.next(this._searchResult);
        },
        error: (err: Error) => {
          this.searchFinish = true;
          this._searchResult = [];
          this.currentFilter.next(this._buildPreference(formValue as JSONObject));
          this.searchResultsEventEmitter.next(this._searchResult);
          this._alertService.openAlert("error", err, 8);
        },
      });
  }

  /**
   * Clean les donners undefined, null et vide pour enregistrer en tant que preference
   * @param object
   * @returns
   */
  private _buildPreference(object: JSONObject): Preference {
    const preference: Preference = { filters: {} };
    Object.keys(object).forEach((key) => {
      if (
        object[key] !== null &&
        object[key] !== undefined &&
        object[key] !== ''
      ) {
        preference.filters[key] = object[key];
      }
    });
    return preference;
  }

  public reset(): void {
    this.searchFinish = false;
    this.searchForm.reset();
  }

  /**
   * filtrage des données des formulaires pour les autocomplete
   */
  private _setupFilters(): void {
    // Filtre beneficiaires
    this.filteredBeneficiaire$ =
      this.beneficiaireInputChange$
        .pipe(
          startWith(''),
          debounceTime(300),
          switchMap((value) => {

            if (!value || value.length <= 3)
              return of([])

            return this._autocompleteBeneficiaires.autocomplete$(value)
          })
        );
    // Filtre tags
    this._filteredTags$ =
      this.tagsInputChange$
        .pipe(
          startWith(''),
          debounceTime(300),
          switchMap((value) => {
            const term = value || '';
            if (term && term?.length < 1) // On recherche lorsque l'on a commencé à taper une valeur
              return of([])

            return this._autocompleteTags.autocomplete$(term)
          })
        )
  }

  /** Applique les filtres selectionnés au préalable*/
  private _apply_prefilters(preFilter?: PreFilters) {
    if (preFilter == null)
      return

    // Set de la zone géographique et du niveau de localisation
    this.selectedLocation = preFilter.location as unknown as GeoModel[]
    this.selectedNiveau = this.selectedLocation != null ? this.selectedLocation.map(gm => gm.type)[0] as TypeLocalisation : null;

    if (preFilter.year) {
      // Ajout aux options du select des années demandées (filtre ou marque blanche)
      // .filter() pour supprimer d'éventuels doublons
      this.annees = this.annees
                    .concat(Array.isArray(preFilter.year) ? preFilter.year : [preFilter.year])
                    .sort()
                    .reverse()
                    .filter((annee, index, annees) => annees.indexOf(annee) === index);
      this.searchForm.controls['year'].setValue(
        Array.isArray(preFilter.year)
          ? preFilter.year
          : [preFilter.year]
      );
    }

    if (preFilter.theme) {
      const preFilterTheme = Array.isArray(preFilter.theme)
        ? (preFilter.theme as unknown as string[])
        : ([preFilter.theme] as unknown as string[]);
      const themeSelected = this.themes?.filter(
        (theme) =>
          preFilterTheme.findIndex(
            (themeFilter) =>  themeFilter  === theme
          ) !== -1
      );
      this.selectedThemes = themeSelected
    }

    if (preFilter.referentiels_programmation) {
      this.filteredReferentiels = preFilter.referentiels_programmation as ReferentielProgrammation[];
      this.selectedReferentiels = this.filteredReferentiels;
    }

    if (preFilter.beneficiaires || preFilter.beneficiaire) {

      if (preFilter.beneficiaires)
        this.selectedBeneficiaires = preFilter.beneficiaires as BeneficiaireFieldData[];
      else if (preFilter.beneficiaire)
        this.selectedBeneficiaires = [preFilter.beneficiaire as BeneficiaireFieldData];

      forkJoin(
        this.selectedBeneficiaires
          .map(ref => ref.siret)
          .map(siret => this._autocompleteBeneficiaires.autocomplete_single$(siret))
      )
      .subscribe(joined => { this.selectedBeneficiaires = joined; })
    }

    if (preFilter.tags) {
      const prefilterTags = preFilter.tags as unknown as TagFieldData[];
      this.selectedTags = prefilterTags
    }

    // Application du bops
    // Il faut rechercher dans les filtres "this.filteredBop"
    if (preFilter.bops) {
      const prefilterBops = preFilter.bops as unknown as BopModel[];
      const bopSelect = this.filteredBops?.filter(
        (bop) =>
          prefilterBops.findIndex(
            (bopFilter) => bop.code === bopFilter.code
          ) !== -1
      );
      this.selectedBops = bopSelect ?? null;
    }

    if (preFilter.types_beneficiaires) {
      this.selectedTypesBenef = preFilter.types_beneficiaires || null;
    }

    /* Paramètres additionnels qui n'apparaissent pas dans le formulaire de recherche */
    let additional_searchparams: AdditionalSearchParameters = empty_additional_searchparams;

    const domaines_fonctionnels = preFilter?.domaines_fonctionnels
    if (domaines_fonctionnels)
      additional_searchparams = { ...additional_searchparams, domaines_fonctionnels }

    const sources_region = preFilter?.sources_region;
    if (sources_region)
      additional_searchparams = { ...additional_searchparams, sources_region }

    this.additional_searchparams = additional_searchparams;

    // lance la recherche pour afficher les resultats
    this.doSearch();
  }

  //region: Fonctions utilitaires

  private _isArrayIncluded(a1: number[], a2: number[]): boolean {
    return a1.every((num) => a2.includes(num));
  }

  //endregion
}
