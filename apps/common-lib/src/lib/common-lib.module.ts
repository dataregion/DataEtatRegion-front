import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertSnackBarComponent } from './components/snackbar/alert-snackbar.component';
import { LocalisationComponent } from './components/localisation/localisation.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderLegacyComponent } from './components/header-legacy/header-legacy.component';
import { RegisterComponent } from './components/register/register.component';
import { DisplayDateComponent } from './components/display-date/display-date.component';
import { AdvancedChipsMultiselectComponent } from './components/advanced-chips-multiselect/advanced-chips-multiselect.component';
import { SelectMultipleComponent } from './components/select-multiple/select-multiple.component';
import { BopsReferentielsComponent } from './components/bops-referentiels/bops-referentiels.component';
import { SelectSimpleComponent } from './components/select-simple/select-simple.component';
import { SpinnerComponent } from './components/spinner/spinner.component';

@NgModule({
  declarations: [AlertSnackBarComponent, RegisterComponent],
  imports: [
    CommonModule,
    BopsReferentielsComponent,
    LocalisationComponent,
    ReactiveFormsModule,
    FormsModule,
    HeaderLegacyComponent,
    DisplayDateComponent,
    AdvancedChipsMultiselectComponent,
    SelectMultipleComponent,
    SelectSimpleComponent,
    SpinnerComponent,
  ],
  exports: [
    AlertSnackBarComponent,
    BopsReferentielsComponent,
    LocalisationComponent,
    HeaderLegacyComponent,
    DisplayDateComponent,
    RegisterComponent,
    AdvancedChipsMultiselectComponent,
    SelectMultipleComponent,
    SelectSimpleComponent,
    SpinnerComponent,
  ]
})
export class CommonLibModule { }
