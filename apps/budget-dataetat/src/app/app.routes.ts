import { CanActivateFn, Routes } from '@angular/router';
import { authConnected, canAccess } from './guards/auth-role.guard';
import { resolveFinancialData } from './resolvers/financial-data.resolver';
import { resolveMarqueBlancheParsedParams } from './resolvers/marqueblanche-parsed-params.resolver';
import { Profil } from 'apps/common-lib/src/lib/models/profil.enum.model';
import { inject } from '@angular/core';
import Keycloak from 'keycloak-js';

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
        canActivate: [authConnected],
        runGuardsAndResolvers: 'always',
        children: [
            {
                path: '',
                title: "Budget",
                loadComponent: () => import('./components/home/home.component').then((m) => m.HomeComponent),
                resolve: {
                    financial: resolveFinancialData,
                    mb_parsed_params: resolveMarqueBlancheParsedParams
                },
            },
            {
                path: 'preference',
                title: "Mes Recherches",
                loadComponent: () =>
                    import('./components/preference/preference.component').then(m => m.PreferenceComponent)
            },
            {
                path: 'cgu',
                title: "Conditions générales d'utilisation",
                loadComponent: () =>
                    import('apps/common-lib/src/lib/components/term-of-use/term-of-use.component').then(m => m.TermOfUseComponent)
            },
            {
                path: 'update-tags',
                title: "Gestion des tags",
                loadComponent: () =>
                    import('./components/administration/update-tags/update-tags.component').then(m => m.UpdateTagsComponent),
                canActivate: [canAccess],
                data: {
                    roles: profiles_required_for_tags_page
                }
            },
            {
                path: 'upload',
                title: "Charger les données",
                loadComponent: () =>
                    import('./components/administration/upload-financial/budget-financial.component').then(m => m.BudgetFinancialComponent),
                canActivate: [canAccess],
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
        loadComponent: () => import('./components/home/home.component').then((m) => m.HomeComponent),
    },
    {
        path: '**',
        redirectTo: '/'
    }
];
