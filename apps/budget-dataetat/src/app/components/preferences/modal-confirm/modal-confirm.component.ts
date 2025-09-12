import { Component, inject, input } from '@angular/core';
import { Preference } from 'apps/preference-users/src/lib/models/preference.models';
import { PreferenceUsersHttpService } from 'apps/preference-users/src/lib/services/preference-users-http.service';

/**
 * Boite de dialogue pour la sélection des colonnes du tableau selon lesquelles regrouper les données.
 */
@Component({
    selector: 'budget-modal-confirm',
    templateUrl: './modal-confirm.component.html',
    standalone: true
})
export class ModalConfirmComponent {

  private _service = inject(PreferenceUsersHttpService);

  readonly preference = input<Preference>();
  readonly confirmAction = input<(preference: Preference) => void>();

  public validate(): void {
    
  const preference = this.preference();
  const confirmAction = this.confirmAction();
  if (preference && confirmAction) {
      confirmAction(preference)
    }
  }
}
