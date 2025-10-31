import { Component, DestroyRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  BehaviorSubject,
  debounceTime,
  finalize,
  Observable,
  of,
  startWith,
  Subject,
  switchMap,
  tap
} from 'rxjs';
import { GeoModel, TypeLocalisation } from 'apps/common-lib/src/public-api';
import { MarqueBlancheParsedParamsResolverModel } from '../../../resolvers/marqueblanche-parsed-params.resolver';
import { AutocompleteBeneficiaireService } from './autocomplete/autocomplete-beneficiaire.service';
import { LoggerService } from 'apps/common-lib/src/lib/services/logger.service';
import { BopModel } from '../../../models/refs/bop.models';
import { OtherTypeCategorieJuridique, SearchParameters, SearchParamsService, SearchTypeCategorieJuridique } from '../../../services/search-params.service';
import { CentreCouts, TypeCategorieJuridique } from '../../../models/financial/common.models';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { SelectMultipleComponent } from 'apps/common-lib/src/lib/components/select-multiple/select-multiple.component';
import { LocalisationComponent } from 'apps/common-lib/src/lib/components/localisation/localisation.component';
import { FinancialDataResolverModel } from '../../../models/financial/financial-data-resolvers.models';
import { MatButtonModule } from '@angular/material/button';
import { PrefilterMapperService } from './prefilter-mapper.services';
import { PreferenceService } from '../../../services/preference.service';
import { SearchDataService } from '../../../services/search-data.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GridInFullscreenStateService } from 'apps/common-lib/src/lib/services/grid-in-fullscreen-state.service';
import { PreFilters } from '../../../models/search/prefilters.model';
import { RefGeoQpv, RefQpvWithCommune } from '../../../models/refs/qpv.model';
import { ModalAdditionalParamsComponent } from './modal-additional-params/modal-additional-params.component';
import { RefSiret } from 'apps/common-lib/src/lib/models/refs/RefSiret';
import { AutocompleteCentreCoutsService } from './autocomplete/autocomplete-centre-couts.service';
import { ThemeModel } from '@models/refs/bop.models';


/**
 * Interface du formulaire de recherche
 */
export interface FormSearch {
  annees: FormControl<number[] | null>;
  niveau: FormControl<TypeLocalisation | null>;
  localisations: FormControl<GeoModel[] | null>;
  qpv: FormControl<RefQpvWithCommune[] | null>;
  financeurs: FormControl<CentreCouts[] | null>;
  thematiques: FormControl<ThemeModel[] | null>;
  porteurs: FormControl<RefSiret[] | null>;
  types_porteur: FormControl<SearchTypeCategorieJuridique[] | null>;
}


@Component({
  selector: 'data-qpv-search-data',
  templateUrl: './search-data.component.html',
  styleUrls: ['./search-data.component.scss'],
  providers: [AutocompleteCentreCoutsService, AutocompleteBeneficiaireService],
  imports: [MatIconModule, ReactiveFormsModule,MatButtonModule, CommonModule, LocalisationComponent, SelectMultipleComponent, ModalAdditionalParamsComponent]
})
export class SearchDataComponent implements OnInit {

  private _destroy_ref = inject(DestroyRef);
  private _route = inject(ActivatedRoute);
  private _preferenceService = inject(PreferenceService)
  private _prefilterMapperService = inject(PrefilterMapperService);
  private _searchParamsService = inject(SearchParamsService);
  private _logger = inject(LoggerService).getLogger(SearchDataComponent.name);
  private _autocompleteFinanceurs = inject(AutocompleteCentreCoutsService);
  private _autocompletePorteurs = inject(AutocompleteBeneficiaireService);
  private _gridFullscreen = inject(GridInFullscreenStateService);

  public searchDataService = inject(SearchDataService);


