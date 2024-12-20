import { NgModule } from '@angular/core';
import { PreferenceUsersComponent } from './components/preference-users.component';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';

import { SavePreferenceDialogComponent } from './components/save-filter/save-preference-dialog.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';

@NgModule({
  declarations: [PreferenceUsersComponent, SavePreferenceDialogComponent, ConfirmDialogComponent],
  imports: [
    MatCardModule,
    MatButtonModule,
    MatExpansionModule,
    MatTooltipModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatTableModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatIconModule,
    MatInputModule,
    MatDialogModule,
    MatFormFieldModule
  ],
  exports: [PreferenceUsersComponent, SavePreferenceDialogComponent, ConfirmDialogComponent]
})
export class PreferenceUsersModule {}
