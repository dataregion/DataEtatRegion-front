import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CompagnonDSRoutingModule } from './compagnon-ds-routing.module';
// import {
//   CommonLibModule,
//   MaterialModule,
// } from 'apps/common-lib/src/public-api';
// import { MatDialogModule } from '@angular/material/dialog';

import { ReactiveFormsModule } from '@angular/forms';
import { IntegrationDemarcheComponent } from './integration/integration-demarche.component';
import { ReconciliationDemarcheComponent } from './reconciliation/reconciliation-demarche.component';
import { AffichageDemarcheComponent } from './affichage/affichage-demarche.component';
import { NavCompagnonDSComponent } from './nav/nav.component';

@NgModule({
  declarations: [IntegrationDemarcheComponent, ReconciliationDemarcheComponent, AffichageDemarcheComponent],
  imports: [
    CommonModule,
    CompagnonDSRoutingModule,
    ReactiveFormsModule,
    NavCompagnonDSComponent,
    RouterModule
  ]
})
export class CompagnonDSModule {}