  /**
   * Formulaire de recherche
   */
  public formSearch: FormGroup<FormSearch> = new FormGroup<FormSearch>({
    annees: new FormControl<number[]>([], {
      validators: [
        Validators.min(2000),
        Validators.max(new Date().getFullYear()),
      ],
    }),
    niveau: new FormControl<TypeLocalisation | null>(null),
    localisations: new FormControl<GeoModel[] | null>({ value: null, disabled: false }, []),
    qpv: new FormControl<RefQpvWithCommune[] | null>(null),
    financeurs: new FormControl<CentreCouts[] | null>(null),
    thematiques: new FormControl<ThemeModel[] | null>(null),
    porteurs: new FormControl<RefSiret[] | null>(null),
    types_porteur: new FormControl<SearchTypeCategorieJuridique[] | null>(null),
  });

  // public bops: BopModel[] = [];
  public thematiques: ThemeModel[] = [];
  public annees: number[] = [];
  public qpvs: RefQpvWithCommune[] = [];
  public filteredFinanceurs: CentreCouts[] = []
  public filteredThematiques: ThemeModel[] = []
  public filteredPorteurs: RefSiret[] = []

  public refGeo: RefGeoQpv | undefined;
  // public filteredBops: BopModel[] = [];
  // public filteredReferentiels: ReferentielProgrammation[] = [];
  // public searchFinish: boolean = false;


