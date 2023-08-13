import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatAutocomplete, MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

export interface SelectData {
  item: any
}

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
  @Input() options: SelectData[] | null = [];

  @Output() onInputChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() onSelectedChange: EventEmitter<SelectData[]> = new EventEmitter<SelectData[]>();

  _selectData: SelectData[] = [];
  _inputControl = new FormControl();

  constructor() {
    this._inputControl.valueChanges.subscribe((value) => {
      this.onInputChange.emit(value);
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

  add(value: SelectData) {
    const v = (value?.item || '').trim();

    if (v) {
      this._selectData.push(value);
      this.onSelectedChange.emit(this._selectData);
    }
  }

  remove(selection: any) {
    const index = this._selectData.indexOf(selection);

    if (index >= 0) {
      this._selectData.splice(index, 1);
      this.onSelectedChange.emit(this._selectData);
    }
  }

  selected($event: MatAutocompleteSelectedEvent) {
    this.add($event.option.value);
    this.input.nativeElement.value = '';
    this._inputControl.setValue(null);
  }
  // # endregion
}
