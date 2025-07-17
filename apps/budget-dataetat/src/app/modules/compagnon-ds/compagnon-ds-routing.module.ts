import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Profil } from 'apps/common-lib/src/lib/models/profil.enum.model';
import { IntegrationDemarcheComponent } from './integration/integration-demarche.component';
import { ReconciliationDemarcheComponent } from './reconciliation/reconciliation-demarche.component';
import { AffichageDemarcheComponent } from './affichage/affichage-demarche.component';
import { GestionTokenComponent } from './gestion-token/gestion-token.component';

export const profiles_required_for_upload_page = [Profil.ADMIN, Profil.COMPTABLE];

const routes: Routes = [
  {
    path: '',
    component: IntegrationDemarcheComponent,
  },
  {
    path: 'reconciliation',
    component: ReconciliationDemarcheComponent,
  },
  {
    path: 'affichage',
    component: AffichageDemarcheComponent,
  },
  {
    path: 'gestion-token',
    component: GestionTokenComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompagnonDSRoutingModule { }
