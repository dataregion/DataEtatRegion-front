import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertSnackBarComponent } from './components/snackbar/alert-snackbar.component';
import { LocalisationComponent } from './components/localisation/localisation.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { RegisterComponent } from './components/register/register.component';
import { TermOfUseComponent } from './components/term-of-use/term-of-use.component';
import { DisplayDateComponent } from './components/display-date/display-date.component';
import { AdvancedChipsMultiselectComponent } from './components/advanced-chips-multiselect/advanced-chips-multiselect.component';
import { SelectMultipleComponent } from './components/select-multiple/select-multiple.component';
import { BopsReferentielsComponent } from './components/bops-referentiels/bops-referentiels.component';
import { SelectSimpleComponent } from './components/select-simple/select-simple.component';

@NgModule({
  declarations: [AlertSnackBarComponent, FooterComponent, RegisterComponent, TermOfUseComponent],
  imports: [
    CommonModule,
    BopsReferentielsComponent,
    LocalisationComponent,
    ReactiveFormsModule,
    FormsModule,
    HeaderComponent,
    DisplayDateComponent,
    AdvancedChipsMultiselectComponent,
    SelectMultipleComponent,
    SelectSimpleComponent
  ],
  exports: [
    AlertSnackBarComponent,
    BopsReferentielsComponent,
    LocalisationComponent,
    HeaderComponent,
    DisplayDateComponent,
    FooterComponent,
    TermOfUseComponent,
    RegisterComponent,
    AdvancedChipsMultiselectComponent,
    SelectMultipleComponent,
    SelectSimpleComponent
  ]
})
export class CommonLibModule {}
