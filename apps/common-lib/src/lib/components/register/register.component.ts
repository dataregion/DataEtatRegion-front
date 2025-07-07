import { Component, inject } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

@Component({
    selector: 'lib-register',
    template: '',
    standalone: false
})
/* eslint no-unused-vars: 0 */ // --> OFF
export class RegisterComponent {
  protected readonly keycloak = inject(KeycloakService);

  // redirection vers la page de création de compte
  constructor() {
    this.keycloak.register();
  }
}
