import { inject, Injectable, OnInit } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { ColonnesResolved, ColonnesResolvedModel } from '@models/financial/colonnes.models';
import { LocalisationInterministerielle } from '@models/financial/common.models';
import { FinancialDataModel } from '@models/financial/financial-data.models';
import { Colonne } from 'apps/clients/v3/financial-data';
import { JSONObject } from 'apps/common-lib/src/lib/models/jsonobject';
import { Optional } from 'apps/common-lib/src/lib/utilities/optional.type';
import { BehaviorSubject } from 'rxjs';
import { ColonneTableau } from './colonnes-mapper.service';


@Injectable({ providedIn: 'root' })
export class ColonnesService {

  private _route = inject(ActivatedRoute)
  
  /**
   * Sauvegarde et partage des noms des colonnes du back
   */
  private groupedSubject = new BehaviorSubject<Boolean>(false);
  grouped$ = this.groupedSubject.asObservable();

  private colonnesTableSubject = new BehaviorSubject<ColonneTableau<FinancialDataModel>[]>([]);
  colonnesTable$ = this.colonnesTableSubject.asObservable();

  private selectedColonnesTableSubject = new BehaviorSubject<ColonneTableau<FinancialDataModel>[]>([]);
  selectedColonnesTable$ = this.selectedColonnesTableSubject.asObservable();

  private colonnesGroupingSubject = new BehaviorSubject<ColonneTableau<FinancialDataModel>[]>([]);
  colonnesGrouping$ = this.colonnesGroupingSubject.asObservable();
  
  private selectedColonnesGroupingSubject = new BehaviorSubject<ColonneTableau<FinancialDataModel>[]>([]);
  selectedColonnesGrouping$ = this.selectedColonnesGroupingSubject.asObservable();

  getGrouped(): boolean {
    return this.selectedColonnesGroupingSubject.value.length != 0;
  }

  getAllColonnesTable(): ColonneTableau<FinancialDataModel>[] {
    return this.colonnesTableSubject.value;
  }

  setAllColonnesTable(cols: ColonneTableau<FinancialDataModel>[]) {
    this.colonnesTableSubject.next(cols);
  }

  getSelectedColonnesTable(): ColonneTableau<FinancialDataModel>[] {
    return this.selectedColonnesTableSubject.value;
  }

  setSelectedColonnesTable(cols: ColonneTableau<FinancialDataModel>[]) {
    this.selectedColonnesTableSubject.next(cols);
  }

  getAllColonnesGrouping(): ColonneTableau<FinancialDataModel>[] {
    return this.colonnesGroupingSubject.value;
  }

  setAllColonnesGrouping(cols: ColonneTableau<FinancialDataModel>[]) {
    this.colonnesGroupingSubject.next(cols);
  }

  getSelectedColonnesGrouping(): ColonneTableau<FinancialDataModel>[] {
    return this.selectedColonnesGroupingSubject.value;
  }

  setSelectedColonnesGrouping(cols: ColonneTableau<FinancialDataModel>[]) {
    this.selectedColonnesGroupingSubject.next(cols);
  }

}
