import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Profil } from 'apps/common-lib/src/lib/models/profil.enum.model';
import { keycloakAuthGuardCanActivate } from 'apps/common-lib/src/public-api';
import { UploadFinancialComponent } from './upload-financial/upload-financial.component';
import { UpdateTagsComponent } from './update-tags/update-tags.component';

export const profiles_required_for_managment_page = [Profil.ADMIN];
export const profiles_required_for_upload_page = [Profil.ADMIN, Profil.COMPTABLE];
export const profiles_required_for_tags_page = [Profil.USERS];
export const profiles_required_for_demarches = [Profil.USERS];

const routes: Routes = [
  {
    path: 'upload',
    component: UploadFinancialComponent,
    title:"Charger les données",
    canActivate: [keycloakAuthGuardCanActivate],
    data: {
      roles: profiles_required_for_upload_page
    }
  },
  {
    path: 'update-tags',
    title:"Gestion des tags",
    component: UpdateTagsComponent,
    canActivate: [keycloakAuthGuardCanActivate],
    data: {
      roles: profiles_required_for_tags_page
    }
  },
  {
    path: 'demarches',
    title: "Gestion des démarches",
    canActivate: [keycloakAuthGuardCanActivate],
    data: {
      roles: profiles_required_for_demarches
    },
    loadChildren: () =>
      import('./compagnon-ds/compagnon-ds.module').then((m) => m.CompagnonDSModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministrationRoutingModule {}
