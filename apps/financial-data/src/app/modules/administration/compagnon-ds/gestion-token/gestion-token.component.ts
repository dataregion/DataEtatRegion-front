import { Component, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  EditTokenDialogComponent,
  EditTokenDialogType
} from './edit-token-dialog/edit-token-dialog.component';
import { CompagnonDSService } from '../compagnon-ds.service';
import { Token } from '@models/demarche_simplifie/demarche.model';

@Component({
    selector: 'financial-gestion-token',
    templateUrl: './gestion-token.component.html',
    standalone: false
})
export class GestionTokenComponent implements OnInit {
  private dialog = inject(MatDialog);

  public columnsToDisplay: string[] = ['nom', 'token', 'actions'];
  public tokens: Token[] = [];

  constructor(private _compagnonDS: CompagnonDSService) {}

  ngOnInit(): void {
    this.loadTokens();
  }

  loadTokens() {
    this._compagnonDS.getTokens().subscribe((tokens) => {
      this.tokens = tokens;
    });
  }

  openEditTokenDialog(dialogType: EditTokenDialogType, token: Token | null) {
    const editTokenDialog = this.dialog.open(EditTokenDialogComponent, {
      data: {
        dialogType: dialogType,
        token: token
      },
      autoFocus: 'input'
    });

    editTokenDialog.afterClosed().subscribe((data) => {
      if (data.saved) {
        this.loadTokens();
      }
    });
  }

  deleteToken(token: Token) {
    if (confirm(`Voulez-vous vraiment supprimer le token ${token.nom}`)) {
      this._compagnonDS.deleteToken(token.id!).subscribe(() => {
        this.loadTokens();
      });
    }
  }
}
