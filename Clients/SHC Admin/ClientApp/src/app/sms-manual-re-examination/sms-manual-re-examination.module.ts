import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccountTypePipe } from 'pipes/account-type.pipe';
import { CommonModule } from '@angular/common';
import { IndexComponent } from './index/index.component';
import { NgModule } from '@angular/core';

import { SharedModule } from '@shared/shared.module';
import { SmsManualReExaminationComponent } from './sms-manual-re-examination.component';
import { SmsManualReExaminationRoutingModule } from './sms-manual-re-examination-routing.module';

import { UtilsModule } from '@shared/utils/utils.module';
import { ValidationModule } from '@app/validation/validation.module';
import { NgxMaskModule } from 'ngx-mask';
import { SmsTemplateTaskModule } from '@app/sms-template-task/sms-template-task.module';
import { TaskComponent } from '@app/sms-template-task/task/task.component';


@NgModule({
    imports: [
        CommonModule,
        FormsModule, ReactiveFormsModule,
        SmsManualReExaminationRoutingModule,
        SharedModule,
        UtilsModule,
        ValidationModule,
        SmsTemplateTaskModule,
        NgxMaskModule.forRoot()
    ],
    declarations: [SmsManualReExaminationComponent, IndexComponent],
    entryComponents: [TaskComponent]
})
export class SmsManualReExaminationModule { }
