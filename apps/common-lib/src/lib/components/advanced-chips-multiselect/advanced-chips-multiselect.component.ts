import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
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
  item: any;
}

/**
 * Multiselect avec autocompletion et chips
 */
@Component({
    selector: 'lib-advanced-chips-multiselect',
    templateUrl: './advanced-chips-multiselect.component.html',
    styleUrls: ['./advanced-chips-multiselect.component.css'],
    imports: [
        CommonModule,
        MatIconModule,
        MatChipsModule,
        MatAutocompleteModule,
        MatFormFieldModule,
        MatSelectModule,
        FormsModule,
        ReactiveFormsModule,
        NgFor
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

  public get options_minus_selected(): SelectedData[] | undefined {
    const selected = this.selectedData;
    return this.options?.filter(
      (option) => !selected.some((selection) => selection.item === option.item)
    );
  }

  // # region: event de l'input
  onMatChipInputEvent(_event: MatChipInputEvent) {
    if (this.matAutoComplete.isOpen) return;

    // XXX: desactivation de l'input "libre"
    // this.add($event.value)

    // $event.chipInput!.clear();
  }

  add(value: SelectedData) {
    const v = (value?.item || '').trim();

    if (v) {
      this.selectedData.push(value);
      this.selectedDataChange.emit(this.selectedData);
    }
  }

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
