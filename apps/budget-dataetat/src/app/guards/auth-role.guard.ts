import { AuthGuardData, createAuthGuard } from 'keycloak-angular';
import Keycloak from 'keycloak-js';
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { SessionService } from 'apps/common-lib/src/public-api';
import { jwtDecode } from 'jwt-decode';

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
    const keycloak = inject(Keycloak);
    const sessionService = inject(SessionService);

    // si non authentifié, on redirige vers le login
    if (authenticated === false) {
        keycloak.login();
    }
    const userProfile = await keycloak.loadUserProfile()
    const accessToken = keycloak.token ?? '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const decodedAccessToken: Record<string, any> = jwtDecode(accessToken);
    const code_region = decodedAccessToken['region'] ?? null
    const currentRoleUser = Object.values(grantedRoles.resourceRoles).flat();

    sessionService.setAuthentication(
        userProfile,
        currentRoleUser,
        code_region
    );

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