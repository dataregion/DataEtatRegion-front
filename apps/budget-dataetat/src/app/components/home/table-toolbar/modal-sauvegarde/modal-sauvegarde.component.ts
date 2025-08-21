import { CommonModule } from '@angular/common';
import { Component, inject, input, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

import { GridInFullscreenStateService } from 'apps/common-lib/src/lib/services/grid-in-fullscreen-state.service';
import {
  TableData,
  VirtualGroup
} from 'apps/grouping-table/src/lib/components/grouping-table/group-utils';
import { MaterialModule } from "apps/common-lib/src/public-api";
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSelectChange } from '@angular/material/select';
import { Colonne } from '@models/financial/colonnes.models';
import { debounceTime, Subject } from 'rxjs';
import { PreferenceUsersHttpService } from 'apps/preference-users/src/lib/services/preference-users-http.service';
import { Preference } from 'apps/preference-users/src/lib/models/preference.models';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { DsfrAutocompleteComponent, DsfrCompleteEvent } from '@edugouvfr/ngx-dsfr-ext'
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'budget-modal-sauvegarde',
  templateUrl: './modal-sauvegarde.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./modal-sauvegarde.component.scss'],
  imports: [DsfrAutocompleteComponent, FormsModule ]
})
export class ModalSauvegardeComponent implements OnInit {
  
  private _service = inject(PreferenceUsersHttpService);

  public shareSearch: boolean = false;
  public search: string = '';
  public filterUser: any[] = [];
  
  public separatorKeysCodes: number[] = [ENTER, COMMA];
  // public preference: Preference;

  public searchUserChanged = new Subject<string>();

  constructor() {
    // this.searchUserChanged.pipe(debounceTime(300)).subscribe(() => {
    //   this._searchUser();
    // });
  }

  ngOnInit() {
    
  }

  public searchUser(event: DsfrCompleteEvent) {
    if (this.search.length > 3) {
      this._service.searchUser(this.search).subscribe((response) => {
        if (response.length > 0) {
          // on filtre pour éviter les doublons
          this.filterUser = response.filter(
            (userInResponse: { username: string }) =>
              console.log(userInResponse)
              // this.preference?.shares?.findIndex(
              //   (userSelect) => userSelect.shared_username_email === userInResponse.username
              // ) === -1
          );
        } else if (this._isValidEmail(this.search)) {
          this.filterUser = [{ username: this.search }];
        } else {
          this.filterUser = [];
        }
      });
    }
  }

  /**
   * Check la validité d'un courriel
   * @param email
   * @returns
   */
  private _isValidEmail(email: string) {
    const emailRegex =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(email);
  }

}
