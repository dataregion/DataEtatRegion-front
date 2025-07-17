import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CompagnonDSRoutingModule } from './compagnon-ds-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IntegrationDemarcheComponent } from './integration/integration-demarche.component';
import { ReconciliationDemarcheComponent } from './reconciliation/reconciliation-demarche.component';
import { AffichageDemarcheComponent } from './affichage/affichage-demarche.component';
import { NavCompagnonDSComponent } from './nav/nav.component';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton, MatMiniFabButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { MatOption } from '@angular/material/autocomplete';
import { MatSelect, MatSelectTrigger } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';
import { GestionTokenComponent } from './gestion-token/gestion-token.component';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatChip, MatChipListbox } from '@angular/material/chips';
import { MatMenu, MatMenuItem } from '@angular/material/menu';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable
} from '@angular/material/table';
import { CdkCellDef, CdkColumnDef, CdkHeaderCellDef } from '@angular/cdk/table';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { EditTokenDialogComponent } from './gestion-token/edit-token-dialog/edit-token-dialog.component';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatCheckbox } from '@angular/material/checkbox';
import { DisplayDateComponent } from 'apps/common-lib/src/lib/components/display-date/display-date.component';
import { GroupingTableModule } from 'apps/grouping-table/src/public-api';
import { SelectSimpleComponent } from 'apps/common-lib/src/lib/components/select-simple/select-simple.component';
import { SelectMultipleComponent } from 'apps/common-lib/src/lib/components/select-multiple/select-multiple.component';

@NgModule({
  declarations: [
    IntegrationDemarcheComponent,
    ReconciliationDemarcheComponent,
    AffichageDemarcheComponent,
    GestionTokenComponent,
    EditTokenDialogComponent
  ],
  imports: [
    CommonModule,
    CompagnonDSRoutingModule,
    ReactiveFormsModule,
    NavCompagnonDSComponent,
    RouterModule,
    SelectSimpleComponent,
    SelectMultipleComponent,
    MatError,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatOption,
    MatSelect,
    MatSelectTrigger,
    MatSuffix,
    FormsModule,
    MatTooltip,
    DisplayDateComponent,
    GroupingTableModule,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatChip,
    MatChipListbox,
    MatMenu,
    MatMenuItem,
    MatTable,
    MatHeaderCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatCellDef,
    MatHeaderRowDef,
    MatRowDef,
    MatRow,
    MatHeaderRow,
    CdkCellDef,
    CdkHeaderCellDef,
    CdkColumnDef,
    MatButton,
    MatMiniFabButton,
    MatSlideToggle,
    MatDialogContent,
    MatDialogTitle,
    MatDialogClose,
    MatDialogActions,
    MatCheckbox
  ]
})
export class CompagnonDSModule { }
