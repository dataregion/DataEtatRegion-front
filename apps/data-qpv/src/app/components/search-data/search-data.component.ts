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
  BehaviorSubject,
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
import { AdditionalSearchParameters, empty_additional_searchparams } from './additional-searchparams';
import { SearchForm } from './search-form.interface';
import {
  GeoLocalisationComponentService
} from "../../../../../common-lib/src/lib/components/localisation/geo.localisation.componentservice";
import {QpvSearchArgs} from "../../models/qpv-search/qpv-search.models";


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


  public additional_searchparams: AdditionalSearchParameters = empty_additional_searchparams;

  public annees: number[] = [];
  public qpvs: GeoModel[] = [];



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
  get selectedZone() : TypeLocalisation | null {
    return this.searchForm.get('zone')?.value ?? null;
  }
  set selectedZone(data: TypeLocalisation | null) {
    this.searchForm.get('zone')?.setValue(data ?? null);
  }

  get defaultNiveauQpv() : TypeLocalisation | null {
    return TypeLocalisation.QPV
  }

  get selectedLocalisation() : GeoModel[] | null {
    return this.searchForm.get('localisation')?.value ?? null;
  }
  set selectedLocalisation(data: GeoModel[] | null) {
    this.searchForm.get('localisation')?.setValue(data ?? null);
  }

  /**
   * QPV
   */
  get selectedQpv() : any | null {
    const annees = this.searchForm.get('qpv')?.value;
    return annees && annees.length != 0 ? annees : null;
  }
  set selectedQpv(data: any | null) {
    this.searchForm.get('qpv')?.setValue(data ?? null);
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
  @Output() searchResultsEventEmitter = new EventEmitter<QpvSearchArgs>();

  /**
   * Les donnees de la recherche
   */
  private _searchResult: QpvSearchArgs | null = null;
  searchResult(): QpvSearchArgs | null {
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
  ) {
    // Formulaire avc champs déclarés dans l'ordre
    this.searchForm = new FormGroup<SearchForm>({
      annees: new FormControl<number[]>([], {
        validators: [
          Validators.min(2000),
          Validators.max(new Date().getFullYear()),
        ],
      }),
      zone: new FormControl<TypeLocalisation | null>(null),
      localisation: new FormControl<GeoModel[] | null>({ value: null, disabled: false }, []),
      qpv: new FormControl<any | null>(null),
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
    this.annees = financial.annees;

    if (!mb_has_params)
      return

    this._logger.debug(`Mode marque blanche actif.`)
    if (mb_prefilter) {
      this._logger.debug(`Application des filtres`);
      this.preFilter = mb_prefilter;
    }
  }

  ngOnInit(): void {
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

    this.searchFinish = true;
    this.currentFilter.next(this._buildPreference(formValue as JSONObject));

    let newQpvSearchArgsObject: QpvSearchArgs = {
      qpv_codes: [],  // Example string values
      annees: []  // Example number values
    };

    if(formValue.localisation) {
      for(const loc of formValue.localisation) {
        if(loc.type === 'QPV') {
          newQpvSearchArgsObject.qpv_codes.push(loc.code);
        }
      }
    }

    if(formValue.annees) {
      newQpvSearchArgsObject.annees = formValue.annees;
    }

    this.searchResultsEventEmitter.next(newQpvSearchArgsObject);
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


  /** Applique les filtres selectionnés au préalable*/
  private _apply_prefilters(preFilter?: PreFilters) {
    if (preFilter == null)
      return

    if (preFilter.annees) {
      this.selectedAnnees = preFilter.annees
    }

    if (preFilter.localisation) {
      this.selectedLocalisation = preFilter.localisation as unknown as GeoModel[]
      this.selectedZone = this.selectedLocalisation != null ? this.selectedLocalisation.map(gm => gm.type)[0] as TypeLocalisation : null;
    }

    if (preFilter.qpv) {
      this.selectedQpv = preFilter.qpv
    }

    // lance la recherche pour afficher les resultats
    this.doSearch();
  }

}
