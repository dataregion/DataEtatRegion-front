import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges,} from '@angular/core';
import {CommonModule, NgFor} from '@angular/common';
import {FormsModule, ReactiveFormsModule, ValidationErrors,} from '@angular/forms';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';

/**
 * Select simple paramétrable
 */
@Component({
  selector: 'lib-select-simple',
  standalone: true,
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
    MatCheckboxModule,
  ],
})
export class SelectSimpleComponent<T> implements OnChanges {
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
  private _selected: T | null = null;
  public get selected(): T | null {
    return this._selected;
  }

  @Input()
  public set selected(value: T | null) {
    this._selected = value ?? null;
  }

  @Output() selectedChange = new EventEmitter<T[] | null>();

  filterInput: string = '';
  searching: boolean = false;

  // Icon prefix
  @Input() icon: string = '';

  /**
   * Fonction de filtrage par défaut, peut-être remplacée par injection
   * @param text input utilisateur utilisé pour filtrer
   */
  @Input()
  filterFunction(text: string): T[] {
    // Filtre par défaut : options considérées comme des string
    this.filteredOptions = this.options
      ? this.options?.filter((opt) => {
          const optStr = opt ? opt.toString().toLowerCase() : '';
          return optStr.includes(text.toLowerCase());
        })
      : [];
    return this.filteredOptions;
  }

  /**
   * Fonction de rendu d'une option par défaut, peut-être remplacée par injection
   * @param option
   */
  @Input()
  renderFunction(option: T): string {
    return option as string;
  }

  /**
   * Fonction de rendu des options sélectionnées par défaut, peut-être remplacée par injection
   * @param selected
   * @returns
   */
  @Input()
  renderLabelFunction(selected: T | null): string {
    return selected != null ? (selected as string) : '';
  }

  /**
   * Actions au changement des inputs
   * @param changes
   */
  ngOnChanges(changes: SimpleChanges) {
    // Mise à jour des options
    if ('options' in changes) {
      this.options = changes['options'].currentValue;
      this.filteredOptions = this.options;
    }
    if ('selected' in changes) {
      this.selectedChange.emit(changes['selected'].currentValue ?? null);
    }
  }

  /**
   * Des options sont-elles sélectionnées ?
   * @returns
   */
  hasSelected(): boolean {
    return !!this.selected;
  }

  /**
   * Emit de l'event de selection
   * @param value
   */
  onChange(value: T[] | null) {
    this.selectedChange.emit(value ?? null);
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
  filter(text?: string): void {
    // Sauvegarde du texte
    this.filterInput = text === undefined ? this.filterInput : text;
    this.searching = this.filterInput.length > 0;
    // Filtre
    const newOptions = this.filterFunction(text ? text : '');
    if (newOptions == null || newOptions.length === 0) return;

    this.filteredOptions = newOptions;
    // Concaténation des éléments sélectionnés avec les éléments filtrés (en supprimant les doublons éventuels)
    this.filteredOptions =
      this.selected != null
        ? [
            this.selected,
            ...this.filteredOptions.filter((el) => !(this.selected === el)),
          ]
        : this.filteredOptions;
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
