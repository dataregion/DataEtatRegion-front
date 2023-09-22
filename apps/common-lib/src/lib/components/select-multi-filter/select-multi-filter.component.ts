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

  // Fonctions injectées (doivent être déclarées en lambda)
  @Input() filterFunction: any = undefined;
  @Input() renderFunction: any = undefined;
  @Input() renderLabelFunction: any = undefined;

  
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
   * @param option 
   * @returns 
   */
  filter(text: string): void {
    // Booléen pour affichage de l'option vide
    this.filterInput = text;
    this.searching = this.filterInput.length > 0;
    // Si une fonction de filtre spécifique a été fournie, on la call
    if (this.filterFunction !== undefined)
      this.filteredOptions = this.filterFunction(text ? text : '');
    // Sinon on considère les options comme des string pour filtrer
    else{
      const filtered = this.options ? this.options?.filter((opt) => {
        const optStr = opt ? (opt as string).toLowerCase() : '';
        return optStr.startsWith(text.toLowerCase());
      }) : [];
      this.filteredOptions = this._selected != null ?
        [
          // Concaténation des éléments sélectionnés avec les éléments filtrés (en supprimant les doublons éventuels)
          ...this._selected,
          ...filtered.filter((el) => !this._selected?.includes(el))
        ]
        : filtered
    }
  }

  /**
   * Affichage textuel par défaut OU spécifique d'une option
   * @param option 
   * @returns 
   */
  render(option: T): string {
    // Si une fonction de rendu spécifique a été fournie, on la call
    if (this.renderFunction !== undefined) {
      return this.renderFunction(option);
    }
    // Sinon on affiche l'option telle quelle
    return option as string;
  }

  /**
   * Affichage textuel des options sélectionnées en label
   * @returns 
   */
   renderLabel(): string {
    // Si une fonction de rendu spécifique a été fournie, on la call
    if (this.renderLabelFunction !== undefined) {
      return this.renderLabelFunction(this.selected);
    }
    // Sinon on affiche les options jointes par des virgules
    let label: string = ''
    if (this.selected !== null) {
      label += this.hasMultiple ? (this.selected as string[]).join(', ') : this.selected as string;
    }
    return label
  }

}
