import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
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
import { DatePipe } from '@angular/common';
import {
  JSONObject,
  Preference,
} from 'apps/preference-users/src/lib/models/preference.models';
import {
  AlertService,
  GeoModel,
  SearchParameters,
  SearchParameters_empty,
  TypeLocalisation,
} from 'apps/common-lib/src/public-api';
import { Bop } from '@models/search/bop.model';
import { BudgetService } from '@services/budget.service';
import { FinancialDataHttpService } from '@services/http/financial-data-http.service';
import { NGXLogger } from 'ngx-logger';
import { PreFilters } from '@models/search/prefilters.model';
import { MarqueBlancheParsedParamsResolverModel } from '../../resolvers/marqueblanche-parsed-params.resolver';
import { AdditionalSearchParameters, empty_additional_searchparams } from './additional-searchparams';
import { BeneficiaireFieldData } from './beneficiaire-field-data.model';
import { SearchForm } from './search-form.interface';
import { AutocompleteBeneficiaireService } from './autocomplete-beneficiaire.service';
import { SelectedData } from 'apps/common-lib/src/lib/components/advanced-chips-multiselect/advanced-chips-multiselect.component';
import { LocalisationComponent } from 'apps/common-lib/src/lib/components/localisation/localisation.component';
import { Beneficiaire } from '@models/search/beneficiaire.model';
import { TagFieldData } from './tags-field-data.model';
import { AutocompleteTagsService } from './autocomplete-tags.service';


@Component({
  selector: 'financial-search-data',
  templateUrl: './search-data.component.html',
  styleUrls: ['./search-data.component.scss'],
  providers: [
    AutocompleteBeneficiaireService,
    AutocompleteTagsService,
  ]
})
export class SearchDataComponent implements OnInit {
  public readonly TypeLocalisation = TypeLocalisation;

  public searchForm!: FormGroup<SearchForm>;


  public additional_searchparams: AdditionalSearchParameters = empty_additional_searchparams;

  public bop: BopModel[] = [];
  public themes: string[] = [];
  public annees: number[] = [];

  public filteredBop: BopModel[] | null = null;

  /**
   * Themes
   */
  get selectedTheme() : string[] | null | undefined {
    return this.searchForm.get('theme')?.value;
  }
  set selectedTheme(data: string[] | null | undefined) {
    this.searchForm.get('theme')?.setValue(data != null ? data : null);
    // Filtrage des bops en fonction des thèmes sélectionnés
    this.filteredBop = [];
    if (this.selectedTheme && this.selectedTheme.length > 0)
      this.selectedTheme?.forEach((theme) => {
        const filtered = this.bop.filter(bop => theme !== null && theme.includes(bop.label_theme));
        if (this.filteredBop)
          this.filteredBop = this.filteredBop?.concat(filtered);
      });
    else {
      this.filteredBop = this.bop;
      this.selectedBops = null
    }
  }

  /**
   * Bops
   */
  get selectedBops() : BopModel[] | null | undefined {
    return this.searchForm.get('bops')?.value;
  }
  set selectedBops(data: BopModel[] | null | undefined) {
    this.searchForm.get('bops')?.setValue(data != null ? data : null);
  }
  // Les fonctions injectées au component DOIVENT être lambdas pour garder le contexte initial
  public renderBopOption = (bop: BopModel) => {
    return bop.code + (bop.label === null ?  '' : ' - ' + bop.label)
  }
  public filterBop = (value: string): BopModel[] => {
    const filterValue = value ? value.toLowerCase() : '';
    const themes = this.searchForm.controls['theme'].value;

    const filterGeo = this.bop.filter((option) => {
      if (themes) {
        return (
          option.label_theme != null &&
          themes.includes(option.label_theme) &&
          option.label?.toLowerCase().includes(filterValue)
        );
      }
      return (
        option.label?.toLowerCase().includes(filterValue) ||
        option.code.startsWith(filterValue)
      );
    });

    const controlBop = this.searchForm.controls['bops'].value;

    if (controlBop) {
      // si des BOPs sont déjà sélectionné
      return [
        ...controlBop,
        ...filterGeo.filter(
          (element) =>
            controlBop.findIndex(
              (valueSelected: BopModel) => valueSelected.code === element.code
            ) === -1 // on retire les doublons éventuels
        ),
      ];
    } else {
      return filterGeo;
    }
  }
  public renderTriggerLabel = (bops: BopModel[]) => {
    let label: string = ''
    if (bops)
      bops.forEach((bop, i) => {
        label += (bop.code + ' - ' + bop.label) + (i !== bops.length - 1 ? ', ' : '')
      })
    return label
  }

  /**
   * Locations
   */
  private _selectedNiveau: TypeLocalisation[] | null | undefined = null
  get selectedNiveau() : TypeLocalisation[] | null | undefined {
    return this._selectedNiveau;
  }
  set selectedNiveau(data: TypeLocalisation[] | null | undefined) {
    this._selectedNiveau = data;
  }
  get selectedLocation() : GeoModel[] | null | undefined {
    return this.searchForm.get('location')?.value;
  }
  set selectedLocation(data: GeoModel[] | null | undefined) {
    this.searchForm.get('location')?.setValue(data != null ? data : null);
  }


