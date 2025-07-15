import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { canActivateAuthRole } from './guards/auth-role.guard';
import { resolveFinancialData } from './resolvers/financial-data.resolver';
import { resolveMarqueBlancheParsedParams } from './resolvers/marqueblanche-parsed-params.resolver';
import { Profil } from 'apps/common-lib/src/lib/models/profil.enum.model';
import { TermOfUseComponent } from 'apps/common-lib/src/lib/components/term-of-use/term-of-use.component';

export const profiles_required_for_upload_page = [Profil.ADMIN];
export const profiles_required_for_tags_page = [Profil.USERS];
export const profiles_required_for_demarches = [Profil.USERS];

export const routes: Routes = [
    {
        path: '',
        title: "Budget",
        component: HomeComponent,
        canActivate: [canActivateAuthRole],
        runGuardsAndResolvers: 'always',
        resolve: {
            financial: resolveFinancialData,
            mb_parsed_params: resolveMarqueBlancheParsedParams
        }
    },
    //      {
    //     path: 'aide',
    //     component: HelpComponent,
    //     canActivate: [keycloakAuthGuardCanActivate],
    //     runGuardsAndResolvers: 'always',
    //   },
    {
        path: 'cgu',
        component: TermOfUseComponent,
        canActivate: [canActivateAuthRole],
    },
    {
        path: '**',
        redirectTo: '/'
    }
];
