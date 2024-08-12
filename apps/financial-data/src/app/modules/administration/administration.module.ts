import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdministrationRoutingModule } from './administration-routing.module';
import { UploadFinancialComponent } from './upload-financial/upload-financial.component';
import {
  CommonLibModule,
  MaterialModule,
} from 'apps/common-lib/src/public-api';
import { MatDialogModule } from '@angular/material/dialog';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { UpdateTagsComponent } from './update-tags/update-tags.component';
import { NavCompagnonDSComponent } from './compagnon-ds/nav/nav.component';

@NgModule({
  declarations: [UploadFinancialComponent, UpdateTagsComponent, ConfirmDialogComponent],
  imports: [
    CommonModule,
    CommonLibModule,
    AdministrationRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    NavCompagnonDSComponent
  ],
})
export class AdministrationModule {}
