import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FinancialDataModel } from '@models/financial/financial-data.models';
import { ColonneTableau } from '@services/colonnes-mapper.service';
import { ColonnesService } from '@services/colonnes.service';
import { SearchDataService, SearchResults } from '@services/search-data.service';


@Component({
  selector: 'budget-lines-table',
  templateUrl: './lines-table.component.html',
  imports: [CommonModule],
  styleUrls: ['./lines-table.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LinesTableComponent implements OnInit {

  private _colonnesService: ColonnesService = inject(ColonnesService)
  private _searchDataService: SearchDataService = inject(SearchDataService)
  
  currentColonnes: ColonneTableau<FinancialDataModel>[] = []
  currentLignes: FinancialDataModel[] = []

  ngOnInit(): void {
    this._colonnesService.selectedColonnesTable$.subscribe((selected) => {
      this.currentColonnes = selected
    });
    this._searchDataService.searchResults$.subscribe((selected: SearchResults) => {
      this.currentLignes = selected as FinancialDataModel[]
    });
  }

}
