import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  BehaviorSubject,
  debounceTime,
  filter,
  Observable,
  of,
  startWith,
  switchMap,
  tap
} from 'rxjs';
import { AlertService, GeoModel, TypeLocalisation } from 'apps/common-lib/src/public-api';
import { MarqueBlancheParsedParamsResolverModel } from '../../../resolvers/marqueblanche-parsed-params.resolver';
import { AdvancedChipsMultiselectComponent, SelectedData } from 'apps/common-lib/src/lib/components/advanced-chips-multiselect/advanced-chips-multiselect.component';
import { LoggerService } from 'apps/common-lib/src/lib/services/logger.service';
import { SearchParameters, SearchParamsService } from '../../../services/search-params.service';
import { Beneficiaire } from '../../../models/search/beneficiaire.model';
import { Bop } from '../../../models/search/bop.model';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { SelectMultipleComponent } from 'apps/common-lib/src/lib/components/select-multiple/select-multiple.component';
import { LocalisationComponent } from 'apps/common-lib/src/lib/components/localisation/localisation.component';
import { BopsReferentielsComponent } from 'apps/common-lib/src/lib/components/bops-referentiels/bops-referentiels.component';
import { FinancialDataResolverModel } from '../../../models/financial/financial-data-resolvers.models';
import { MatButtonModule } from '@angular/material/button';
import { PrefilterMapperService } from './prefilter-mapper.services';

import { SearchDataService } from '@services/search-data.service';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { GridInFullscreenStateService } from 'apps/common-lib/src/lib/services/grid-in-fullscreen-state.service';
import { PreferenceResolverModel } from '@models/preference/preference-resolver.models';
import { AutocompleteTagsService, TagFieldData } from 'apps/budget-dataetat/src/app/components/home/search-data/autocomplete/autocomplete-tags.service';
import { AutocompleteBeneficiaireService, BeneficiaireFieldData } from 'apps/appcommon/src/lib/autocomplete/autocomplete-beneficiaire.service';
import { ReferentielProgrammation } from 'apps/common-lib/src/lib/models/refs/referentiel_programmation.model';
import { OtherTypeCategorieJuridique, SearchTypeCategorieJuridique, TypeCategorieJuridique } from 'apps/common-lib/src/lib/models/refs/common.models';
import { BopModel } from 'apps/common-lib/src/lib/models/refs/bop.models';
import { tag_fullname } from '@models/refs/tag.model';


/**
 * Interface du formulaire de recherche
 */
export interface FormSearch {
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
  imports: [MatIconModule, ReactiveFormsModule, MatButtonModule, CommonModule, BopsReferentielsComponent, AdvancedChipsMultiselectComponent, LocalisationComponent, SelectMultipleComponent]
})
export class SearchDataComponent implements OnInit {

  private _destroy_ref = inject(DestroyRef);
  private _route = inject(ActivatedRoute);

  private _prefilterMapperService = inject(PrefilterMapperService);
  private _searchParamsService = inject(SearchParamsService);
  private _logger = inject(LoggerService).getLogger(SearchDataComponent.name);
  private _autocompleteBeneficiaires = inject(AutocompleteBeneficiaireService);
  private _autocompleteTags = inject(AutocompleteTagsService);
  private _gridFullscreen = inject(GridInFullscreenStateService);
  private _alertService = inject(AlertService);


  public searchDataService = inject(SearchDataService);


  /**
   * Formulaire de recherche
   */
  public formSearch: FormGroup<FormSearch> = new FormGroup<FormSearch>({
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
  public annees: number[] = [];
  public filteredBops: BopModel[] = [];
  public filteredReferentiels: ReferentielProgrammation[] = [];
  public searchFinish: boolean = false;

  /**
   * Thèmes, Programmes, Référentiels programmation
   */
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


  constructor() {
    // Renseigne le formulaire à chaque changement des paramètres de recherche
    toObservable(this.searchDataService.searchParams)
      .pipe(
        takeUntilDestroyed(this._destroy_ref),
        filter(p => p !== undefined),
      )
      .subscribe(params => {
        this._logger.debug("==> Mapping des paramètres vers le formulaire");
        const formSearch = this._prefilterMapperService.mapSearchParamsToForm(params!);
        this.formSearch = formSearch;
      });
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
    const resolvedPreference = this._route.snapshot.data['preference'] as PreferenceResolverModel;

    // Sauvegarde des référentiels dans les listes
    this.bops = resolvedFinancial.data?.bop ?? [];
    this.filteredBops = this.bops ?? []
    this.filteredReferentiels = resolvedFinancial.data?.referentiels_programmation ?? [];
    this.annees = resolvedFinancial.data?.annees ?? [];

    this._logger.debug('resolvedMarqueBlanche => ', resolvedMarqueBlanche);
    this._logger.debug('resolvedPreference => ', resolvedPreference);
    if (resolvedMarqueBlanche.data?.has_marqueblanche_params) {
      this._logger.debug(`Mode marque blanche actif.`);

      this.searchDataService.searchFromMarqueBlanche(resolvedMarqueBlanche.data).pipe(
        takeUntilDestroyed(this._destroy_ref),
        tap(_ => {
          const mb_fullscreen = resolvedMarqueBlanche.data?.fullscreen ?? false;
          if (mb_fullscreen) {
            this._logger.debug("Active le mode fullscreen comme demandé par la marque blanche");
            this._gridFullscreen.toggleFullscreen();
          }
        })
      )
        .subscribe();

    } else if (resolvedPreference.data) {
      this._logger.debug("==> Préférence chargée depuis le resolver", resolvedPreference.data);

      // Traitement de la préférence brute
      this.searchDataService.searchFromPreference(resolvedPreference.data)
        .subscribe(() => {
          this._alertService.openInfo(`Application du filtre ${resolvedPreference.data!.name}`);
        });
    }
  }

  /**
   * Retourne le ValidationErrors benefOrBopRequired
   */
  public get errorsBenefOrBop(): ValidationErrors | null {
    return this.formSearch.errors != null ? this.formSearch.errors['benefOrBopRequired'] : null;
  }

  public doSearch(): void {
    // Récupération des infos du formulaire
    const formValue = this.formSearch.value;
    const search_parameters: SearchParameters = {
      ...this._searchParamsService.getEmpty(),
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
    };
    // Lancement de la recherche - le service traite automatiquement la réponse
    this.searchDataService.flatSearchFromScratch(search_parameters).subscribe();
  }

  /**
   * Reset du formulaire
   */
  public reset(): void {
    this.searchDataService.searchInProgress.set(false);
    this.formSearch.reset();
  }

}
