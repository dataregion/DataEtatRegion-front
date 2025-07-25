import { inject, Injectable } from '@angular/core';
import { Location } from '@angular/common';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  CanMatchFn,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular';
import { SessionService } from 'apps/common-lib/src/public-api';
import { NGXLogger } from 'ngx-logger';
import { AuthUtils } from '../services/auth-utils.service';
import { jwtDecode } from 'jwt-decode';
 

@Injectable({
  providedIn: 'root'
})
export class AuthGuard extends KeycloakAuthGuard {
  constructor(
    protected override readonly router: Router,
    protected readonly keycloak: KeycloakService,
    protected location: Location,
    protected sessionService: SessionService,
    protected auth_utils: AuthUtils,
    private _logger: NGXLogger
  ) {
    super(router, keycloak);
  }

   

  private _current_roles = null;
  public current_region = null;

  get current_roles(): string[] {
    if (!this._current_roles) this._current_roles = this.auth_utils.roles_to_uppercase(this.roles);
    return this._current_roles!;
  }

  get currentlyAuthenticated() {
    return this.authenticated;
  }

  public async isAccessAllowed(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // Force the user to log in if currently unauthenticated.
    if (!this.authenticated) {
      this._logger.debug(`[AuthGuard] keycloak login`);
      await this.keycloak.login({
        redirectUri: window.location.origin + this.location.prepareExternalUrl(state.url)
      });
    }

    const userProfile = await this.keycloak.loadUserProfile()
    const accessToken = await this.keycloak.getToken()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const decodedAccessToken: Record<string, any> = jwtDecode(accessToken);
    const code_region = decodedAccessToken['region'] ?? null
    this.current_region = code_region
    this.sessionService.setAuthentication(
      userProfile,
      this.keycloak.getUserRoles(),
      code_region
    );

    // Get the roles required from the route.
    const requiredRoles = route.data['roles'];

    // Allow the user to to proceed if no additional roles are required to access the route.
    if (!(requiredRoles instanceof Array) || requiredRoles.length === 0) return true;

    // Allow the user to proceed if one role is present
    return this.has_any_roles(requiredRoles);
  }

  public has_any_roles(roles: string[]): boolean {
    if (!this.current_roles) return false;
    return roles.some((role) => this.current_roles.includes(role));
  }
}

/**
 * Vérifie les roles de la personne authentifiée.
 * si aucune authentification, on match
 */
export const keycloakAuthGuardCanMatchAccordingToRoles: CanMatchFn = (route) => {
  const data = route.data;
  const requiredRoles: string[] = data ? data['roles'] : [];

  const guard = inject(AuthGuard);

  if (!guard.currentlyAuthenticated) return true;

  return guard.has_any_roles(requiredRoles);
};

export const keycloakAuthGuardCanActivate: CanActivateFn = (route, state) => {
  const guard = inject(AuthGuard);
  return guard.canActivate(route, state);
};

export const guardIsNotNational: CanActivateFn = async (route, state) => {
  
  const guard = inject(AuthGuard);
  const router = inject(Router);

  await guard.canActivate(route, state);
  if (guard.current_region === 'NAT' && state.url !== '/') {
    return router.navigateByUrl('/');
  }

  return true;
};