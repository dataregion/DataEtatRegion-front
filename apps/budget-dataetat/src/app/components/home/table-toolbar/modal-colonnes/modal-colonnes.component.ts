import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MaterialModule } from "apps/common-lib/src/public-api";
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ColonnesService } from '@services/colonnes.service';
import { ReactiveFormsModule, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { FinancialDataModel } from '@models/financial/financial-data.models';
import { ColonnesMapperService, ColonneTableau } from '@services/colonnes-mapper.service';
import { CommonModule } from '@angular/common';

export interface ColonneFormValues {
  name: FormControl<string>;
  label: FormControl<string>;
  selected: FormControl<boolean>;
}

export interface FormColonnes {
  colonnes: FormArray<FormGroup<ColonneFormValues>>;
}

@Component({
  selector: 'budget-modal-colonnes',
  templateUrl: './modal-colonnes.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./modal-colonnes.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, DragDropModule]
})
export class ModalColonnesComponent implements OnInit {

  private _formBuilder = inject(FormBuilder);
  private _colonnesService = inject(ColonnesService)
  private _colonnesMapperService = inject(ColonnesMapperService)
  
  public formColonnes: FormGroup<FormColonnes> = new FormGroup({
    colonnes: new FormArray<FormGroup<ColonneFormValues>>([])
  });

  public colonnes: ColonneTableau<FinancialDataModel>[] = []
  public selectedColonnes: ColonneTableau<FinancialDataModel>[] = []

  ngOnInit() {
    // Récupération des colonnes du tableau, les sélectionnées mappées sur les colonnes du back
    this.colonnes = this._colonnesService.allColonnesTable()
    this.selectedColonnes = this._colonnesService.selectedColonnesTable()
    
    // On ordonne les colonnes pour mettre les selected en haut
    const namesSelected = new Set(this.selectedColonnes.map(c => c.colonne));
    const orderedColonnes = [...this.colonnes].sort((a, b) => {
      const aSelected = namesSelected.has(a.colonne);
      const bSelected = namesSelected.has(b.colonne);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return 0;
    });

    // Build du formulaire
    this.formColonnes = this._formBuilder.group({
      colonnes: this._formBuilder.array(
        orderedColonnes.map(col => {
          const isSelected = this.selectedColonnes.some(sc => sc.colonne === col.colonne);
          return this._formBuilder.group({
            name: this._formBuilder.control(col.colonne, { nonNullable: true }),
            label: this._formBuilder.control(col.label, { nonNullable: true }),
            selected: this._formBuilder.control(isSelected, { nonNullable: true }),
          })
        })
      )
    });
  }

  /**
   * Fonction pour ordonner les colonnes
   * @param event 
   */
  moveGroup(event: CdkDragDrop<FormGroup<ColonneFormValues>[]>) {
    moveItemInArray(this.formColonnes.controls.colonnes.controls, event.previousIndex, event.currentIndex);
    this.formColonnes.controls.colonnes.updateValueAndValidity()
  }

  allSelected() {
    return this.formColonnes.controls.colonnes.controls.every(group => group.controls.selected.value === true);
  }

  toggleAll(selected: boolean) {
    const formArray = this.formColonnes.controls.colonnes;
    formArray.controls.forEach(group => {
      group.controls.selected.setValue(selected);
    });
  }

  /**
   * A la validation, on sauvegarde les colonnes sélectionnées dans le service
   */
  public validate(): void {
    const formArray = this.formColonnes.controls.colonnes;

    // preserve order as it appears in the form array
    const selectedInOrder = formArray.controls
      .filter(group => group.controls.selected.value)
      .map(group => group.controls.name.value);

    // map back to ColonneTableau objects in the right order
    const selectedColonnes = selectedInOrder
      .map(name => this.colonnes.find(c => c.colonne === name)!)
      .filter(Boolean);

    this._colonnesService.selectedColonnesTable.set(selectedColonnes);
  }

}
