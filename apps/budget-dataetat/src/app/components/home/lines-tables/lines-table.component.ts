import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DsfrColumn, DsfrRowOptions, DsfrTableOptions } from '@edugouvfr/ngx-dsfr';


@Component({
  selector: 'budget-lines-table',
  templateUrl: './lines-table.component.html',
  imports: [CommonModule],
  styleUrls: ['./lines-table.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LinesTableComponent implements OnInit {
  ngOnInit(): void {
  }
  
  columns: DsfrColumn[] = [
    { label: 'Bénéficiaire', field: 'benef', minWidth: "LG" },
    { label: 'Montant engagé', field: 'ae' },
    { label: 'Montant payé', field: 'dp' },
    { label: 'Année exercice comptable', field: 'annee' },
    { label: 'Domaine fonctionnel', field: 'domaine' },
    { label: 'Commune du SIRET', field: 'commune' },
    { label: 'Commune du SIRET', field: 'commune' },
    { label: 'Commune du SIRET', field: 'commune' },
    { label: 'Commune du SIRET', field: 'commune' },
    { label: 'Commune du SIRET', field: 'commune' },
    { label: 'Commune du SIRET', field: 'commune' },
  ];

  tableOptions: DsfrTableOptions = { selectable: false, bordered: true };
  rowsOptions: DsfrRowOptions[] = [{ id: 1, disableSelect: true }];

  data: any[] = [
    { id: '1', benef: 'Emma', ae: '1', dp: '1', annee: '', domaine: 'pok', commune: 'oui' },
    { id: '2', benef: 'Johnson', ae: '2', dp: '2', annee: '2024', domaine: 'dok', commune: 'ici' },
    { id: '3', benef: 'Johnson', ae: '2', dp: '2', annee: '2024', domaine: 'dok', commune: 'ici' },
    { id: '4', benef: 'Johnson', ae: '2', dp: '2', annee: '2024', domaine: 'dok', commune: 'ici' },
    { id: '5', benef: 'Johnson', ae: '2', dp: '2', annee: '2024', domaine: 'dok', commune: 'ici' },
    { id: '6', benef: 'Johnson', ae: '2', dp: '2', annee: '2024', domaine: 'dok', commune: 'ici' },
    { id: '7', benef: 'Johnson', ae: '2', dp: '2', annee: '2024', domaine: 'dok', commune: 'ici' },
    { id: '8', benef: 'Johnson', ae: '2', dp: '2', annee: '2024', domaine: 'dok', commune: 'ici' },
    { id: '9', benef: 'Johnson', ae: '2', dp: '2', annee: '2024', domaine: 'dok', commune: 'ici' },
    { id: '10', benef: 'Johnson', ae: '2', dp: '2', annee: '2024', domaine: 'dok', commune: 'ici' },
    { id: '11', benef: 'Johnson', ae: '2', dp: '2', annee: '2024', domaine: 'dok', commune: 'ici' },
    { id: '12', benef: 'Johnson', ae: '2', dp: '2', annee: '2024', domaine: 'dok', commune: 'ici' },
    { id: '13', benef: 'Johnson', ae: '2', dp: '2', annee: '2024', domaine: 'dok', commune: 'ici' },
    { id: '14', benef: 'Johnson', ae: '2', dp: '2', annee: '2024', domaine: 'dok', commune: 'ici' },
    { id: '15', benef: 'Johnson', ae: '2', dp: '2', annee: '2024', domaine: 'dok', commune: 'ici' },
    { id: '16', benef: 'Johnson', ae: '2', dp: '2', annee: '2024', domaine: 'dok', commune: 'ici' },
  ]
}
