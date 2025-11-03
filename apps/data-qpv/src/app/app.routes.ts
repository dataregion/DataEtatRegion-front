import { CanActivateFn, Routes } from '@angular/router';
import { authConnected } from './guards/auth-role.guard';
import { resolveFinancialData } from './resolvers/financial-data.resolver';
import { resolveMarqueBlancheParsedParams } from './resolvers/marqueblanche-parsed-params.resolver';
import { inject } from '@angular/core';
import Keycloak from 'keycloak-js';


const registerRedirect: CanActivateFn = () => {
    const keycloak = inject(Keycloak);
    keycloak.register()
    return false;
}

export const routes: Routes = [
    {
        path: '',
        title: "Données des quartiers prioritaires de la politique de la ville",
        canActivate: [authConnected],
        runGuardsAndResolvers: 'always',
        children: [
            {
                path: '',
                title: "Données des quartiers prioritaires de la politique de la ville",
                loadComponent: () => import('./components/home/home.component').then((m) => m.HomeComponent),
                resolve: {
                    financial: resolveFinancialData,
                    mb_parsed_params: resolveMarqueBlancheParsedParams,
                },
            },
            {
                path: 'cgu',
                title: "Conditions générales d'utilisation",
                loadComponent: () =>
                    import('apps/common-lib/src/lib/components/term-of-use/term-of-use.component').then(m => m.TermOfUseComponent)
            }
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
