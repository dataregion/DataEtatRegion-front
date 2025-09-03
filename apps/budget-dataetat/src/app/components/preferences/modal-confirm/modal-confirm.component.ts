import { Component, inject, Input } from '@angular/core';
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

  @Input() preference: Preference | undefined
  @Input() confirmAction?: (preference: Preference) => void;

  public validate(): void {
    
  if (this.preference && this.confirmAction) {
      this.confirmAction(this.preference)
    }
  }
}
