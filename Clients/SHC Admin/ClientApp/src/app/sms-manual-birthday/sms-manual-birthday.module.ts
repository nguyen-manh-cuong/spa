import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IndexComponent } from './index/index.component';
import { NgModule } from '@angular/core';

import { SharedModule } from '@shared/shared.module';
import { SmsManualBirthdayComponent } from './sms-manual-birthday.component';
import { SmsManualBirthdayRoutingModule } from './sms-manual-birthday-routing.module';
import { TaskComponent } from '@app/sms-template-task/task/task.component';
import { UtilsModule } from '@shared/utils/utils.module';
import { ValidationModule } from '@app/validation/validation.module';
import { NgxMaskModule } from 'ngx-mask';
import { SmsTemplateTaskModule } from '@app/sms-template-task/sms-template-task.module';


@NgModule({
    imports: [
        CommonModule,
        FormsModule, ReactiveFormsModule,
        SmsManualBirthdayRoutingModule,
        SharedModule,
        UtilsModule,
        ValidationModule,
        SmsTemplateTaskModule,
        NgxMaskModule.forRoot()
    ],
    declarations: [SmsManualBirthdayComponent, IndexComponent],
    entryComponents: [TaskComponent]
})
export class SmsManualBirthdayModule { }
