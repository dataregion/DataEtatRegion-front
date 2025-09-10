import { CommonModule } from '@angular/common';
import { Component, effect, ElementRef, inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FinancialDataModel } from '@models/financial/financial-data.models';
import { ColonneTableau } from '@services/colonnes-mapper.service';
import { ColonnesService } from '@services/colonnes.service';
import { SearchDataService, SearchResults } from '@services/search-data.service';
import { NumberFormatPipe } from "./number-format.pipe";
import { SearchParameters } from '@services/search-params.service';


// TODO : Search bar
@Component({
  selector: 'budget-lines-table',
  templateUrl: './lines-table.component.html',
  imports: [CommonModule, NumberFormatPipe],
  styleUrls: ['./lines-table.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LinesTableComponent implements OnInit, OnDestroy {

  private _colonnesService: ColonnesService = inject(ColonnesService)
  private _searchDataService: SearchDataService = inject(SearchDataService)
  
  currentColonnes: ColonneTableau<FinancialDataModel>[] = []
  currentLignes: FinancialDataModel[] = []

  @ViewChild('spinner')
  set spinnerRef(el: ElementRef<HTMLDivElement> | undefined) {
    if (el) {
      this.observeSpinner(el);
    }
  }

  private observer!: IntersectionObserver;

  get searchInProgress() {
    return this._searchDataService.searchInProgress
  }

  constructor() {
    effect(() => {
      this.currentLignes = this._searchDataService.searchResults() as FinancialDataModel[]
    });
  }

  getTotal() {
    return this._searchDataService.total();
  }


  ngOnInit(): void {
    //TODO supprimer par signals
    this._colonnesService.selectedColonnesTable$.subscribe((selected) => {
      this.currentColonnes = selected.length !== 0 ? selected : this._colonnesService.allColonnesTable
    });
  }

  private observeSpinner(el: ElementRef<HTMLDivElement>) {
    if (this.observer) {
      this.observer.disconnect(); // cleanup old one if any
    }

    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this._searchDataService.searchInProgress()) {
          const newPage = (this._searchDataService.pagination()?.current_page ?? 0) + 1;
          console.log("spinner visible, new page", newPage);

          this._searchDataService.searchParams.set({
            ...this._searchDataService.searchParams(),
            page: newPage
          } as SearchParameters);
        }
      });
    });

    this.observer.observe(el.nativeElement);
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  onRowClick(line: FinancialDataModel) {
    this._searchDataService.selectedLine.set(line);
  }

  hasNext() {
    return this._searchDataService.pagination()?.has_next;
  }

}
