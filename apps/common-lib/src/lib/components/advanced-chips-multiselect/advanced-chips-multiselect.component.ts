import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import {
  MatAutocomplete,
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent
} from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
export interface SelectedData {
  item: string;
}

/**
 * Multiselect avec autocompletion et chips
 */
@Component({
    selector: 'lib-advanced-chips-multiselect',
    templateUrl: './advanced-chips-multiselect.component.html',
    styleUrls: ['./advanced-chips-multiselect.component.css'],
    imports: [
        MatIconModule,
        MatChipsModule,
        MatAutocompleteModule,
        MatFormFieldModule,
        MatSelectModule,
        FormsModule,
        ReactiveFormsModule
    ]
})
export class AdvancedChipsMultiselectComponent {
  @ViewChild('selectionInput', { static: false }) input!: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: false }) matAutoComplete!: MatAutocomplete;

  @Input() numberOfVisibleChips = 10;
  @Input() separatorKeysCodes = [ENTER, COMMA] as const;
  @Input() addOnBlur: boolean = true;
  @Input() label = 'Default label';
  @Input() placeholder = 'placeholder';
  @Input() options: SelectedData[] | null = [];
  @Output() selectedDataChange: EventEmitter<SelectedData[]> = new EventEmitter<SelectedData[]>();
  @Output() inputChange: EventEmitter<string> = new EventEmitter<string>();
  _inputControl = new FormControl();

  constructor() {
    this._inputControl.valueChanges.subscribe((value) => {
      this.inputChange.emit(value);
    });
  }

  private _selectedData: SelectedData[] = [];

  public get selectedData(): SelectedData[] {
    return this._selectedData;
  }

  @Input()
  public set selectedData(value: SelectedData[]) {
    if (!value) this._selectedData = [];
    else this._selectedData = value;
  }

  get visible_selectedData() {
    return this.selectedData?.slice(0, this.numberOfVisibleChips) ?? [];
  }

  get invisible_count() {
    const length = this.selectedData?.length ?? 0;
    const count = length - this.numberOfVisibleChips;
    if (count > 0) return count;
    else return 0;
  }

  public get options_minus_selected(): SelectedData[] {
    if (!this.options || !this.selectedData) {
      return [];
    }
    const selectedItems = new Set(this.selectedData.map(s => s.item));
    return this.options.filter(option => !selectedItems.has(option.item));
  }

  // # region: event de l'input
  onMatChipInputEvent(event: MatChipInputEvent) {
    if (this.matAutoComplete.isOpen && this.options_minus_selected.length > 0) {
      return;
    }
  
    // Nettoyage du champ input pour ne pas conserver de texte libre
    event.chipInput?.clear();
  }

  add(value: SelectedData) {
    const v = (value?.item || '').trim();

    if (v) {
      this.selectedData.push(value);
      this.selectedDataChange.emit(this.selectedData);
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  remove(selection: any) {
    const index = this.selectedData.indexOf(selection);

    if (index >= 0) {
      this.selectedData.splice(index, 1);
      this.selectedDataChange.emit(this.selectedData);
    }
  }

  selected($event: MatAutocompleteSelectedEvent) {
    this.add($event.option.value);
    this.input.nativeElement.value = '';
    this._inputControl.setValue(null);
  }

  // # endregion
}
