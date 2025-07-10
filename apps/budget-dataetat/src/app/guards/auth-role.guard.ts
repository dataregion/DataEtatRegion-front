import { AuthGuardData, createAuthGuard } from 'keycloak-angular';
import Keycloak from 'keycloak-js';
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot, UrlTree } from '@angular/router';
import { inject } from '@angular/core';

/**
 * The logic below is a simple example, please make it more robust when implementing in your application.
 *
 * Reason: isAccessGranted is not validating the resource, since it is merging all roles. Two resources might
 * have the same role name and it makes sense to validate it more granular.
 */
const isAccessAllowed = async (
    route: ActivatedRouteSnapshot,
    __: RouterStateSnapshot,
    authData: AuthGuardData
): Promise<boolean | UrlTree> => {
    const { authenticated, grantedRoles } = authData;

    // si non authentifié, on redirige vers le login
    if (authenticated === false){
        const k = inject(Keycloak);
        k.login();
    }

    const currentRoleUser = Object.values(grantedRoles.resourceRoles).flat();

    const requiredRoles = route.data['roles'];
    // Allow the user to to proceed if no additional roles are required to access the route.
    if (!(requiredRoles instanceof Array) || requiredRoles.length === 0) return authenticated;

    const hasRequiredRole = (rolesUser: string[]): boolean =>
        rolesUser.some((role) => currentRoleUser.includes(role))

    if (authenticated && hasRequiredRole(requiredRoles)) {
        return true;
    }
    return false;
};


export const canActivateAuthRole = createAuthGuard<CanActivateFn>(isAccessAllowed);