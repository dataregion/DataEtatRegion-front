import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { canActivateAuthRole } from './guards/auth-role.guard';
import { resolveFinancialData } from './resolvers/financial-data.resolver';
import { resolveMarqueBlancheParsedParams } from './resolvers/marqueblanche-parsed-params.resolver';

export const routes: Routes = [
    {
        path: '',
        title:"Budget",
        component: HomeComponent,
        canActivate: [canActivateAuthRole],
        runGuardsAndResolvers: 'always',
        resolve: {
            financial: resolveFinancialData,
            mb_parsed_params: resolveMarqueBlancheParsedParams
        }
    },
    {
        path: '**',
        redirectTo: '/'
    }
];
