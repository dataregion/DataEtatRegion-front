import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CompagnonDSRoutingModule } from './compagnon-ds-routing.module';
// import {
//   CommonLibModule,
//   MaterialModule,
// } from 'apps/common-lib/src/public-api';
// import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IntegrationDemarcheComponent } from './integration/integration-demarche.component';
import { ReconciliationDemarcheComponent } from './reconciliation/reconciliation-demarche.component';
import { AffichageDemarcheComponent } from './affichage/affichage-demarche.component';
import { NavCompagnonDSComponent } from './nav/nav.component';
import { SelectSimpleComponent } from '../../../../../../common-lib/src/lib/components/select-simple/select-simple.component';
import { SelectMultipleComponent } from '../../../../../../common-lib/src/lib/components/select-multiple/select-multiple.component';
import {
  MatError,
  MatFormField,
  MatLabel,
  MatSuffix,
} from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { MatOption } from '@angular/material/autocomplete';
import { MatSelect, MatSelectTrigger } from '@angular/material/select';

@NgModule({
  declarations: [
    IntegrationDemarcheComponent,
    ReconciliationDemarcheComponent,
    AffichageDemarcheComponent,
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
  ],
})
export class CompagnonDSModule {}
