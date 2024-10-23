import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Token } from '@models/demarche_simplifie/demarche.model';
import { CompagnonDSService } from '../../compagnon-ds.service';

export type EditTokenDialogType = 'CREATE' | 'UPDATE';

export type EditTokenDialogData = {
  dialogType: EditTokenDialogType;
  token: Token | null;
};

@Component({
  selector: 'edit-token-dialog',
  templateUrl: './edit-token-dialog.component.html',
  styleUrls: ['./edit-token-dialog.component.scss']
})
export class EditTokenDialogComponent {
  dialogType: EditTokenDialogType;
  title: string;
  token: Token;

  constructor(
    private dialogRef: MatDialogRef<EditTokenDialogComponent>,
    private _compagnonDS: CompagnonDSService,
    @Inject(MAT_DIALOG_DATA) private dialogData: EditTokenDialogData
  ) {
    this.dialogType = dialogData.dialogType;
    this.title = this.dialogType == 'CREATE' ? 'Ajouter un token DS' : 'Modifier un token DS';
    if (dialogData.token) {
      this.token = {
        id: dialogData.token.id,
        nom: dialogData.token.nom,
        token: dialogData.token.token
      };
    } else {
      this.token = {
        id: undefined,
        nom: '',
        token: ''
      };
    }
  }

  doSave() {
    if (this.dialogType === 'CREATE') {
      return this._compagnonDS.createToken(this.token);
    } else {
      return this._compagnonDS.updateToken(this.token);
    }
  }

  save() {
    if (this.token.nom && this.token.token) {
      this.doSave().subscribe(() => {
        this.dialogRef.close({
          saved: true
        });
      });
    }
  }
}
