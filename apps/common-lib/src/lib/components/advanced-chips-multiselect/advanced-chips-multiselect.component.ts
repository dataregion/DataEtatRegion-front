import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatAutocomplete, MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

export interface SelectedData {
  item: any
}

const TEN = 10;

/**
 * Multiselect avec autocompletion et chips
 */
@Component({
  selector: 'lib-advanced-chips-multiselect',
  standalone: true,
  templateUrl: './advanced-chips-multiselect.component.html',
  styleUrls: ['./advanced-chips-multiselect.component.css'],
  imports: [
    CommonModule,
    MatIconModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatSelectModule, FormsModule,
    ReactiveFormsModule,
    NgFor
  ]
})
export class AdvancedChipsMultiselectComponent {

  @ViewChild('selectionInput', { static: false }) input!: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: false }) matAutoComplete!: MatAutocomplete;

  @Input() separatorKeysCodes = [ENTER, COMMA] as const;
  @Input() addOnBlur: boolean = true;
  @Input() label = 'Default label';
  @Input() placeholder = 'placeholder';
  @Input() options: SelectedData[] | null = [];

  @Input() selectedData: SelectedData[] = [];
  @Output() selectedDataChange: EventEmitter<SelectedData[]> = new EventEmitter<SelectedData[]>();

  @Output() inputChange: EventEmitter<string> = new EventEmitter<string>();

  _inputControl = new FormControl();

  get first_10_selectedData() {
    return this.selectedData?.slice(0, TEN) ?? [];
  }
  get invisible_count() {
    const length = this.selectedData?.length ?? 0
    const count = length - TEN;
    if (count > 0)
      return count
    else
      return 0
  }

  constructor() {
    this._inputControl.valueChanges.subscribe((value) => {
      this.inputChange.emit(value);
    });
  }

  // # region: event de l'input
  onMatChipInputEvent($event: MatChipInputEvent) {
    if (this.matAutoComplete.isOpen)
      return;

    // XXX: desactivation de l'input "libre"
    // this.add($event.value)

    // $event.chipInput!.clear();
  }

  private get _sanitizedSelectedData() {
    if (!this.selectedData) {
      this.selectedData = [];
      this.selectedDataChange.emit(this.selectedData);
    }

    return this.selectedData;
  }

  add(value: SelectedData) {
    const v = (value?.item || '').trim();

    if (v) {
      this._sanitizedSelectedData.push(value);
      this.selectedDataChange.emit(this._sanitizedSelectedData);
    }
  }

  remove(selection: any) {
    const index = this._sanitizedSelectedData.indexOf(selection);

    if (index >= 0) {
      this._sanitizedSelectedData.splice(index, 1);
      this.selectedDataChange.emit(this._sanitizedSelectedData);
    }
  }

  selected($event: MatAutocompleteSelectedEvent) {
    this.add($event.option.value);
    this.input.nativeElement.value = '';
    this._inputControl.setValue(null);
  }
  // # endregion
}
