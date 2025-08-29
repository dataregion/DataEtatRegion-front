import { Component, ElementRef, inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

import { GridInFullscreenStateService } from 'apps/common-lib/src/lib/services/grid-in-fullscreen-state.service';
import {
  TableData,
  VirtualGroup
} from 'apps/grouping-table/src/lib/components/grouping-table/group-utils';
import { TableToolbarComponent } from './table-toolbar/table-toolbar.component';
import { DisplayDateComponent } from 'apps/common-lib/src/lib/components/display-date/display-date.component';
import { GroupsTableComponent } from './groups-table/groups-table.component';
import { LinesTableComponent } from './lines-tables/lines-table.component';
import { ActivatedRoute } from '@angular/router';
import { FinancialData, FinancialDataResolverModel } from '../../models/financial/financial-data-resolvers.models';
import { Preference } from 'apps/preference-users/src/lib/models/preference.models';
import { PreFilters } from '../../models/search/prefilters.model';
import { CommonModule } from '@angular/common';
import { SearchDataComponent } from './search-data/search-data.component';
import { ColonnesResolvedModel } from '@models/financial/colonnes.models';
import { ColonnesService } from '@services/colonnes.service';
import { QueryParam } from 'apps/common-lib/src/lib/models/marqueblanche/query-params.enum';
import { PreferenceUsersHttpService } from 'apps/preference-users/src/public-api';
import { AlertService } from 'apps/common-lib/src/public-api';
import { FinancialDataModel } from '@models/financial/financial-data.models';
import { AuditHttpService } from '@services/http/audit.service';
import { MarqueBlancheParsedParamsResolverModel } from '../../resolvers/marqueblanche-parsed-params.resolver';
import { PreferenceService } from '@services/preference.service';
import { Colonne, LignesResponse } from 'apps/clients/v3/financial-data';
import { ColonneFromPreference, ColonnesMapperService, ColonneTableau } from '@services/colonnes-mapper.service';
import { SearchResults, SearchDataService } from '@services/search-data.service';
import { PrefilterMapperService } from './search-data/prefilter-mapper.services';
import { ReferentielProgrammation } from '@models/refs/referentiel_programmation.model';
import { Bop } from '@models/search/bop.model';

@Component({
  selector: 'budget-home',
  templateUrl: './home.component.html',
  imports: [CommonModule, SearchDataComponent, TableToolbarComponent, GroupsTableComponent, LinesTableComponent, DisplayDateComponent],
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit {
  
  private _route = inject(ActivatedRoute);
  private _alertService = inject(AlertService);
  private _auditService = inject(AuditHttpService);
  private _colonnesService = inject(ColonnesService);
  private _colonnesMapperService = inject(ColonnesMapperService);
  private _httpPreferenceService = inject(PreferenceUsersHttpService);
  private _preferenceService = inject(PreferenceService);
  private _prefilterMapperService = inject(PrefilterMapperService);
  private _gridFullscreen = inject(GridInFullscreenStateService);
  private _searchDataService = inject(SearchDataService);

  @ViewChild('spinner', { static: false }) spinner!: ElementRef;

  lastImportDate: string | null = null;

  get grid_fullscreen() {
    return this._gridFullscreen.fullscreen;
  }

  get grouped(): boolean {
    return this._colonnesService.grouped
  }
  get searchInProgress() {
    return this._searchDataService.searchInProgress
  }
  get searchResults(): SearchResults {
    return this._searchDataService.searchResults;
  }

  ngOnInit() {
    // Resolve des colonnes (grouping et tableau)
    const resolvedFinancial = this._route.snapshot.data['financial'] as FinancialDataResolverModel;
    const resolvedColonnes = this._route.snapshot.data['colonnes'] as ColonnesResolvedModel;
    // On init le service de mapper après avoir resolve et set
    this._colonnesMapperService.initService(
      resolvedColonnes?.data?.colonnesTable ?? [],
      resolvedColonnes?.data?.colonnesGrouping ?? []
    )
    // Sauvegarde des colonnes après init
    this._colonnesService.allColonnesTable = this._colonnesMapperService.colonnes
    this._colonnesService.allColonnesGrouping = this._colonnesMapperService.colonnes.filter(c => c.grouping !== undefined)

    // Resolve des paramètres de marque blanche
    const resolvedMarqueBlanche = this._route.snapshot.data['mb_parsed_params'] as MarqueBlancheParsedParamsResolverModel;
    const mb_group_by = resolvedMarqueBlanche.data?.group_by;
    const mb_fullscreen = resolvedMarqueBlanche.data?.fullscreen;

    if (mb_fullscreen)
      this._gridFullscreen.fullscreen = !this.grid_fullscreen;
    if (mb_group_by && mb_group_by?.length > 0) {
      const mapped: ColonneTableau<FinancialDataModel>[] = this._colonnesMapperService.mapNamesFromPreferences(mb_group_by as ColonneFromPreference[])
      this._colonnesService.selectedColonnesGrouping = mapped;
    }

    // Aplication d'une préférence
    this._route.queryParams.subscribe((param) => {
      // Si une recherche doit être appliquée
      if (param[QueryParam.Uuid]) {
        this._httpPreferenceService.getPreference(param[QueryParam.Uuid]).subscribe((preference) => {
          // Application des préférences de grouping des colonnes
          if (preference.options && preference.options['grouping']) {
            const mapped: ColonneTableau<FinancialDataModel>[] = this._colonnesMapperService.mapNamesFromPreferences(preference.options['grouping'] as ColonneFromPreference[])
            this._colonnesService.selectedColonnesGrouping = mapped;
          }
          // Application des préférences d'ordre et d'affichage des colonnes
          if (preference.options && preference.options['displayOrder']) {
            const mapped: ColonneTableau<FinancialDataModel>[] = this._colonnesMapperService.mapLabelsFromPreferences(preference.options['displayOrder'] as ColonneFromPreference[])
            this._colonnesService.selectedColonnesTable = mapped;
          }

          // Mapping des filtres de la préférences dans searchParams
          this._alertService.openInfo(`Application du filtre ${preference.name}`);
          const themes: string[] = resolvedFinancial.data?.themes ?? [];
          const programmes: Bop[] = resolvedFinancial.data?.bop ?? [];
          const referentiels: ReferentielProgrammation[] = resolvedFinancial.data?.referentiels_programmation ?? [];
          const annees: number[] = resolvedFinancial.data?.annees ?? [];
          this._prefilterMapperService.initService(themes, programmes, referentiels, annees)
          this._searchDataService.searchParams = this._prefilterMapperService.mapToSearchParams(preference.filters as PreFilters)
        });
      }
    });

    // Récupération de la dernière date d'import
    this._auditService.getLastDateUpdateData().subscribe((response) => {
      if (response.date) {
        this.lastImportDate = response.date;
      }
    });
  }

  ngAfterViewChecked() {
  }

  hasNext() {
    return this._searchDataService.pagination?.has_next
  }

  loadNextPage() {
    console.log("==> LOAD NEXT PAGE");
    if (this._searchDataService.searchParams) {
      this._searchDataService.searchParams.page += 1 
      this._searchDataService.search().subscribe({
        next: (response: LignesResponse) => {
          console.log("==> Résultat de la recherche");
          console.log(response);
          if (response.code == 204 && !response.data) {
            this._searchDataService.searchResults = []
            return
          }
          if (response.data?.type === 'groupings') {
            this._searchDataService.searchResults = response.data?.groupings;
          } else if (response.data?.type === 'lignes_financieres') {
            this._searchDataService.searchResults = response.data?.lignes.map(r => this._searchDataService.unflatten(r)) ?? [];
          }
          this._searchDataService.pagination = response.pagination;
        },
        error: (err: unknown) => {
          console.error("Erreur lors de la recherche :", err);
        }
      });
    }
  }
}
