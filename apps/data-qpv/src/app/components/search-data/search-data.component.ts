import {
  AfterViewInit,
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Data } from '@angular/router';
import {
  BehaviorSubject,
  debounceTime,
  finalize,
  Subject,
  Subscription,
} from 'rxjs';
import { FinancialData, FinancialDataResolverModel } from 'apps/data-qpv/src/app/models/financial/financial-data-resolvers.models';
import {
  Preference,
} from 'apps/preference-users/src/lib/models/preference.models';
import { JSONObject } from "apps/common-lib/src/lib/models/jsonobject";
import {
  AlertService,
  GeoModel,
  TypeLocalisation,
} from 'apps/common-lib/src/public-api';
import { BudgetService } from 'apps/data-qpv/src/app/services/budget.service';
import { NGXLogger } from 'ngx-logger';
import { PreFilters } from 'apps/data-qpv/src/app/models/search/prefilters.model';
import { MarqueBlancheParsedParamsResolverModel } from '../../resolvers/marqueblanche-parsed-params.resolver';
import { SearchForm } from './search-form.interface';
import {
  GeoLocalisationComponentService
} from "../../../../../common-lib/src/lib/components/localisation/geo.localisation.componentservice";
import { QpvSearchArgs } from "../../models/qpv-search/qpv-search.models";
import { CentreCouts } from 'apps/data-qpv/src/app/models/financial/common.models';
import { Beneficiaire } from 'apps/data-qpv/src/app/models/qpv-search/beneficiaire.model';
import { BopModel } from 'apps/data-qpv/src/app/models/refs/bop.models';
import { FinancialDataModel } from '../../models/financial/financial-data.models';
import { SearchParameters, SearchParameters_empty, SearchTypeCategorieJuridique } from '../../services/interface-data.service';
import { SavePreferenceDialogComponent } from 'apps/preference-users/src/public-api';
import { MatDialog } from '@angular/material/dialog';
import { ModalAdditionalParamsComponent } from '../modal-additional-params/modal-additional-params.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';



@Component({
  selector: 'data-qpv-search-data',
  templateUrl: './search-data.component.html',
  styleUrls: ['./search-data.component.scss'],
  providers: [
    GeoLocalisationComponentService,
  ]
})
export class SearchDataComponent implements OnInit, AfterViewInit {
  public readonly TypeLocalisation = TypeLocalisation;

  public searchForm!: FormGroup<SearchForm>;


  public bops: BopModel[] = [];

  public annees: number[] = [];
  public qpvs: GeoModel[] = [];

  public financeurs: CentreCouts[] = [];
  public thematiques: string[] = [];
  public porteurs: Beneficiaire[] = [];
  public typesPorteur: string[] = [
    "Collectivité", "Association", "Entreprise", "État", "Autres"
  ];

  /**
   * Années
   */
   get selectedAnnees() : number[] | null {
    const annees = this.searchForm.get('annees')?.value;
    return annees && annees.length != 0 ? annees : null;
  }
  set selectedAnnees(data: number[] | null) {
    this.searchForm.get('annees')?.setValue(data ?? null);
  }

  /**
   * Localisation
   */
  get selectedNiveau() : TypeLocalisation | null {
    return this.searchForm.get('niveau')?.value ?? null;
  }
  set selectedNiveau(data: TypeLocalisation | null) {
    this.searchForm.get('niveau')?.setValue(data ?? null);
  }
  get selectedLocalisations() : GeoModel[] | null {
    return this.searchForm.get('localisations')?.value ?? null;
  }
  set selectedLocalisations(data: GeoModel[] | null) {
    this.searchForm.get('localisations')?.setValue(data ?? null);
  }

  /**
   * QPV
   */
  get selectedQpv() : GeoModel[] | null {
    return this.searchForm.get('qpv')?.value ?? null;
  }
  set selectedQpv(data: GeoModel[] | null) {
    this.searchForm.get('qpv')?.setValue(data ?? null);
  }
  
  inputQPV: string = '';
  inputFilterQPV = new Subject<string>();
  public filteredQPV: GeoModel[] | null = null;
  
  public renderQPVOption = (geo: GeoModel): string => {
    return geo.code + ' - ' + geo.nom
  }
  public filterQPV = (value: string): GeoModel[] => {
    this.inputQPV = value;
    this.inputFilterQPV.next(value);
    return this.filteredQPV ?? [];
  }
  public renderQPVLabel = (bops: GeoModel[]) => {
    let label: string = ''
    if (bops)
      bops.forEach((bop, i) => {
        label += (bop.code + ' - ' + bop.nom) + (i !== bops.length - 1 ? ', ' : '')
      })
    return label
  }

