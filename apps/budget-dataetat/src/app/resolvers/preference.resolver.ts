import { inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { PreferenceResolverModel } from '@models/preference/preference-resolver.models';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { QueryParam } from 'apps/common-lib/src/lib/models/marqueblanche/query-params.enum';
import { PreferenceUsersHttpService } from 'apps/preference-users/src/public-api';

/**
 * Resolver simple pour le chargement des préférences utilisateur.
 * 
 * Ce resolver :
 * 1. Vérifie si un UUID de préférence est présent dans les query params
 * 2. Charge la préférence depuis l'API
 * 3. Retourne la préférence brute qui sera traitée dans le composant
 * 
 * Note: Le traitement des colonnes et préfiltres est fait dans le composant
 * car il nécessite l'initialisation préalable des services de mapping.
 */
export function preferenceResolver(route: ActivatedRouteSnapshot): Observable<PreferenceResolverModel> {
  const httpPreferenceService = inject(PreferenceUsersHttpService);

  // Vérification de la présence de l'UUID dans les query params
  const uuid = route.queryParams[QueryParam.Uuid];
  
  if (!uuid) {
    // Pas d'UUID, on retourne un résultat vide (pas d'erreur)
    return of({ data: undefined, error: undefined });
  }

  // Chargement simple de la préférence
  return httpPreferenceService.getPreference(uuid).pipe(
    map((preference): PreferenceResolverModel => ({ 
      data: preference, 
      error: undefined 
    })),
    catchError((error): Observable<PreferenceResolverModel> => {
      console.error('Erreur lors du chargement de la préférence:', error);
      return of({ data: undefined, error });
    })
  );
}