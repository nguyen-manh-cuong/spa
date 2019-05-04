import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DoctorComponent } from './doctor.component';
import { IndexComponent } from './index/index.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { DoctorRoutingModule } from './doctor-routing.module';
import { ValidationModule } from '@app/validation/validation.module';
import { NgxMaskModule } from 'ngx-mask';
import { CustomCurrencyPipe } from 'pipes/custom-currency.pipe';
import { MAT_CHECKBOX_CLICK_ACTION } from '@angular/material';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { DetailComponent } from './detail/detail.component';
import { TaskComponent } from './task/task.component';


@NgModule({
  imports: [
    CKEditorModule,
    CommonModule,
    FormsModule, 
    ReactiveFormsModule,
    DoctorRoutingModule,
    SharedModule,
    UtilsModule,
    ValidationModule,
    NgxMaskModule.forRoot()
  ],
  declarations: [CustomCurrencyPipe,DoctorComponent, IndexComponent, TaskComponent, DetailComponent],
  entryComponents: [TaskComponent,DetailComponent],
  providers:[{provide: MAT_CHECKBOX_CLICK_ACTION, useValue: 'noop'}]
})
export class DoctorModule { }
