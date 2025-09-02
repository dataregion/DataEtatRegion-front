import { Injectable } from '@angular/core';
import { FinancialDataModel } from '@models/financial/financial-data.models';
import { BehaviorSubject } from 'rxjs';
import { ColonneTableau } from '@services/colonnes-mapper.service';


@Injectable({ providedIn: 'root' })
export class ColonnesService {

  private groupedSubject = new BehaviorSubject<boolean>(false);
  grouped$ = this.groupedSubject.asObservable();
  get grouped(): boolean {
    return this.selectedColonnesGrouping.length != 0 && this.selectedColonnesGrouping.length != this.selectedColonnesGrouped.length;
  }

  /**
   * Toutes les colonnes possibles pour le tableau
   */
  private colonnesTableSubject = new BehaviorSubject<ColonneTableau<FinancialDataModel>[]>([]);
  colonnesTable$ = this.colonnesTableSubject.asObservable();
  get allColonnesTable(): ColonneTableau<FinancialDataModel>[] {
    return this.colonnesTableSubject.value;
  }
  set allColonnesTable(cols: ColonneTableau<FinancialDataModel>[]) {
    this.colonnesTableSubject.next(cols);
  }

  /**
   * Colonnes actuellement affichées dans le tableau
   */
  private selectedColonnesTableSubject = new BehaviorSubject<ColonneTableau<FinancialDataModel>[]>([]);
  selectedColonnesTable$ = this.selectedColonnesTableSubject.asObservable();
  get selectedColonnesTable(): ColonneTableau<FinancialDataModel>[] {
    return this.selectedColonnesTableSubject.value;
  }
  set selectedColonnesTable(cols: ColonneTableau<FinancialDataModel>[]) {
    this.selectedColonnesTableSubject.next(cols);
  }

  /**
   * Toutes les colonnes possibles pour le grouping
   */
  private colonnesGroupingSubject = new BehaviorSubject<ColonneTableau<FinancialDataModel>[]>([]);
  colonnesGrouping$ = this.colonnesGroupingSubject.asObservable();
  get allColonnesGrouping(): ColonneTableau<FinancialDataModel>[] {
    return this.colonnesGroupingSubject.value;
  }
  set allColonnesGrouping(cols: ColonneTableau<FinancialDataModel>[]) {
    this.colonnesGroupingSubject.next(cols);
  }
  
  /**
   * Colonnes actuellement utilisées pour le grouping
   */
  private selectedColonnesGroupingSubject = new BehaviorSubject<ColonneTableau<FinancialDataModel>[]>([]);
  selectedColonnesGrouping$ = this.selectedColonnesGroupingSubject.asObservable();
  get selectedColonnesGrouping(): ColonneTableau<FinancialDataModel>[] {
    return this.selectedColonnesGroupingSubject.value;
  }
  set selectedColonnesGrouping(cols: ColonneTableau<FinancialDataModel>[]) {
    this.selectedColonnesGroupingSubject.next(cols);
  }
  
  /**
   * Colonnes actuellement utilisées pour le grouped
   */
  private selectedColonnesGroupedSubject = new BehaviorSubject<string[]>([]);
  selectedColonnesGrouped$ = this.selectedColonnesGroupingSubject.asObservable();
  get selectedColonnesGrouped(): string[] {
    return this.selectedColonnesGroupedSubject.value;
  }
  set selectedColonnesGrouped(cols: string[]) {
    this.selectedColonnesGroupedSubject.next(cols);
  }

}
