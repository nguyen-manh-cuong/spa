import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateComponent } from './sms-template.component';
import { IndexComponent } from './index/index.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { TemplateRoutingModule } from './sms-template-routing.module';
import { TaskComponent } from './task/task.component';
import { ValidationModule } from '@app/validation/validation.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,
    TemplateRoutingModule,
    SharedModule,
    UtilsModule,
    ValidationModule
  ],
  declarations: [TemplateComponent, IndexComponent, TaskComponent],
  entryComponents: [TaskComponent]
})
export class TemplateModule { }
