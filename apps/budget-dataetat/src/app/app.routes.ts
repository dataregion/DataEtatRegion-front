import { CanActivateFn, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { canActivateAuthRole } from './guards/auth-role.guard';
import { resolveFinancialData } from './resolvers/financial-data.resolver';
import { resolveMarqueBlancheParsedParams } from './resolvers/marqueblanche-parsed-params.resolver';
import { Profil } from 'apps/common-lib/src/lib/models/profil.enum.model';
import { TermOfUseComponent } from 'apps/common-lib/src/lib/components/term-of-use/term-of-use.component';
import { inject } from '@angular/core';
import Keycloak from 'keycloak-js';
import { PreferenceComponent } from './components/preference/preference.component';
import { UpdateTagsComponent } from './components/administration/update-tags/update-tags.component';
import { BudgetFinancialComponent } from './components/administration/upload-financial/budget-financial.component';


export const profiles_required_for_upload_financial_page = [Profil.ADMIN, Profil.COMPTABLE];
export const profiles_required_for_tags_page = [Profil.USERS];
export const profiles_required_for_demarches = [Profil.USERS];


const registerRedirect: CanActivateFn = () => {
    const keycloak = inject(Keycloak);
    keycloak.register()
    return false;
}

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
        },
        children: [
            {
                path: 'preference',
                title: "Mes Recherches",
                component: PreferenceComponent
            },
            {
                path: 'cgu',
                title: "Conditions générales d'utilisation",
                component: TermOfUseComponent
            },
            {
                path: 'update-tags',
                title: "Gestion des tags",
                component: UpdateTagsComponent,
                canActivate: [canActivateAuthRole],
                data: {
                    roles: profiles_required_for_tags_page
                }
            },
            {
                path: 'upload',
                title: "Charger les données",
                component: BudgetFinancialComponent,
                canActivate: [canActivateAuthRole],
                data: {
                    roles: profiles_required_for_upload_financial_page
                }
            },
            //  {
            //     path: 'demarches',
            //     title: "Gestion des démarches",
            //     canActivate: [canActivateAuthRole],
            //     data: {
            //       roles: profiles_required_for_demarches
            //     },
            //     loadChildren: () =>
            //       import('./compagnon-ds/compagnon-ds.module').then((m) => m.CompagnonDSModule)
            //   }
        ]
    },
    {
        path: 'register',
        title: "S'enregistrer",
        canActivate: [registerRedirect],
        component: HomeComponent
    },
    {
        path: '**',
        redirectTo: '/'
    }
];
