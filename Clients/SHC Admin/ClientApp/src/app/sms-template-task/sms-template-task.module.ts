import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TaskComponent } from './task/task.component';
import { SharedModule } from '@shared/shared.module';
import { SmsTemplateComponent } from './sms-template-task.component';
import { SmsTemplateTaskRoutingModule } from './sms-template-task-routing.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { ValidationModule } from '@app/validation/validation.module';
import { NgxMaskModule } from 'ngx-mask';


@NgModule({
    imports: [
        CommonModule,
        FormsModule, ReactiveFormsModule,
        SmsTemplateTaskRoutingModule,
        SharedModule,
        UtilsModule,
        ValidationModule,
        NgxMaskModule.forRoot()
    ],
    declarations: [SmsTemplateComponent, TaskComponent],
    entryComponents: [SmsTemplateComponent, TaskComponent]
})
export class SmsTemplateTaskModule { }
