import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { FormsModule, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { MatTooltipModule} from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

/**
 * Select paramétrable (multiple ? filter ?)
 */
@Component({
  selector: 'lib-select-multi-filter',
  standalone: true,
  templateUrl: './select-multi-filter.component.html',
  styleUrls: ['./select-multi-filter.component.scss'],
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
    MatCheckboxModule,
  ]
})
export class SelectMultiFilterComponent<T> implements OnChanges {
  
  // Select multiple ?
  @Input() hasMultiple: boolean = false;

  // Select all ?
  @Input() canSelectAll: boolean = false;

  // Filtre sur les options ?
  @Input() canFilter: boolean = true;

  // Attributes
  @Input() class: string = '';
  @Input() placeholder: string = '';
  @Input() error: ValidationErrors | null = null;

  // Options
  @Input() options: T[] | null = [];
  filteredOptions: T[] | null = [];

  // Options sélectionnées
  private _selected: T[] | null = [];
  public get selected(): T | T[] | null | undefined {
    return this.hasMultiple ? this._selected : (this._selected != null ? this._selected[0] : null);
  }
  @Input()
  public set selected(value: T | T[] | null | undefined) {
    this._selected = value != null ? (Array.isArray(value) ? value : [value]) : null
  }
  @Output() selectedChange = new EventEmitter<T[] | null>();

  filterInput: string = '';
  searching: boolean = false;

  // Icon prefix
  @Input() icon: string = '';

  /**
   * Fonction de filtrage par défaut, peut-être remplacée par injection
   * @param text 
   * @returns 
   */
  @Input()
  filterFunction(text: string): T[] {
    // Filtre par défaut : options considérées comme des string
    this.filteredOptions = this.options ? this.options?.filter((opt) => {
      const optStr = opt ? (opt as string).toLowerCase() : '';
      return optStr.includes(text.toLowerCase());
    }) : [];
    return this.filteredOptions;
  }
  
  /**
   * Fonction de rendu d'une option par défaut, peut-être remplacée par injection
   * @param option 
   * @returns 
   */
  @Input()
  renderFunction(option: T): string {
    // Affichage par défaut : option telle quelle
    return option as string;
  }

  /**
   * Fonction de rendu des options sélectionnées par défaut, peut-être remplacée par injection
   * @param selected 
   * @returns 
   */
  @Input()
  renderLabelFunction(selected: T | T[] | null | undefined): string {
    // Affichage par défaut : options jointes par des virgules
    let label: string = ''
    if (selected != null) {
      label += this.hasMultiple ? (selected as string[]).join(', ') : selected as string;
    }
    return label
  }

  /**
   * Actions au changement des inputs
   * @param changes 
   */
  ngOnChanges(changes: SimpleChanges) {
    // Mise à jour des options
    if ('options' in changes)
      this.options = changes['options'].currentValue
    // Application du filtre après reset des options
    if (this.canFilter && this.filterInput !== '')
      this.filter(this.filterInput)
    else
      this.filteredOptions = this.options;
  }

  /**
   * Sélection de toutes les options
   */
   allSelected() {
    return this.selected !== null && Array.isArray(this.selected) && this.selected?.length === this.filteredOptions?.length;
  }

  hasMultipleSelected() {
    return this.selected !== null && Array.isArray(this.selected) && this.selected.length > 0;
  }

  /**
   * Sélection de toutes les options
   */
   toggleAll() {
    this.selected = this.selected === null || (Array.isArray(this.selected) && this.selected?.length !== this.filteredOptions?.length) ? this.filteredOptions : []
    this.onChange(this.selected)
  }

  /**
   * Emit de l'event de selection
   * @param value
   */
  onChange(value: T[] | null | undefined) {
    if (!Array.isArray(value))
      this.selectedChange.emit(value != null ? [value as unknown as T] : null);
    else
      this.selectedChange.emit(value != null ? value as unknown as T[] : null);
  }

  /**
   * Déselectionne tous les options sélectionnées
   */
  emptySelected() {
    this.selectedChange.emit(null);
  }

  /**
   * Filtrage des option par défaut OU spécifique des options
   * @param text
   * @returns 
   */
  filter(text: string): void {
    // Sauvegarde du texte
    this.filterInput = text;
    this.searching = this.filterInput.length > 0;
    // Filtre
    this.filteredOptions = this.filterFunction(text ? text : '');
    // Concaténation des éléments sélectionnés avec les éléments filtrés (en supprimant les doublons éventuels)
    this.filteredOptions = this._selected != null ?
      [
        ...Array.isArray(this._selected) ? this._selected : [this._selected],
        ...this.filteredOptions.filter((el) => !this._selected?.includes(el))
      ]
      : this.filteredOptions
  }

  /**
   * Affichage textuel par défaut OU spécifique d'une option
   * @param option 
   * @returns 
   */
  render(option: T): string {
    return this.renderFunction(option);
  }

  /**
   * Affichage textuel des options sélectionnées en label
   * @returns 
   */
   renderLabel(): string {
    return this.renderLabelFunction(this.selected);
  }

}
