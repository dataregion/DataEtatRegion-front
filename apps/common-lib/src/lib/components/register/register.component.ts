import { Component } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

@Component({
    selector: 'lib-register',
    template: '',
    standalone: false
})
/* eslint no-unused-vars: 0 */ // --> OFF
export class RegisterComponent {
  // redirection vers la page de création de compte
  constructor(protected readonly keycloak: KeycloakService) {
    this.keycloak.register();
  }
}
