import { inject, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { User } from '../models/user.model';
import { Profil } from '../models/profil.enum.model';
import { AuthUtils } from './auth-utils.service';
import { Optional } from '../utilities/optional.type';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private _userInfo: User | null = null;
  private auth_utils = inject(AuthUtils);

  public authenticated$ = new Subject<void>();
  public userInfo$ = new Subject<User | null>();
  public region_code: Optional<string> = null

  constructor() {}

  // eslint-disable-next-line no-undef
  public setAuthentication(info: Keycloak.KeycloakProfile, roles: any, region_code?: string): void {
    this._userInfo = info as User;
    this._userInfo.roles = this.auth_utils.roles_to_uppercase(roles);
    this.region_code = region_code;
    this.userInfo$.next(this._userInfo);
    this.authenticated$.next();
  }

  public getUser(): Observable<User | null> {
    return this.userInfo$.asObservable();
  }

  /**
   * Return state of User Connected
   */
  public getCurrentAccount(): User | null {
    return this._userInfo;
  }

  public isAdmin(): boolean {
    return this._userInfo !== null && this._userInfo?.roles.includes(Profil.ADMIN);
  }

  /**
   * Vérifie si l'utilisateur a au moins un des roles
   * @param profiles
   * @returns
   */
  public hasOneRole(profiles: Profil[]): boolean {
    if (this._userInfo === null) return false;

    const roles = profiles.map((p) => p.toString());
    const isIncluded = this._userInfo.roles.some((element) => roles.includes(element));

    return isIncluded;
  }
}
