import { CanActivateFn, Routes } from '@angular/router';
import { resolveFinancialData } from './resolvers/financial-data.resolver';
import { resolveMarqueBlancheParsedParams } from './resolvers/marqueblanche-parsed-params.resolver';
import { preferenceResolver } from './resolvers/preference.resolver';
import { Profil } from 'apps/common-lib/src/lib/models/profil.enum.model';
import { inject } from '@angular/core';
import Keycloak from 'keycloak-js';
import { resolveInfosSupplementaires } from './resolvers/informations-supplementaires-resolver';
import { _path_full } from './modules/informations-supplementaires/routes';
import { authConnected, canAccess } from 'apps/appcommon/src/lib/guards/auth-role.guard';

export const profiles_required_for_upload_financial_page = [Profil.ADMIN, Profil.COMPTABLE];
export const profiles_required_for_tags_page = [Profil.USERS];
export const profiles_required_for_demarches = [Profil.USERS];


const registerRedirect: CanActivateFn = () => {
    const keycloak = inject(Keycloak);
    keycloak.register()
    return false;
}

function info_supplementaires_path() {
  return _path_full(':source', ':id');
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
                    financial: resolveFinancialData, // charge les referentiels
                    mb_parsed_params: resolveMarqueBlancheParsedParams, // Charge la marque blanche
                    preference: preferenceResolver // charge la préférence utilisateur si UUID présent
                },
            },
            {
                path: 'preference',
                title: "Mes Recherches",
                loadComponent: () =>
                    import('./components/preferences/preferences.component').then(m => m.PreferencesComponent)
            },
            {
                path: 'exports',
                title: "Mes Exports",
                loadComponent: () =>
                    import('./components/exports/exports.component').then(m => m.ExportsComponent)
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
                    import('./components/administration/upload-financial-wrapper/budget-financial-wrapper.component').then(m => m.BudgetFinancialWrapperComponent),
                canActivate: [canAccess],
                data: {
                    roles: profiles_required_for_upload_financial_page
                }
            },
            {
                path: 'demarches',
                title: "Gestion des démarches",
                canActivate: [canAccess],
                data: {
                    roles: profiles_required_for_demarches
                },
                runGuardsAndResolvers: 'always',
                loadChildren: () =>
                    import('./modules/compagnon-ds/compagnon-ds.module').then((m) => m.CompagnonDSModule)
            },
            {
                path: info_supplementaires_path(),
                title: "Détails d'une ligne financière",
                canActivate: [canAccess],
                data: {
                    roles: profiles_required_for_demarches
                },
                runGuardsAndResolvers: 'always',
                resolve: {
                    infos_supplementaires: resolveInfosSupplementaires
                },
                loadComponent: () =>
                    import('./components/infos-ligne/infos-ligne.component').then(m => m.InfosLigneComponent),
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
