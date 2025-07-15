import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { User } from '../models/user.model';
import { Profil } from '../models/profil.enum.model';
import { AuthUtils } from './auth-utils.service';
import { Optional } from '../utilities/optional.type';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private auth_utils = inject(AuthUtils);

  /** @deprecated */
  public authenticated$ = new Subject<void>();
  /** @deprecated user user Signals this.user*/
  public userInfo$ = new Subject<User | null>();
  /** @deprecated use regionCode signals this.regionCode*/
  public region_code: Optional<string> = null;

  public regionCode = signal<string | undefined>(undefined);
  public user = signal<User | null>(null);

  public hasRoleAdmin = computed(() => {
    const user = this.user();
    return user !== null && user.roles.includes(Profil.ADMIN);
  });



  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public setAuthentication(info: Keycloak.KeycloakProfile, roles: any, region_code?: string): void {
    const user = info as User;
    user.roles = this.auth_utils.roles_to_uppercase(roles);
    this.region_code = region_code;
    this.user.set(user);
    this.regionCode.set(region_code);
    this.userInfo$.next(this.user());
    this.authenticated$.next();
  }

  public getUser(): Observable<User | null> {
    return this.userInfo$.asObservable();
  }

  /**
   * 
   * @returns 
   * @deprecated use signal user
   */
  public getCurrentAccount(): User | null {
    return this.user();
  }

  /**
   * 
   * @returns 
   * @deprecated use hasRoleAdmin signal computed
   */
  public isAdmin(): boolean {
    const user = this.user()
    return user !== null && user.roles.includes(Profil.ADMIN);
  }

  /**
   * Vérifie si l'utilisateur a au moins un des roles
   * @param profiles
   * @returns
   */
  public hasOneRole(profiles: Profil[]): boolean {
    const user = this.user();
    if (user === null) return false;

    const roles = profiles.map((p) => p.toString());
    const isIncluded = user.roles.some((element) => roles.includes(element));

    return isIncluded;
  }
}
