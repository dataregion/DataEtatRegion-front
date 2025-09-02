import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, inject, OnDestroy, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { FinancialDataModel } from '@models/financial/financial-data.models';
import { ColonneTableau } from '@services/colonnes-mapper.service';
import { ColonnesService } from '@services/colonnes.service';
import { SearchDataService, SearchResults } from '@services/search-data.service';
import { NumberFormatPipe } from "./number-format.pipe";
import { SearchParameters } from '@services/search-params.service';


@Component({
  selector: 'budget-lines-table',
  templateUrl: './lines-table.component.html',
  imports: [CommonModule, NumberFormatPipe],
  styleUrls: ['./lines-table.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LinesTableComponent implements OnInit, AfterViewInit, OnDestroy {

  private _colonnesService: ColonnesService = inject(ColonnesService)
  private _searchDataService: SearchDataService = inject(SearchDataService)
  
  currentColonnes: ColonneTableau<FinancialDataModel>[] = []
  currentLignes: FinancialDataModel[] = []

  @ViewChild('spinner', { static: false }) spinner!: ElementRef;

  private observer!: IntersectionObserver;
  get searchInProgress() {
    return this._searchDataService.searchInProgress
  }

  getTotal() {
    return this._searchDataService.total
  }

  ngOnInit(): void {
    this._colonnesService.selectedColonnesTable$.subscribe((selected) => {
      this.currentColonnes = selected.length !== 0 ? selected : this._colonnesService.allColonnesTable
    });
    this._searchDataService.searchResults$.subscribe((selected: SearchResults) => {
      this.currentLignes = selected as FinancialDataModel[]
    });
  }

  ngAfterViewInit() {
    // observe loader visibility
    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          console.log('Spinner is visible!');
          const newPage = (this._searchDataService.pagination?.current_page ?? 0) + 1
          this._searchDataService.searchParams = {
            ...this._searchDataService.searchParams,
            page: newPage
          } as SearchParameters;
        }
      });
    });

    if (this.spinner) {
      this.observer.observe(this.spinner.nativeElement);
    }
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  @Output() rowClick = new EventEmitter<FinancialDataModel>();

  onRowClick(line: FinancialDataModel) {
    this._searchDataService.selectedLine = line
  }

  hasNext() {
    return this._searchDataService.pagination?.has_next
  }

}
