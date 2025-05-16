import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TermOfUseComponent } from 'apps/common-lib/src/lib/components/term-of-use/term-of-use.component';
import { keycloakAuthGuardCanActivate } from 'apps/common-lib/src/public-api';
import { HelpComponent } from './pages/help/help.component';
import { HomeComponent } from './pages/home/home.component';
import { PreferenceComponent } from './pages/preference/preference.component';
import { resolveFinancialData } from './resolvers/financial-data.resolver';
import { resolveMarqueBlancheParsedParams } from './resolvers/marqueblanche-parsed-params.resolver';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [keycloakAuthGuardCanActivate],
    runGuardsAndResolvers: 'always',
    resolve: {
      financial: resolveFinancialData,
      mb_parsed_params: resolveMarqueBlancheParsedParams,
    },
  },
  {
    path: 'preference',
    component: PreferenceComponent,
    canActivate: [keycloakAuthGuardCanActivate],
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'aide',
    component: HelpComponent,
    canActivate: [keycloakAuthGuardCanActivate],
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'cgu',
    component: TermOfUseComponent,
    canActivate: [keycloakAuthGuardCanActivate],
  },
  {
    path: '**',
    redirectTo: '/',
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
