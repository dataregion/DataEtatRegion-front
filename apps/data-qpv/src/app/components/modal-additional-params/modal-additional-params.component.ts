import { Component, Input, ViewChild } from "@angular/core";
import { FormControl, FormGroup, FormsModule } from "@angular/forms";
import { DsfrHeadingLevel, DsfrModalAction, DsfrModalComponent, DsfrSize, DsfrSizeConst } from "@edugouvfr/ngx-dsfr";
import { Subject } from "rxjs";

export interface CheckboxMappedData {
  label: string;
  description?: string;
  checked: boolean;
}

@Component({
  selector: 'modal-additional-params',
  templateUrl: './modal-additional-params.component.html',
  styleUrls: ['./modal-additional-params.component.scss'],
})
export class ModalAdditionalParamsComponent {

  private _dialogId: string = ""

  private _titleModal: string = "Test de titre"
  private _size: DsfrSize = DsfrSizeConst.LG
  private _actions: DsfrModalAction[] = []
  private _headingLevel: DsfrHeadingLevel | undefined
  private _autoCloseOnAction: boolean = true

  public data: CheckboxMappedData[] = [];

  public setData(data: CheckboxMappedData[]) {
    this.data = data;
  }

  @Input()
  public formGroup: FormGroup;

  @Input()
  public formControl: string = "";

  constructor() {
    this.formGroup = new FormGroup({});
  }

  get dialogId() {
    return this._dialogId;
  }
  
  @Input()
  set dialogId(dialogId: string) {
    this._dialogId = dialogId;
  }

  get titleModal() {
    return this._titleModal;
  }
  
  set titleModal(titleModal: string) {
    this._titleModal = titleModal;
  }

  get size() {
    return this._size;
  }
  
  set size(size: DsfrSize) {
    this._size = size;
  }

  get actions() {
    return this._actions;
  }
  
  set actions(actions: DsfrModalAction[]) {
    this._actions = actions;
  }

  get headingLevel() {
    return this._headingLevel;
  }
  
  set headingLevel(headingLevel: DsfrHeadingLevel | undefined) {
    this._headingLevel = headingLevel;
  }

  get autoCloseOnAction() {
    return this._autoCloseOnAction;
  }
  
  set autoCloseOnAction(autoCloseOnAction: boolean) {
    this._autoCloseOnAction = autoCloseOnAction;
  }

  @ViewChild('modalFiltres') modalFiltres!: DsfrModalComponent;

  public filteredCheckboxes: CheckboxMappedData[] = []

  public openModal(formControl: string, titre: string, formGroup: FormGroup, data: CheckboxMappedData[]) {
    this.dialogId = "modal-" + formControl;
    this.formGroup = formGroup
    this.titleModal = titre;
    this.formControl = formControl;
    this.data = data;
    this.filteredCheckboxes = data;
    this.modalFiltres.open()
  }

  input: string = "";

  filterCheckboxes(text?: string): void {
    this.input = text === undefined ? this.input : text;
    this.filteredCheckboxes = this.data.filter(d => d.label.toLowerCase().includes(this.input) || d.description?.toLowerCase().includes(this.input))
  }


}