  /**
   * Années
   */
  get selectedAnnees(): number[] | null {
    const annees = this.formSearch.controls.annees.value;
    return annees && annees.length != 0 ? annees : null;
  }
  set selectedAnnees(data: number[] | null) {
    this.formSearch.controls.annees.setValue(data ?? null);
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
  public wordingNiveaux: Map<TypeLocalisation, string> = new Map<TypeLocalisation, string>([
    [TypeLocalisation.EPCI, "Contrat de ville"]
  ])

  /**
   * QPV
   */
  get selectedQpv(): RefQpvWithCommune[] | null {
    return this.formSearch.controls.qpv.value ?? null;
  }
  set selectedQpv(data: RefQpvWithCommune[] | null) {
    this.formSearch.controls.qpv?.setValue(data ?? null);
  }

  inputQPV: string = '';
  inputFilterQPV = new Subject<string>();
  public filteredQPV = signal<RefQpvWithCommune[]>([]);

  public renderQPVOption = (geo: RefQpvWithCommune): string => {
    return geo.code + ' - ' + geo.label
  }
  public filterQPV = (value: string): RefQpvWithCommune[] => {
    this.inputQPV = value;
    this.inputFilterQPV.next(value);
    return this.filteredQPV();
  }
  public renderQPVLabel = (geos: RefQpvWithCommune[]) => {
    let label: string = ''
    if (geos)
      geos.forEach((geo, i) => {
        label += (geo.code + ' - ' + geo.label) + (i !== geos.length - 1 ? ', ' : '')
      })
    return label
  }

  
  /**
   * Financeurs (CentreCouts)
   */
  @ViewChild('modalFinanceurs') modalFinanceurs!: ModalAdditionalParamsComponent<CentreCouts>;
  get selectedFinanceurs(): CentreCouts[] | null {
    return this.formSearch.controls.financeurs.value ?? null;
  }
  set selectedFinanceurs(data: CentreCouts[] | null) {
    this.formSearch.controls.financeurs.setValue(data);
  }
  public loadingFinanceurs = false;
  public filterFinanceurCheckbox = (value: string): CentreCouts[] => {
    this.onFinanceursInputChange(value);
    return this.filteredFinanceurs ?? [];
  }
  public renderFinanceurCheckbox = (financeur: CentreCouts): string => {
    return financeur.description ? financeur.code + ' - ' + financeur.description : financeur.code
  }
  public filteredFinanceurs$: Observable<CentreCouts[]> = of([]);

  public get financeurFieldOptions$(): Observable<CentreCouts[]> {
    return this.filteredFinanceurs$;
  }

  public financeurInputChange$ = new BehaviorSubject<string>('');

  public onFinanceursInputChange(v: string) {
    this.financeurInputChange$.next(v);
  }


  /**
   * Thématiques (Theme)
   */
  @ViewChild('modalThematiques') modalThematiques!: ModalAdditionalParamsComponent<string>;
  get selectedThematiques(): ThemeModel[] | null {
    return this.formSearch.controls.thematiques.value ?? null;
  }
  set selectedThematiques(data: ThemeModel[] | null) {
    this.formSearch.controls.thematiques.setValue(data ?? null);
  }
  public renderThematiqueCheckbox = (thematique: ThemeModel): string => {
    return thematique.label
  }
  public filterThematiqueCheckbox = (text: string): ThemeModel[] => {
    this.filteredThematiques = this.thematiques.filter(t => t.label.toLowerCase().includes(text.toLowerCase()))
    return this.filteredThematiques;
  };
  

  /**
   * Porteurs (Beneficiaire)
   */
  @ViewChild('modalPorteurs') modalPorteurs!: ModalAdditionalParamsComponent<RefSiret>;
  get selectedPorteurs(): RefSiret[] {
    return this.formSearch.controls.porteurs?.value as RefSiret[];
  }
  set selectedPorteurs(data: RefSiret[]) {
    this.formSearch.controls.porteurs?.setValue(data as RefSiret[]);
  }
  public loadingPorteurs = false;
  public filterPorteurCheckbox = (value: string): RefSiret[] => {
    this.onPorteurInputChange(value);
    return this.filteredPorteurs ?? [];
  }
  public renderPorteurCheckbox = (porteur: RefSiret): string => {
    return porteur.siret + ' - ' + porteur.denomination
  }

  public filteredPorteurs$: Observable<RefSiret[]> = of([]);

  public get porteurFieldOptions$(): Observable<RefSiret[]> {
    return this.filteredPorteurs$;
  }

  public porteurInputChange$ = new BehaviorSubject<string>('');

  public onPorteurInputChange(v: string) {
    this.porteurInputChange$.next(v);
  }

  /**
   * Types de porteur (TypeBeneficiaire)
   */
  @ViewChild('modalTypesPorteur') modalTypesPorteur!: ModalAdditionalParamsComponent<SearchTypeCategorieJuridique>;
  get selectedTypesPorteur(): SearchTypeCategorieJuridique[] {
    return this.formSearch.controls.types_porteur?.value as SearchTypeCategorieJuridique[];
  }
  set selectedTypesPorteur(data: SearchTypeCategorieJuridique[]) {
    this.formSearch.controls.types_porteur?.setValue(data as SearchTypeCategorieJuridique[]);
  }
  public renderTypePorteurCheckbox = (type: SearchTypeCategorieJuridique): string => {
    return this.renderTypesPorteurOption(type)
  }

  public typesPorteur: SearchTypeCategorieJuridique[] = [
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
  public renderTypesPorteurOption = (t: SearchTypeCategorieJuridique): string => {
    const type: string | undefined = this._prettyTypes.has(t) ? this._prettyTypes.get(t) : t;
    return type ? type.charAt(0).toUpperCase() + type.slice(1) : '';
  };
  public renderTypesPorteurLabel = (types: SearchTypeCategorieJuridique[]) => {
    return types?.map((t) => (this._prettyTypes.has(t) ? this._prettyTypes.get(t) : t)).join(', ');
  };


  ngOnInit(): void {
    this.inputFilterQPV.pipe(
      debounceTime(300),
      takeUntilDestroyed(this._destroy_ref)
    ).subscribe(() => {
      const term = this.inputQPV !== '' ? this.inputQPV : null;
      if (this.formSearch.get('localisations')?.value) {
        const localisations = this.formSearch.controls.localisations?.value as GeoModel[];
        const type = this.formSearch.controls.niveau?.value;
        const codes = localisations.map(geo => geo.code);
        this.filteredQPV.set(this._filterQpvByTypeLocalisation(codes, type as TypeLocalisation));
      } else {
        this.filteredQPV.set(this.qpvs);
      }

     
      if (term != null) {
        const qpv = this.filteredQPV();
        this.filteredQPV.set(qpv.filter(qpv => qpv.code.includes(term) || (qpv as RefQpvWithCommune).label.toLocaleLowerCase().includes(term.toLocaleLowerCase())));
      }

      if(this.selectedQpv != null) {
        this.filteredQPV.set([
          ...this.selectedQpv,
          ...this.filteredQPV().filter((el) => !this.selectedQpv?.map(s => s.code).includes(el.code))
        ])
      }
    });
    // Subscribe pour l'autocomplete des financeurs
    this.financeurInputChange$.pipe(
      startWith(''),
      tap((value) => {
        if (value && value.length > 3) {
          this.loadingFinanceurs = true;
        }
      }),
      debounceTime(300),
      switchMap((value) => {
        if (!value || value.length <= 3) {
          this.loadingFinanceurs = false;
          return of([]);
        }
        this.loadingFinanceurs = true;
        return this._autocompleteFinanceurs.autocomplete$(value).pipe(
          finalize(() => (this.loadingFinanceurs = false))
        );
      })
    ).subscribe((response: CentreCouts[]) => {
      this.filteredFinanceurs = response;
      this.filteredFinanceurs = this.selectedFinanceurs != null ?
        [
          ...this.selectedFinanceurs,
          ...this.filteredFinanceurs.filter((el) => !this.selectedFinanceurs?.map(s => s.code).includes(el.code))
        ]
        : this.filteredFinanceurs
    });
    // Subscribe pour l'autocomplete des porteurs
    this.porteurInputChange$.pipe(
      startWith(''),
      tap((value) => {
        if (value && value.length > 3) {
          this.loadingPorteurs = true;
        }
      }),
      debounceTime(300),
      switchMap((value) => {
        if (!value || value.length <= 3) {
          this.loadingPorteurs = false;
          return of([]);
        }
        this.loadingPorteurs = true
        return this._autocompletePorteurs.autocomplete$(value).pipe(
          finalize(() => (this.loadingPorteurs = false))
        );
      })
    ).subscribe((response: RefSiret[]) => {
      this.filteredPorteurs = response;
      this.filteredPorteurs = this.selectedPorteurs != null ?
        [
          ...this.selectedPorteurs,
          ...this.filteredPorteurs.filter((el) => !this.selectedPorteurs?.map(s => s.siret).includes(el.siret))
        ]
        : this.filteredPorteurs
    });
    
    // Resolve des référentiels et de la marque blanche
    const resolvedFinancial = this._route.snapshot.data['financial'] as FinancialDataResolverModel;
    const resolvedMarqueBlanche = this._route.snapshot.data['mb_parsed_params'] as MarqueBlancheParsedParamsResolverModel;
    this._logger.debug('resolvedMarqueBlanche => ', resolvedMarqueBlanche );
    // Sauvegarde des référentiels dans les listes
    this.thematiques = resolvedFinancial.data?.thematiques ?? [];
    this.filteredThematiques = this.thematiques
    // this.bops = resolvedFinancial.data?.bop ?? [];
    // this.filteredBops = this.bops ?? []
    // this.filteredReferentiels = resolvedFinancial.data?.referentiels_programmation ?? [];
    this.annees = resolvedFinancial.data?.annees ?? [];
    this.refGeo = resolvedFinancial.data?.refGeo;
    this.qpvs = this.refGeo?.qpvs ?? [];
    this.filteredQPV.set(this.qpvs);

    // Création d'un prefilter avec la marque blanche
    const mb_hasParams = resolvedMarqueBlanche.data?.has_marqueblanche_params;
    const mb_prefilter = resolvedMarqueBlanche.data?.preFilters;
    this._preferenceService.setCurrentPrefilter(mb_prefilter ?? null);

    if (mb_hasParams) {
      this._logger.debug(`Mode marque blanche actif.`);
      if (mb_prefilter) {
        this._logger.debug(`Application des filtres`);
        this._preferenceService.setCurrentPrefilter(mb_prefilter);
        // Mapping du prefilter vers le formulaire
        const previousParams = this.searchDataService.searchParams();
        this._logger.debug("Paramètres avant application du prefilter marqueblanche : ", previousParams);
        this._ngOnInitOnMbSearchParams(mb_prefilter)
      }
    }
  }
  
  private _ngOnInitOnMbSearchParams(preFilter: PreFilters) {
      this._prefilterMapperService.mapAndResolvePrefiltersToSearchParams$(preFilter)
        .pipe(takeUntilDestroyed(this._destroy_ref))
        .subscribe(resolvedParams => {
          this._logger.debug("Paramètres APRES RESOLUTION des bénéficiaires du prefilter marqueblanche : ", resolvedParams);
          this.searchDataService.searchParams.set(resolvedParams);

          // Lancement de la recherche
          const resolvedMarqueBlanche = this._route.snapshot.data['mb_parsed_params'] as MarqueBlancheParsedParamsResolverModel;
          const mb_fullscreen = resolvedMarqueBlanche.data?.fullscreen ?? false;
          this.searchDataService.search(resolvedParams!)
            .pipe(
              takeUntilDestroyed(this._destroy_ref),
              tap(_ => {
                if (mb_fullscreen) {
                  this._logger.debug("Active le mode fullescreen comme demandé par la marque blanche");
                  this._gridFullscreen.toggleFullscreen();
                }
              })
            )
            .subscribe();
        })
  }

  /**
   * Retourne le ValidationErrors benefOrBopRequired
   */
  public get errorsBenefOrBop(): ValidationErrors | null {
    return this.formSearch.errors != null ? this.formSearch.errors['benefOrBopRequired'] : null;
  }

  public doSearch(): void {
    // Réinitialisation des résultats trouvés
    this.searchDataService.firstSearchDone.set(false);
    this.searchDataService.resetResults();
    this.searchDataService.selectedTab.set("0");
    // Récupération des infos du formulaire
    const formValue = this.formSearch.value;
    const search_parameters: SearchParameters = {
      ...this._searchParamsService.getEmpty(),
      bops: [{"code": "147"} as BopModel],
      years: formValue.annees || undefined,
      niveau: formValue.niveau || undefined,
      locations: formValue.localisations || undefined,
      code_qpv: formValue.qpv || undefined,
      centres_couts: formValue.financeurs || undefined,
      themes: formValue.thematiques || undefined,
      beneficiaires: formValue.porteurs || undefined,
      types_beneficiaires: formValue.types_porteur || undefined,
    };
    // Lancement de la recherche - le service traite automatiquement la réponse
    this.searchDataService.searchParams.set(search_parameters)
    this.searchDataService.searchInProgress.set(true);
    this.searchDataService.search(search_parameters).subscribe(() => {
      this.searchDataService.firstSearchDone.set(true);
    });
  }

  /**
   * Reset du formulaire
   */
  public reset(): void {
    this.searchDataService.searchInProgress.set(false);
    this.formSearch.reset();
  }

  private _filterQpvByTypeLocalisation(codes: string[], type: TypeLocalisation): RefQpvWithCommune[] {
    switch (type) {
      case TypeLocalisation.DEPARTEMENT:
        return this.qpvs.filter((qpv) => codes.includes(qpv.code_departement))
      case TypeLocalisation.EPCI:
        return this.qpvs.filter((qpv) => codes.includes(qpv.code_epci))
      case TypeLocalisation.COMMUNE:
      default:
        return this.qpvs.filter((qpv) => codes.includes(qpv.code_commune))
    }
  }

  public selectNiveauChange(): void {
    this.formSearch.get('qpv')?.reset();

    this.filteredQPV.set(this.refGeo?.qpvs as RefQpvWithCommune[]);
  }

  public selectLocalisationChange(event: GeoModel[] | null): void {
    this.formSearch.get('qpv')?.reset();

    if (event && event.length > 0) {
      const type = event[0].type;
      const codes = event.map(geo => geo.code);
      this.filteredQPV.set(this._filterQpvByTypeLocalisation(codes, type as TypeLocalisation));
    } else {
      this.filteredQPV.set(this.refGeo?.qpvs as RefQpvWithCommune[]);
    }
  }
  
}
