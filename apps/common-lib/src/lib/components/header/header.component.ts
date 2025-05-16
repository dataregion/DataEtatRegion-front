import { Component, Input, OnInit } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { SessionService } from '../../services/session.service';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { User } from '../../models/user.model';

@Component({
    selector: 'lib-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    imports: [MatIconModule, MatTooltipModule, CommonModule, RouterModule, MatMenuModule]
})
export class HeaderComponent implements OnInit {
  public isLoggedIn = false;
  public user: User | null = null;

  @Input()
  title: string = '';

  @Input()
  subTitle: string = '';

  @Input()
  logo: string = 'DataEtat.svg';

  @Input()
  displayPreference: boolean = true;

  constructor(
    protected session: SessionService,  
    private _keycloak: KeycloakService
  ) {}

  public ngOnInit() {
    this.session.getUser().subscribe((user) => {
      if (user != null) {
        this.isLoggedIn = true;
        this.user = user;
      }
    });
  }

  public logout() {
    this._keycloak.logout().then(() => {
      this._keycloak.clearToken();
    });
    this.isLoggedIn = false;
  }
}