  /**
   * Financeurs
   */
  
  @ViewChild('modalFinanceurs') modalFinanceurs!: ModalAdditionalParamsComponent<CentreCouts>;
  
  inputFinanceurs: string = '';
  inputFilterFinanceurs = new Subject<string>();
  filteredFinanceurs: CentreCouts[] = []

  get selectedFinanceurs() : CentreCouts[] | null {
    return this.searchForm.get('financeurs')?.value ?? null;
  }
  set selectedFinanceurs(data: CentreCouts[] | null) {
    this.searchForm.get('financeurs')?.setValue(data ?? null);
  }

  public filterFinanceurCheckbox = (value: string): CentreCouts[] => {
    this.inputFinanceurs = value;
    this.inputFilterFinanceurs.next(value);
    return this.filteredFinanceurs ?? [];
  }
  public renderFinanceurCheckbox = (financeur: CentreCouts): string => {
    return financeur.label ?? financeur.code
  }

  /**
   * Thématiques
   */

  @ViewChild('modalThematiques') modalThematiques!: ModalAdditionalParamsComponent<string>;

  get selectedThematiques() : string[] | null {
    return this.searchForm.get('thematiques')?.value ?? null;
  }
  set selectedThematiques(data: string[] | null) {
    this.searchForm.get('thematiques')?.setValue(data ?? null);
  }

  /**
   * Porteurs de projet
   */
  
  @ViewChild('modalPorteurs') modalPorteurs!: ModalAdditionalParamsComponent<Beneficiaire>;
  
  inputPorteurs: string = '';
  inputFilterPorteurs = new Subject<string>();
  filteredPorteurs: Beneficiaire[] = []

  get selectedPorteurs() : Beneficiaire[] | null {
    return this.searchForm.get('porteurs')?.value ?? null;
  }
  set selectedPorteurs(data: Beneficiaire[] | null) {
    this.searchForm.get('porteurs')?.setValue(data ?? null);
  }

  public filterPorteurCheckbox = (value: string): Beneficiaire[] => {
    this.inputPorteurs = value;
    this.inputFilterPorteurs.next(value);
    return this.filteredPorteurs ?? [];
  }
  public renderPorteurCheckbox = (porteur: Beneficiaire): string => {
    return porteur.siret
  }


  /**
   * Types de porteur
   */

  @ViewChild('modalTypesPorteur') modalTypesPorteur!: ModalAdditionalParamsComponent<SearchTypeCategorieJuridique>;

  get selectedTypesPorteur() : SearchTypeCategorieJuridique[] | null {
    return this.searchForm.get('types_porteur')?.value ?? null;
  }
  set selectedTypesPorteur(data: SearchTypeCategorieJuridique[] | null) {
    this.searchForm.get('types_porteur')?.setValue(data ?? null);
  }

  public renderTypePorteurCheckbox = (type: SearchTypeCategorieJuridique): string => {
    return type
  }
  
  /**
   * Les donnees de la recherche
   */
  private _searchResults: FinancialDataModel[] | null = null;
  get searchResults(): FinancialDataModel[] | null {
    return this._searchResults;
  }
  @Input()
  set searchResults(results: FinancialDataModel[] | null) {
    this._searchResults = results;
    this.searchResultsEventEmitter.emit(this._searchResults)
  }
  @Output() searchResultsEventEmitter = new EventEmitter<FinancialDataModel[] | null>();

  /**
   * Indique si la recherche a été effectué
   */
  private _searchFinish: boolean = false;
  get searchFinish() {
    return this._searchFinish
  }
  @Input()
  set searchFinish(searchFinish: boolean) {
    this._searchFinish = searchFinish
    this.searchFinishChange.emit(searchFinish)
  }
  @Output() searchFinishChange = new EventEmitter<boolean>();


  private _searchInProgress: BehaviorSubject<boolean> = new BehaviorSubject(false);
  get searchInProgress() {
    return this._searchInProgress
  }
  @Input()
  set searchInProgress(searchInProgress: BehaviorSubject<boolean>) {
    this._searchInProgress = searchInProgress
    this.searchInProgressChange.emit(searchInProgress)
  }
  @Output() searchInProgressChange = new EventEmitter<BehaviorSubject<boolean>>();

