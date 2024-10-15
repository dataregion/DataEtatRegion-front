import { Component, Input } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { DsfrHeadingLevel, DsfrModalAction, DsfrSize, DsfrSizeConst } from "@edugouvfr/ngx-dsfr";


@Component({
  selector: 'modal-additional-params',
  templateUrl: './modal-additional-params.component.html',
  styleUrls: ['./modal-additional-params.component.scss'],
})
export class ModalAdditionalParamsComponent {

  private _titleModal: string = ""
  private _size: DsfrSize = DsfrSizeConst.MD
  private _actions: DsfrModalAction[] = []
  private _headingLevel: DsfrHeadingLevel | undefined
  private _autoCloseOnAction: boolean = true

  public data: any[] = [];

  public setData(data: any[]) {
    this.data = data;
  }

  @Input()
  public formModal: FormGroup;

  constructor() {
    this.formModal = new FormGroup({});
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

}
