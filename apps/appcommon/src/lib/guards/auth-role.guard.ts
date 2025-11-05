import { AuthGuardData, createAuthGuard } from 'keycloak-angular';
import Keycloak from 'keycloak-js';
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { SessionService } from 'apps/common-lib/src/public-api';
import { jwtDecode } from 'jwt-decode';
import { LoggerService } from 'apps/common-lib/src/lib/services/logger.service';


const checkUserConnected = async (
    _: ActivatedRouteSnapshot,
    __: RouterStateSnapshot,
    authData: AuthGuardData
): Promise<boolean | UrlTree> => {
    const { authenticated, grantedRoles } = authData;
    const sessionService = inject(SessionService);
    const keycloak = inject(Keycloak);

    // si non authentifié, on redirige vers le login
    if (authenticated === false) {
        keycloak.login();
    }

    // si le user est null, on load son profile via Keycloak
    if (sessionService.user() === null) {
        inject(LoggerService).debug('Retrieve user session');
        const userProfile = await keycloak.loadUserProfile()
        const accessToken = keycloak.token ?? '';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const decodedAccessToken: Record<string, any> = jwtDecode(accessToken);
        const code_region = decodedAccessToken['region'] ?? null
        const roleUser = Object.values(grantedRoles.resourceRoles).flat();

        sessionService.setAuthentication(
            userProfile,
            roleUser,
            code_region
        );
    }
    return authenticated;
}

/**
 * Check si l'utilisateur est autorisé en checkant les roles.
 * Si pas de roles positionné dans la route `route.data['roles'];`, alors on considère que l'accès est refusé
 *
 */
const isAccessAllowed = async (
    route: ActivatedRouteSnapshot,
    __: RouterStateSnapshot,
    authData: AuthGuardData
): Promise<boolean | UrlTree> => {
    const keycloak = inject(Keycloak);
    const sessionService = inject(SessionService);
    const logger = inject(LoggerService);

    logger.debug('check isAccessAllowed');

    // si non authentifié, on redirige vers le login
    if (authData.authenticated === false) {
        keycloak.login();
    }

    const user = sessionService.user();
    if (user === null) return false;

    const currentRoleUser: string[] = user.roles;

    const requiredRoles = route.data['roles'];
    // Allow the user to to proceed if no additional roles are required to access the route.
    // si pas de requiredRoles on sort
    if (!(requiredRoles instanceof Array) || requiredRoles.length === 0) return false;

    logger.debug('check hasRequiredRole ', requiredRoles);
    const hasRequiredRole = (rolesUser: string[]): boolean =>
        rolesUser.some((role) => currentRoleUser.includes(role))

    if (authData.authenticated && hasRequiredRole(requiredRoles)) {
        return true;
    }
    return false;
};



export const authConnected = createAuthGuard<CanActivateFn>(checkUserConnected);

export const canAccess = createAuthGuard<CanActivateFn>(isAccessAllowed);