  /**
   * Year
   */
  get selectedYear() : number[] | null | undefined {
    return this.searchForm.get('year')?.value;
  }
  set selectedYear(data: number[] | null | undefined) {
    this.searchForm.get('year')?.setValue(data != null ? data : null);
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
    private _datePipe: DatePipe,
    private _alertService: AlertService,
    private _budgetService: BudgetService,
    private _logger: NGXLogger,
    private _autocompleteBeneficiaires: AutocompleteBeneficiaireService,
    private _autocompleteTags: AutocompleteTagsService,
  ) {
    // Formulaire avc champs déclarés dans l'ordre
    this.searchForm = new FormGroup<SearchForm>({
      theme: new FormControl<string[] | null>(null),
      bops: new FormControl<Bop[] | null>(null),
      location: new FormControl({ value: null, disabled: false }, []),
      year: new FormControl<number[]>([], {
        validators: [
          Validators.min(2000),
          Validators.max(new Date().getFullYear()),
        ],
      }),
      beneficiaires: new FormControl<Beneficiaire[] | null>(null),
      tags: new FormControl<TagFieldData[] | null>(null),
    });
  }

  ngOnInit(): void {
    // récupération des themes dans le resolver
    this._route.data.subscribe(
      (data: Data) => {
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
        this.bop = financial.bop;
        this.annees = financial.annees;

        this.filteredBop = this.bop;

        if (!mb_has_params)
          return

        this._logger.debug(`Mode marque blanche actif.`)
        if (mb_prefilter) {
          this._logger.debug(`Application des filtres`);
          this.preFilter = mb_prefilter;
        }
      }
    );

    this._setupFilters();
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
      beneficiaires: this.selectedBeneficiaires || null,
      types_beneficiaires: this.additional_searchparams.types_beneficiaires,
      bops: formValue.bops || null,
      themes: formValue.theme || null,
      years: formValue.year || null,
      locations:  formValue.location,

      tags: formValue.tags?.map(tag => tag.item) ?? null,

      domaines_fonctionnels: this.additional_searchparams?.domaines_fonctionnels || null,
      referentiels_programmation: this.additional_searchparams?.referentiels_programmation || null,
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
          this._alertService.openAlertError(err.message, 8);
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

  public downloadCsv(): void {
    this.searchForm.markAllAsTouched(); // pour notifier les erreurs sur le formulaire
    if (this.searchForm.valid && !this.searchInProgress.value ) {
      this.searchInProgress.next(true);
      const csvdata = this._budgetService.getCsv(this._searchResult ?? []);

      console.log(csvdata);
       const url = URL.createObjectURL(csvdata);
          const a = document.createElement('a');
          a.href = url;
          a.download = this._filenameCsv();
          document.body.appendChild(a);
          a.click();

          this.searchInProgress.next(false);
    }
  }

  public reset(): void {
    this.searchFinish = false;
    this.searchForm.reset();
  }

  private _filenameCsv(): string {
    const formValue = this.searchForm.value;
    let filename = `${this._datePipe.transform(new Date(), 'yyyyMMdd')}_export`;
    if (formValue.location ) {
      const locations = formValue.location as GeoModel[];
      filename += '_' + locations[0].type + '-';
      filename += locations
        .filter((loc) => loc.code)
        .map((loc) => loc.code)
        .join('-');
    }

    if (formValue.bops) {
      const bops = formValue.bops;
      filename +=
        '_bops-' +
        bops
          .filter((bop) => bop.code)
          .map((bop) => bop.code)
          .join('-');
    }

    return filename + '.csv';
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
            if (term && term?.length < 2) // On recherche lorsque l'on a commencé à taper une valeur
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
    this.selectedNiveau = this.selectedLocation != null ? this.selectedLocation.map(gm => gm.type) as TypeLocalisation[] : null;

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
      this.selectedTheme = themeSelected
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
      const bopSelect = this.filteredBop?.filter(
        (bop) =>
          prefilterBops.findIndex(
            (bopFilter) => bop.code === bopFilter.code
          ) !== -1
      );
      this.selectedBops = bopSelect;
    }

    /* Paramètres additionnels qui n'apparaissent pas dans le formulaire de recherche */
    let additional_searchparams: AdditionalSearchParameters = empty_additional_searchparams;

    const types_beneficiaires = preFilter?.types_beneficiaires;
    if (types_beneficiaires)
      additional_searchparams = { ...additional_searchparams, types_beneficiaires }

    const domaines_fonctionnels = preFilter?.domaines_fonctionnels
    if (domaines_fonctionnels)
      additional_searchparams = { ...additional_searchparams, domaines_fonctionnels }

    const referentiels_programmation = preFilter?.referentiels_programmation
    if (referentiels_programmation)
      additional_searchparams = { ...additional_searchparams, referentiels_programmation }

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