  /**
   * Affiche une erreur
   */
  public displayError = false;
  public error: Error | any | null = null;

  /**
   * Resultats de la recherche.
   */
  @Output() searchArgsEventEmitter = new EventEmitter<QpvSearchArgs>();



  /**
   * Resultats de la recherche.
   */
  currentFilter?: Preference;

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
    private _geo: GeoLocalisationComponentService
  ) {
    // Formulaire avc champs déclarés dans l'ordre
    this.searchForm = new FormGroup<SearchForm>({
      annees: new FormControl<number[]>([], {
        validators: [
          Validators.min(2000),
          Validators.max(new Date().getFullYear()),
        ],
      }),
      niveau: new FormControl<TypeLocalisation | null>(null),
      localisations: new FormControl<GeoModel[] | null>({ value: null, disabled: false }, []),
      qpv: new FormControl<any | null>(null),
      financeurs: new FormControl<CentreCouts[] | null>(null),
      thematiques: new FormControl<string[] | null>(null),
      porteurs: new FormControl<Beneficiaire[] | null>(null),
      types_porteur: new FormControl<SearchTypeCategorieJuridique[] | null>(null),
    });

    
    this.inputFilterQPV.pipe(
      debounceTime(300),
      takeUntilDestroyed(this._destroyRef)
    ).subscribe(() => {
      const term = this.inputQPV !== '' ? this.inputQPV : null;

      if (this._subFilterGeo)
        this._subFilterGeo.unsubscribe();

      this._subFilterGeo = this._geo.filterQPV2024(term)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe((response: GeoModel[]) => {
          this.filteredQPV = response;
          // TODO : Facto du filter générique pour gérer aussi les Observable
          // Concaténation des éléments sélectionnés avec les éléments filtrés (en supprimant les doublons éventuels)
          this.filteredQPV = this.selectedQpv != null ?
            [
              ...this.selectedQpv,
              ...this.filteredQPV.filter((el) => !this.selectedQpv?.map(s => s.code).includes(el.code))
            ]
            : this.filteredQPV
        });
    });
        
    this.inputFilterFinanceurs.pipe(
      debounceTime(300),
      takeUntilDestroyed(this._destroyRef)
    ).subscribe(() => {
      const term = this.inputFinanceurs !== '' ? this.inputFinanceurs : null;

      if (this._subFilterGeo)
        this._subFilterGeo.unsubscribe();

      this._subFilterGeo = this._budgetService.getCentreCouts(term)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe((response: CentreCouts[]) => {
          this.filteredFinanceurs = response;
          this.filteredFinanceurs = this.selectedFinanceurs != null ?
            [
              ...this.selectedFinanceurs,
              ...this.filteredFinanceurs.filter((el) => !this.selectedFinanceurs?.map(s => s.code).includes(el.code))
            ]
            : this.filteredFinanceurs
        });
    });
        
    this.inputFilterPorteurs.pipe(
      debounceTime(300),
      takeUntilDestroyed(this._destroyRef)
    ).subscribe(() => {
      const term = this.inputPorteurs !== '' ? this.inputPorteurs : null;

      if (this._subFilterGeo)
        this._subFilterGeo.unsubscribe();

      this._subFilterGeo = this._budgetService.getBeneficiaires(term)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe((response: Beneficiaire[]) => {
          this.filteredPorteurs = response;
          this.filteredPorteurs = this.filteredPorteurs != null ?
            [
              ...this.filteredPorteurs,
              ...this.filteredPorteurs.filter((el) => !this.selectedPorteurs?.map(s => s.siret).includes(el.siret))
            ]
            : this.filteredPorteurs
        });
    });
  }

  private _on_route_data(data: Data) {
    const response = data as {
      financial: FinancialDataResolverModel,
      mb_parsed_params: MarqueBlancheParsedParamsResolverModel
    }

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
    this.bops = financial.bops;
    this.annees = financial.annees;
    this.financeurs = financial.financeurs;
    this.filteredFinanceurs = financial.financeurs;
    this.thematiques = financial.thematiques;
    this.porteurs = financial.porteurs;
    this.filteredPorteurs = financial.porteurs;

    if (!mb_has_params)
      return

    this._logger.debug(`Mode marque blanche actif.`)
    if (mb_prefilter) {
      this._logger.debug(`Application des filtres`);
      this.preFilter = mb_prefilter;
    }
  }

  private _subFilterGeo: Subscription | null = null;
  private _destroyRef = inject(DestroyRef)

  ngOnInit(): void {
    this._geo
      .filterQPV2024("")
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((response) => {
        this.qpvs = response as GeoModel[]
        this.filteredQPV = response as GeoModel[]
        // TODO : Facto du filter générique pour gérer aussi les Observable
        // Concaténation des éléments sélectionnés avec les éléments filtrés (en supprimant les doublons éventuels)
        this.filteredQPV = this.selectedQpv != null ?
          [
            ...this.selectedQpv,
            ...this.filteredQPV.filter((el) => !this.selectedQpv?.map(s => s.code).includes(el.code))
          ]
          : this.filteredQPV
      });
      this.currentFilter = this._buildPreference(this.searchForm.value as JSONObject);
      console.log('ok')
  }

  ngAfterViewInit(): void {
    // Récupération des options de select du formulaires
    this._route.data.subscribe(
      (data: Data) => {
        setTimeout(() => { this._on_route_data(data) }, 0);
      }
    );
  }

  /**
   * lance la recherche des lignes d'engagement financière
   */
  private _search_subscription?: Subscription;
  public doSearch(): void {

    this._search_subscription?.unsubscribe();

    const formValue = this.searchForm.value;
    this.searchInProgress.next(true);

    this.currentFilter = this._buildPreference(formValue as JSONObject);
    const newQpvSearchArgsObject: QpvSearchArgs = {
      annees: this.selectedAnnees,
      niveau: this.selectedNiveau,
      localisations: this.selectedLocalisations,
      qpv_codes: this.selectedQpv, 
      types_porteur: this.selectedTypesPorteur, 
    };

    this.searchArgsEventEmitter.next(newQpvSearchArgsObject);

    const search_parameters: SearchParameters = {
      ...SearchParameters_empty,
      years: formValue.annees || null,
      niveau: formValue.niveau || null,
      locations: formValue.localisations || null,
      qpvs: formValue.qpv || null,
      types_beneficiaires: formValue.types_porteur || null,
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
          this.currentFilter = this._buildPreference(formValue as JSONObject);
          this.searchResults = response as FinancialDataModel[];
        },
        error: (err: Error) => {
          this.searchFinish = true;
          this.searchResults = [];
          this.currentFilter = this._buildPreference(formValue as JSONObject);
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
    console.log(preference)
    return preference;
  }

  public reset(): void {
    this.searchFinish = false;
    this.searchForm.reset();
    this.doSearch();
  }


  /** Applique les filtres selectionnés au préalable*/
  private _apply_prefilters(preFilter?: PreFilters) {
    if (preFilter == null)
      return

    if (preFilter.annees) {
      this.selectedAnnees = preFilter.annees
    }

    if (preFilter.localisation) {
      this.selectedLocalisations = preFilter.localisation as unknown as GeoModel[]
      this.selectedNiveau = this.selectedLocalisations != null ? this.selectedLocalisations.map(gm => gm.type)[0] as TypeLocalisation : null;
    }
    if (preFilter.qpv) {
      this.selectedQpv = preFilter.qpv as unknown as GeoModel[]
    }
    if (preFilter.financeurs) {
      this.selectedFinanceurs = preFilter.financeurs as unknown as CentreCouts[]
    }
    if (preFilter.thematiques) {
      this.selectedThematiques = preFilter.thematiques
    }
    if (preFilter.porteurs) {
      this.selectedPorteurs = preFilter.porteurs as unknown as Beneficiaire[]
    }
    if (preFilter.types_porteur) {
      this.selectedTypesPorteur = preFilter.types_porteur as unknown as SearchTypeCategorieJuridique[]
    }

    // lance la recherche pour afficher les resultats
    this.doSearch();
  }


  /**
   * Filtre retourner par le formulaire de recherche
   */
  private dialog = inject(MatDialog);

  public openSaveFilterDialog(): void {
    if (this.currentFilter) {
      this.currentFilter.name = '';
    }
    console.log(this.currentFilter)

    const dialogRef = this.dialog.open(SavePreferenceDialogComponent, {
      data: this.currentFilter,
      width: '40rem',
      autoFocus: 'input',
    });

    dialogRef.afterClosed().subscribe((_) => { });
  }

}

