import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  CommonLibModule,
  MaterialModule,
} from 'apps/common-lib/src/public-api';
import { MatDialogModule } from '@angular/material/dialog';

import { FormsModule } from '@angular/forms';
import { AdministrationRoutingModule } from './administration-routing.module';
import { UploadLaureatsComponent } from './upload-laureats/upload-laureats.component';

@NgModule({
  declarations: [UploadLaureatsComponent],
  imports: [
    CommonModule,
    CommonLibModule,
    AdministrationRoutingModule,
    MaterialModule,
    FormsModule,
    MatDialogModule,
  ],
})
export class AdministrationModule {}
