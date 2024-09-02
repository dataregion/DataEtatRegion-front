import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Profil } from 'apps/common-lib/src/lib/models/profil.enum.model';
import { keycloakAuthGuardCanActivate } from 'apps/common-lib/src/public-api';
import { IntegrationDemarcheComponent } from './integration/integration-demarche.component';
import { ReconciliationDemarcheComponent } from './reconciliation/reconciliation-demarche.component';
import { AffichageDemarcheComponent } from './affichage/affichage-demarche.component';

export const profiles_required_for_managment_page = [Profil.ADMIN]
export const profiles_required_for_upload_page = [Profil.ADMIN, Profil.COMPTABLE]
export const profiles_required_for_tags_page = [Profil.USERS]
export const profiles_required_for_demarche_integration = [Profil.USERS]

const routes: Routes = [
  {
    path: 'integration',
    component: IntegrationDemarcheComponent,
    canActivate: [keycloakAuthGuardCanActivate],
    data: {
      roles: profiles_required_for_demarche_integration,
    },
  },
  {
    path: 'reconciliation',
    component: ReconciliationDemarcheComponent,
    canActivate: [keycloakAuthGuardCanActivate],
    data: {
      roles: profiles_required_for_demarche_integration,
    },
  },
  {
    path: 'affichage',
    component: AffichageDemarcheComponent,
    canActivate: [keycloakAuthGuardCanActivate],
    data: {
      roles: profiles_required_for_demarche_integration,
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CompagnonDSRoutingModule {}
