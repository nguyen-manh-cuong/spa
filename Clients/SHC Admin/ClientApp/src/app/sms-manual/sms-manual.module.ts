import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccountTypePipe } from 'pipes/account-type.pipe';
import { CommonModule } from '@angular/common';
import { IndexComponent } from './index/index.component';
import { NgModule } from '@angular/core';
import { TaskComponent } from '@app/sms-template-task/task/task.component';
import { SharedModule } from '@shared/shared.module';
import { SmsManualComponent } from './sms-manual.component';
import { SmsManualRoutingModule } from './sms-manual-routing.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { ValidationModule } from '@app/validation/validation.module';
import { NgxMaskModule } from 'ngx-mask';
import { SmsTemplateTaskModule } from '@app/sms-template-task/sms-template-task.module';
import { DetailComponent } from './detail/detail.component';


@NgModule({
    imports: [
        CommonModule,
        FormsModule, ReactiveFormsModule,
        SmsManualRoutingModule,
        SharedModule,
        UtilsModule,
        ValidationModule,
        SmsTemplateTaskModule,
        NgxMaskModule.forRoot()
    ],
    declarations: [SmsManualComponent, IndexComponent, DetailComponent],
    entryComponents: [DetailComponent]
})
export class SmsManualModule { }
