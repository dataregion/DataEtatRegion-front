import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MaterialModule } from "apps/common-lib/src/public-api";
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ColonneTableau } from '@services/colonnes-mapper.service';
import { ColonnesService } from '@services/colonnes.service';
import { FinancialDataModel } from '@models/financial/financial-data.models';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';


export interface ColonneFormValues {
  name: FormControl<string>;
  label: FormControl<string>;
}

export interface FormColonnes {
  colonnes: FormArray<FormGroup<ColonneFormValues>>;
}

@Component({
  selector: 'budget-modal-grouping',
  templateUrl: './modal-grouping.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./modal-grouping.component.scss'],
  imports: [ReactiveFormsModule, MaterialModule, DragDropModule]
})
export class ModalGroupingComponent implements OnInit {

  private _formBuilder = inject(FormBuilder);
  private _colonnesService = inject(ColonnesService)

  public formGrouping: FormGroup<FormColonnes> = new FormGroup({
    colonnes: new FormArray<FormGroup<ColonneFormValues>>([])
  });

  public colonnes: ColonneTableau<FinancialDataModel>[] = []
  public selectedColonnes: ColonneTableau<FinancialDataModel>[] = []
  public remainingColonnes: ColonneTableau<FinancialDataModel>[] = []

  ngOnInit() {
    // Récupération des colonnes du tableau, les sélectionnées mappées sur les colonnes du back
    this.colonnes = this._colonnesService.allColonnesGrouping
    this.selectedColonnes = this._colonnesService.selectedColonnesGrouping
    this.remainingColonnes = this.calculateRemainingColumns();

    // Build du formulaire
    this.formGrouping = this._formBuilder.group({
      colonnes: this._formBuilder.array(
        this.selectedColonnes.map(col => {
          return this._formBuilder.group({
            name: this._formBuilder.control(col.colonne, { nonNullable: true }),
            label: this._formBuilder.control(col.label, { nonNullable: true }),
          })
        })
      )
    });
  }

  /**
   * Retourne les colonnes qui ne sont pas déjà utilisées pour le grouping (pour proposer leur ajout).
   */
  private calculateRemainingColumns() {
    const formArray = this.formGrouping.controls.colonnes;
    const usedNames = new Set(formArray.controls.map(group => group.controls.name.value));
    return this.colonnes.filter(col => !usedNames.has(col.colonne));
  }

  moveGroup(event: CdkDragDrop<FormGroup<ColonneFormValues>[]>) {
    moveItemInArray(this.formGrouping.controls.colonnes.controls, event.previousIndex, event.currentIndex);
    this.formGrouping.controls.colonnes.updateValueAndValidity()
  }

  addGroup(event: Event) {
    const target = event.target as HTMLSelectElement;
    const selectedName = target.selectedOptions[0].value;
    
    const col = this.colonnes.find(c => c.colonne === selectedName);
    if (!col) return;
    
    this.formGrouping.controls.colonnes.push(
      this._formBuilder.group({
        name: this._formBuilder.control(col.colonne, { nonNullable: true }),
        label: this._formBuilder.control(col.label, { nonNullable: true }),
      })
    );
    this.remainingColonnes = this.calculateRemainingColumns();
  }

  removeGroup(index: number) {
    const formArray = this.formGrouping.controls.colonnes;
    formArray.removeAt(index);
    this.remainingColonnes = this.calculateRemainingColumns();
  }

  public validate(): void {
    const colonnes = this.formGrouping.controls.colonnes;

    // build selected in the same order as in the form array
    const selected = colonnes.controls
      .map(group => group.controls.name.value)       // ordered list of names
      .map(name => this.colonnes.find(c => c.colonne === name)!) // map back to ColonneTableau
      .filter(Boolean);                              // remove nulls

    this._colonnesService.selectedColonnesGrouping = selected;
    this._colonnesService.selectedColonnesGrouped = [];
  }

}
