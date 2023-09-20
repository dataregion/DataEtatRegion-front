import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertSnackBarComponent } from './components/snackbar/alert-snackbar.component';
import { LocalisationComponent } from './components/localisation/localisation.component';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { RegisterComponent } from './components/register/register.component';
import { TermOfUseComponent } from './components/term-of-use/term-of-use.component';
import { DisplayDateComponent } from './components/display-date/display-date.component';
import { AdvancedChipsMultiselectComponent } from './components/advanced-chips-multiselect/advanced-chips-multiselect.component';
import { SelectMultiFilterComponent } from './components/select-multi-filter/select-multi-filter.component';

@NgModule({
  declarations: [
    AlertSnackBarComponent,
    FooterComponent,
    RegisterComponent,
    TermOfUseComponent,
  ],
  imports: [
    CommonModule,
    LocalisationComponent,
    ReactiveFormsModule,
    FormsModule,
    HeaderComponent,
    DisplayDateComponent,
    AdvancedChipsMultiselectComponent,
    SelectMultiFilterComponent,
  ],
  exports: [
    AlertSnackBarComponent,
    LocalisationComponent,
    HeaderComponent,
    DisplayDateComponent,
    FooterComponent,
    TermOfUseComponent,
    RegisterComponent,
    AdvancedChipsMultiselectComponent,
    SelectMultiFilterComponent,
  ],
})
export class CommonLibModule {}
