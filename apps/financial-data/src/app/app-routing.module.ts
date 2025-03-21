import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from 'apps/common-lib/src/lib/components/register/register.component';
import { TermOfUseComponent } from 'apps/common-lib/src/lib/components/term-of-use/term-of-use.component';
import { Profil } from 'apps/common-lib/src/lib/models/profil.enum.model';
import {
  keycloakAuthGuardCanActivate,
  keycloakAuthGuardCanMatchAccordingToRoles
} from 'apps/common-lib/src/public-api';
import { HomeComponent } from './pages/home/home.component';
import { PreferenceComponent } from './pages/preference/preference.component';
import { resolveFinancialData } from './resolvers/financial-data.resolver';
import { router_template_path_full as info_supplementaires_path } from './modules/informations-supplementaires/routes';
import { resolveMarqueBlancheParsedParams } from './resolvers/marqueblanche-parsed-params.resolver';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [keycloakAuthGuardCanActivate],
    runGuardsAndResolvers: 'always',
    resolve: {
      financial: resolveFinancialData,
      mb_parsed_params: resolveMarqueBlancheParsedParams
    }
  },
  {
    path: info_supplementaires_path(),
    loadChildren: () =>
      import('./modules/informations-supplementaires/informations-supplementaires.module').then(
        (m) => m.InformationsSupplementairesModule
      ),
    canActivate: [keycloakAuthGuardCanActivate]
  },
  {
    path: 'preference',
    component: PreferenceComponent,
    canActivate: [keycloakAuthGuardCanActivate],
    runGuardsAndResolvers: 'always'
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'cgu',
    component: TermOfUseComponent,
    canActivate: [keycloakAuthGuardCanActivate]
  },
  {
    path: 'administration',
    canMatch: [keycloakAuthGuardCanMatchAccordingToRoles],
    data: {
      roles: [Profil.USERS]
    },
    loadChildren: () =>
      import('./modules/administration/administration.module').then((m) => m.AdministrationModule)
  },
  {
    path: '**',
    redirectTo: '/'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
