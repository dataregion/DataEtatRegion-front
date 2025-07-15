import { Component, Input, computed, inject } from '@angular/core';
import { SessionService } from '../../services/session.service';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'lib-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [MatIconModule, MatTooltipModule, CommonModule, RouterModule, MatMenuModule]
})
export class HeaderComponent {
  protected session = inject(SessionService);
  private _keycloak = inject(Keycloak);

  @Input()
  title: string = '';

  @Input()
  subTitle: string = '';

  @Input()
  logo: string = 'DataEtat.svg';

  @Input()
  displayPreference: boolean = true;

  public isLoggedIn = computed(() => {
    const user = this.session.getUser();
    if (user !== null) return true;
    return false;
  });

  public isNational = computed(() => {
    const region = this.session.regionCode()
    return region === "NAT";
  });

  public logout() {
    this._keycloak.logout();
  }

}
