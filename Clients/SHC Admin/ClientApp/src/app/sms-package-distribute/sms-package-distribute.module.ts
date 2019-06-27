import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { packagedistributeIndexComponent } from './index/index.component';
import { SmsComponent } from './sms-package-distribute.component';
import { SmsRoutingModule } from './sms-package-distribute-routing.module';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { packagedistributeTaskComponent } from './task/task.component';
import { UtilsModule } from '@shared/utils/utils.module';
import { packagedistributeViewComponent } from './view/view.component';
import { packagedistributeEditComponent } from './edit/edit.component';
import { ValidationModule } from '@app/validation/validation.module';
import { NgxMaskModule } from 'ngx-mask';
import { SelectAutocompleteModule } from '@app/mat-select-autocomplete/select-autocomplete.module';
import { MatSelectSearchModule } from '@app/mat-select-search/mat-select-search.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    UtilsModule,
    ValidationModule,
    SmsRoutingModule,
    SelectAutocompleteModule,
    MatSelectSearchModule,
    NgxMaskModule.forRoot()
  ],
  declarations: [SmsComponent, packagedistributeIndexComponent, packagedistributeTaskComponent, packagedistributeViewComponent,packagedistributeEditComponent],
  entryComponents: [packagedistributeTaskComponent, packagedistributeViewComponent,packagedistributeEditComponent]
})
export class SmsModule { }
