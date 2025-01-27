import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from 'apps/common-lib/src/public-api';
import { Preference } from 'apps/preference-users/src/lib/models/preference.models';
import { JSONObject } from 'apps/common-lib/src/lib/models/jsonobject';
import {
  BehaviorSubject,
  debounceTime,
  finalize,
  Observable,
  of,
  startWith,
  switchMap
} from 'rxjs';
import { SousAxePlanRelance, SousAxePlanRelanceForFilter } from '../models/axe.models';
import { Structure } from '../models/structure.models';
import { Territoire } from '../models/territoire.models';
import { LaureatHttpService } from '../services/laureat.http.service';
import { SearchParameters, SearchResults } from '../services/abstract-laureats.http.service';
import { _FiltreLocalisation } from './_FiltreLocalisation';
import { FrontLaureat } from '../models/laureat.models';
import { ExportDataService } from 'apps/appcommon/src/lib/export-data.service';
import { Optional } from 'apps/common-lib/src/lib/utilities/optional.type';

@Component({
    selector: 'france-relance-search-data',
    templateUrl: './search-data.component.html',
    styleUrls: ['./search-data.component.scss'],
    standalone: false
})
export class SearchDataComponent implements OnInit, OnChanges {
  public separatorKeysCodes: number[] = [ENTER, COMMA];

  warningMessage?: string;

  /**
   * Resultats de la recherche.
   */
  _searchResults: Optional<FrontLaureat[]> = null;
  @Output() searchResults = new EventEmitter<FrontLaureat[]>();

  /**
   * Resultats de la recherche.
   */
  @Output() currentFilter = new EventEmitter<Preference>();

  @Input()
  preFilter: JSONObject | null = null;

  public searchForm!: FormGroup;

  public filteredTerritoire: Observable<Territoire[]> | null | undefined;

  public filteredLaureat: Observable<Structure[]> | null | undefined;

  public filteredLocalisation: _FiltreLocalisation = new _FiltreLocalisation();

  /**
   * Indique si la recherche est en cours
   */
  public searchInProgress = new BehaviorSubject(false);

  /**
   * Indique si la recherche a été effectué
   */
  public searchFinish = false;

  public axe_plan_relance: SousAxePlanRelanceForFilter[] = [];

  @ViewChild('filterTerritoireInput')
  filterTerritoireInput!: ElementRef<HTMLInputElement>;

  public constructor(
    private _route: ActivatedRoute,
    private _alertService: AlertService,
    private _service: LaureatHttpService,
    private _exportService: ExportDataService
  ) {}

  /**
   * Applique le filtre par défaut
   * @param _changes
   */
  ngOnChanges(_changes: SimpleChanges): void {
    if (this.preFilter !== null) {
      if (this.preFilter['axe_plan_relance']) {
        const preFilterAxe = Array.isArray(this.preFilter['axe_plan_relance'])
          ? (this.preFilter['axe_plan_relance'] as unknown as SousAxePlanRelance[])
          : ([this.preFilter['axe_plan_relance']] as unknown as SousAxePlanRelance[]);
        const axeSelected = this.axe_plan_relance.filter(
          (axe) =>
            preFilterAxe.findIndex(
              (preFilterAxe) => preFilterAxe.axe === axe.axe && preFilterAxe.label === axe.label
            ) !== -1
        );
        this.searchForm.controls['axe_plan_relance'].setValue(axeSelected);
      }

      this.searchForm.controls['structure'].setValue(this.preFilter['structure'] ?? null);

      this.filteredLocalisation.fromPreFilter(this.preFilter);

      // lance la recherche pour afficher les resultats
      this.doSearch();
    }
  }

  ngOnInit(): void {
    // récupération des themes dans le resolver
    this._route.data.subscribe(
      (response: { axes: SousAxePlanRelanceForFilter[] | Error } | any) => {
        this.axe_plan_relance = response.axes;
      }
    );
    this._initForm();
  }

  public cancelAxe(): void {
    this.searchForm.controls['axe_plan_relance'].setValue(null);
  }

  public get axePlanDeRelanceControls(): FormControl {
    return this.searchForm.controls['axe_plan_relance'] as FormControl;
  }

  public doSearch(): void {
    this.searchForm.markAllAsTouched(); // pour notifier les erreurs sur le formulaire
    if (this.searchForm.valid && !this.searchInProgress.value) {
      const formValue = this.searchForm.value;
      this.searchInProgress.next(true);

      const sp: SearchParameters = {
        axes: formValue.axe_plan_relance,
        structure: formValue.structure,

        niveau: null,
        territoires: null
      };
      this.filteredLocalisation.updateSearchParams(sp);

      this._service
        .searchLaureats(sp)
        .pipe(
          finalize(() => {
            this.searchInProgress.next(false);
          })
        )
        .subscribe({
          next: (payload: SearchResults) => {
            const laureats = payload.resultats;
            this.warningMessage = payload.messages_utilisateur.join('\n');
            this.searchFinish = true;
            this.currentFilter.next(this._buildPreference(formValue));
            this._searchResults = laureats;
            this.searchResults.next(laureats);
          },
          error: (err: Error) => {
            this.searchFinish = true;
            this.currentFilter.next(this._buildPreference(formValue));
            this.searchResults.next([]);
            this._alertService.openAlert('error', err, 8);
          }
        });
    }
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
        (object[key] !== null &&
          object[key] !== undefined &&
          object[key] !== '' &&
          !Array.isArray(object[key])) ||
        (Array.isArray(object[key]) && (object[key] as Array<unknown>).length > 0)
      ) {
        preference.filters[key] = object[key];
      }
    });
    return preference;
  }

  public reset(): void {
    this.searchFinish = false;
    this.searchForm.reset();
    this.filteredLocalisation.reset();
  }

  public onSelectLaureat(_event: Structure): void {}

  public displayLaureat(laureat: Structure): string {
    if (laureat) return laureat.label + ' - ' + laureat.siret;
    return '';
  }

  private _initForm(): void {
    this.searchForm = new FormGroup({
      // XXX d'autres controles pour la localisation initialisés plus bas

      axe_plan_relance: new FormControl(null),
      structure: new FormControl(null),
      filterTerritoire: new FormControl(null) // pour le filtre des territoires
    });
    this.filteredLocalisation.initAndSynchonizeFormGroup(this.searchForm);

    // filtre beneficiaire
    this.filteredTerritoire = this.searchForm.controls['filterTerritoire'].valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      switchMap((value) => {
        if (value && value.length > 3) {
          return this._service.searchTerritoire(value);
        }
        return of([]);
      })
    );

    // filtre laureat
    this.filteredLaureat = this.searchForm.controls['structure'].valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      switchMap((value) => {
        if (value && value.length > 3) {
          return this._service.searchStructure(value);
        }
        return of([]);
      })
    );
  }
}
