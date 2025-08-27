import { AsyncPipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';

import { AlertService } from "apps/common-lib/src/public-api";
import { debounceTime, distinctUntilChanged, finalize, map, Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
import { PreferenceUsersHttpService } from 'apps/preference-users/src/lib/services/preference-users-http.service';
import { Preference } from 'apps/preference-users/src/lib/models/preference.models';
import { COMMA, ENTER, S } from '@angular/cdk/keycodes';
import { DsfrAutocompleteComponent, DsfrCompleteEvent } from '@edugouvfr/ngx-dsfr-ext'
import { ReactiveFormsModule, FormGroup, FormBuilder, FormControl, FormArray } from '@angular/forms';
import { PreferenceService } from '@services/preference.service';


export interface FormPreference {
  name: FormControl<string>;
  shared: FormControl<boolean>;
  users: FormArray<FormControl<string>>;
}

@Component({
  selector: 'budget-modal-sauvegarde',
  templateUrl: './modal-sauvegarde.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./modal-sauvegarde.component.scss'],
  imports: [DsfrAutocompleteComponent, ReactiveFormsModule, AsyncPipe]
})
export class ModalSauvegardeComponent implements OnInit, OnDestroy {

  private _preferenceHttpService = inject(PreferenceUsersHttpService);
  private _preferenceService = inject(PreferenceService);
  private _alertService = inject(AlertService);
  private _formBuilder = inject(FormBuilder);
  
  public formPreference: FormGroup<FormPreference> = new FormGroup({
    name: new FormControl<string>("", { nonNullable: true }),
    shared: new FormControl<boolean>(false, { nonNullable: true }),
    users: new FormArray<FormControl<string>>([]),
  });

  public shareSearch: boolean = false;
  public search: string = '';
  public filterUser: any[] = [];
  
  public separatorKeysCodes: number[] = [ENTER, COMMA];

  public preference: Preference | null = null;

  public searchUserChanged = new Subject<string>();
  private destroy$ = new Subject<void>();

  public suggestions$: Observable<string[]> = of([]);
  public loading: boolean = false;
  public delay: number = 500

  ngOnInit() {
    this.preference = this._preferenceService.currentPreference
    if (this.preference) {
      this.formPreference = this._formBuilder.group({
        name: this._formBuilder.control<string>(this.preference.name ?? "", { nonNullable: true }),
        shared: this._formBuilder.control<boolean>(this.preference.shares?.length !== 0, { nonNullable: true }),
        users: this._formBuilder.array((this.preference.shares ?? []).map(s =>
          this._formBuilder.control(s.shared_username_email, { nonNullable: true })
        ))
      });
    }

    this.suggestions$ = this.searchUserChanged.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((term: string): Observable<string[]> => {
        this.loading = true;
        return this._preferenceHttpService.searchUser(term).pipe(
          map((response: { username: string }[]) => {
            if (response.length > 0) {
              return response
                .filter(userFound => this.formPreference.controls.users.value.findIndex(userSelect => userSelect === userFound.username) === -1)
                .map(u => u.username);
            } else if (this._isValidEmail(term)) {
              return [term];
            } else {
              return [];
            }
          }),
          finalize(() => (this.loading = false))
        );
      }),
      takeUntil(this.destroy$)
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  public onSearchAsync(event: DsfrCompleteEvent) {
    const value = event?.query?.toLowerCase() ?? '';
    this.searchUserChanged.next(value);
  }

  
  public validate(): void {
    
    const { name, shared, users } = this.formPreference.getRawValue();
    this.preference = {
      uuid: this.preference?.uuid,
      name,
      filters: this.preference?.filters ?? {},
      options: {
        grouping: [],
        displayOrder: []
      },
      shares: shared ? users.map(u => ({ shared_username_email: u })) : []
    }

    this._preferenceHttpService.savePreference(this.preference).subscribe((_response) => {
      this._alertService.openAlertSuccess('Filtre enregistré avec succès');
    });
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
