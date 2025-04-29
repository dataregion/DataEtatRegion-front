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
import { MatomoRouteData } from 'ngx-matomo-client';
import { PocComponent } from './pages/poc/poc.component';

const routes: Routes = [
  {
    path: '',
    title:"Budget",
    component: HomeComponent,
    canActivate: [keycloakAuthGuardCanActivate],
    runGuardsAndResolvers: 'always',
    resolve: {
      financial: resolveFinancialData,
      mb_parsed_params: resolveMarqueBlancheParsedParams
    }
  },
  {
    path: 'poc',
    title:"Budget",
    component: PocComponent,
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
    title:"Mes Recherches",
    component: PreferenceComponent,
    canActivate: [keycloakAuthGuardCanActivate],
    runGuardsAndResolvers: 'always'
  },
  {
    path: 'register',
    title:"S'enregistrer",
    component: RegisterComponent
  },
  {
    path: 'cgu',
    title: 'Conditions générales d\'utilisation',
    component: TermOfUseComponent,
    canActivate: [keycloakAuthGuardCanActivate]
  },
  {
    path: 'administration',
    canMatch: [keycloakAuthGuardCanMatchAccordingToRoles],
    data: {
      roles: [Profil.USERS],
      matomo: {
        title: 'Admin', // <-- You can override the title sent to Matomo
      } as MatomoRouteData,
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
