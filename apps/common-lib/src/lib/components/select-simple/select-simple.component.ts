import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { FormsModule, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { debounceTime, Observable } from 'rxjs';

/**
 * Select simple paramétrable
 */
@Component({
    selector: 'lib-select-simple',
    templateUrl: './select-simple.component.html',
    styleUrls: ['./select-simple.component.scss'],
    imports: [
        CommonModule,
        MatIconModule,
        MatAutocompleteModule,
        MatFormFieldModule,
        MatSelectModule,
        FormsModule,
        ReactiveFormsModule,
        MatTooltipModule,
        NgFor,
        MatInputModule,
        MatButtonModule,
        MatCheckboxModule
    ]
})
export class SelectSimpleComponent<T> implements OnInit, OnChanges {
  // Filtre sur les options ?
  @Input() canFilter: boolean = true;

  @Input() canClear: boolean = true;

  // Attributes
  @Input() class: string = '';
  @Input() placeholder: string = '';
  @Input() error: ValidationErrors | null = null;

  // Options
  @Input() options: T[] | null = [];
  filteredOptions: T[] | null = [];
  @Output() selectedChange = new EventEmitter<T | null>();
  filterInput: string = '';
  // Icon prefix
  @Input() icon: string = '';

  // Options sélectionnées
  private _selected: T | null = null;

  public get selected(): T | null {
    return this._selected;
  }

  @Input()
  public set selected(value: T | null) {
    this._selected = value;
  }

  /**
   * Fonction de filtrage par défaut, peut-être remplacée par injection
   * @param text input utilisateur utilisé pour filtrer
   */
  @Input()
  getFilteredOptions(text: string): Observable<T[]> {
    // Filtre par défaut
    return new Observable((subscriber) => {
      const filteredOptions = this.options
        ? this.options?.filter((opt) => {
            const optStr = opt ? opt.toString().toLowerCase() : '';
            return optStr.includes(text.toLowerCase());
          })
        : [];
      subscriber.next(filteredOptions);
    });
  }

  /**
   * Fonction de rendu des options sélectionnées par défaut, peut-être remplacée par injection
   * @param selected
   * @returns
   */
  @Input()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renderLabelFunction(selected: any): string {
    return selected != null ? (selected as string) : '';
  }

  /**
   * Affichage textuel des options sélectionnées en label
   * @returns
   */
  renderLabel(): string {
    return this.renderLabelFunction(this.selected);
  }

  ngOnInit() {
    this.filter(this.filterInput);
  }

  /**
   * Actions au changement des inputs
   * @param changes
   */
  ngOnChanges(changes: SimpleChanges) {
    // Mise à jour des options
    if ('options' in changes) {
      this.options = changes['options'].currentValue;
      this.filter(this.filterInput);
    }
    if ('selected' in changes) {
      this.selectedChange.emit(changes['selected'].currentValue ?? null);
    }
  }

  /**
   * Une option est-elle sélectionnée ?
   * @returns
   */
  hasSelected(): boolean {
    return !!this.selected;
  }

  /**
   * Emit de l'event de selection
   * @param value
   */
  onChange(value: T | null) {
    this.selectedChange.emit(value ?? null);
  }

  /**
   * Déselectionne toutes les options sélectionnées
   */
  emptySelected() {
    this.selectedChange.emit(null);
  }

  /**
   * Filtrage des options
   * @param text
   * @returns
   */
  filter(text: string): void {
    // Sauvegarde du texte
    this.filterInput = text ? this.filterInput : text;
    // Filtre
    this.getFilteredOptions(text ? text : '')
      .pipe(debounceTime(300))
      .subscribe((filteredOptions) => {
        this.filteredOptions = filteredOptions;
        // Concaténation des éléments sélectionnés avec les éléments filtrés (en supprimant les doublons éventuels)
        this.filteredOptions =
          this.selected != null
            ? [this.selected, ...this.filteredOptions.filter((el) => !(this.selected === el))]
            : this.filteredOptions;
      });
  }
}
