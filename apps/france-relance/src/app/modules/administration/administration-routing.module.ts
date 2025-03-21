import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Profil } from 'apps/common-lib/src/lib/models/profil.enum.model';
import { keycloakAuthGuardCanActivate } from 'apps/common-lib/src/public-api';
import { UploadLaureatsComponent } from './upload-laureats/upload-laureats.component';

export const profiles_required_for_managment_page = [Profil.ADMIN];
export const profiles_required_for_upload_page = [Profil.ADMIN, Profil.COMPTABLE];

const routes: Routes = [
  {
    path: 'upload',
    component: UploadLaureatsComponent,
    canActivate: [keycloakAuthGuardCanActivate],
    data: {
      roles: profiles_required_for_upload_page
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministrationRoutingModule {}
