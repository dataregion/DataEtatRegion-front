import { Component, inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

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
import { AuditHttpService } from '@services/audit.service';
import { MarqueBlancheParsedParamsResolverModel } from '../../resolvers/marqueblanche-parsed-params.resolver';
import { PreferenceService } from 'apps/preference-users/src/lib/services/preference.service';
import { Colonne } from 'apps/clients/v3/financial-data';
import { ColonneFromPreference, ColonnesMapperService, ColonneTableau } from '@services/colonnes-mapper.service';

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
  private _gridFullscreen = inject(GridInFullscreenStateService);

  newFilter?: Preference;
  preFilter?: PreFilters;
  
  lastImportDate: string | null = null;

  financial?: FinancialData;
  searchData: FinancialDataModel[] = []

  get grid_fullscreen() {
    return this._gridFullscreen.fullscreen;
  }

  get grouped(): boolean {
    return this._colonnesService.getGrouped()
  }

  ngOnInit() {
    // Resolve des données pour le formulaire
    const resolved = this._route.snapshot.data['financial'] as FinancialDataResolverModel;
    this.financial = resolved?.data;

    // Resolve des colonnes (grouping et tableau)
    const resolvedColonnes = this._route.snapshot.data['colonnes'] as ColonnesResolvedModel;
    // On init le service de mapper après avoir resolve et set
    this._colonnesMapperService.initService(
      resolvedColonnes?.data?.colonnesTable ?? [],
      resolvedColonnes?.data?.colonnesGrouping ?? []
    )
    // Sauvegarde des colonnes après init
    this._colonnesService.setAllColonnesTable(this._colonnesMapperService.colonnes)
    this._colonnesService.setAllColonnesGrouping(this._colonnesMapperService.colonnes.filter(c => c.grouping !== undefined))

    // Resolve des paramètres de marque blanche
    const resolvedMarqueBlanche = this._route.snapshot.data['mb_parsed_params'] as MarqueBlancheParsedParamsResolverModel;
    const mb_group_by = resolvedMarqueBlanche.data?.group_by;
    const mb_fullscreen = resolvedMarqueBlanche.data?.fullscreen;

    if (mb_fullscreen)
      this._gridFullscreen.fullscreen = !this.grid_fullscreen;
    if (mb_group_by && mb_group_by?.length > 0) {
      const mapped: ColonneTableau<FinancialDataModel>[] = this._colonnesMapperService.mapNamesFromPreferences(mb_group_by as ColonneFromPreference[])
      this._colonnesService.setSelectedColonnesGrouping(mapped);
    }


    // Aplication d'une préférence
    this._route.queryParams.subscribe((param) => {
      // Si une recherche doit être appliquée
      if (param[QueryParam.Uuid]) {
        this._httpPreferenceService.getPreference(param[QueryParam.Uuid]).subscribe((preference) => {
          // Sauvegarde dans un service
          this._preferenceService.setCurrentPreference(preference)
          this.preFilter = preference.filters;

          // Application des préférences de grouping des colonnes
          if (preference.options && preference.options['grouping']) {
            const mapped: ColonneTableau<FinancialDataModel>[] = this._colonnesMapperService.mapNamesFromPreferences(preference.options['grouping'] as ColonneFromPreference[])
            this._colonnesService.setSelectedColonnesGrouping(mapped);
          }

          // Application des préférences d'ordre et d'affichage des colonnes
          if (preference.options && preference.options['displayOrder']) {
            const mapped: ColonneTableau<FinancialDataModel>[] = this._colonnesMapperService.mapLabelsFromPreferences(preference.options['displayOrder'] as ColonneFromPreference[])
            this._colonnesService.setSelectedColonnesTable(mapped);
          }

          this._alertService.openInfo(`Application du filtre ${preference.name}`);
        });
      } else {
          this._preferenceService.setCurrentPreference(null)
      }
    });

    // Récupération de la dernière date d'import
    this._auditService.getLastDateUpdateData().subscribe((response) => {
      if (response.date) {
        this.lastImportDate = response.date;
      }
    });
  }

}
