import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccountTypePipe } from 'pipes/account-type.pipe';
import { CommonModule } from '@angular/common';
import { IndexComponent } from './index/index.component';
import { NgModule } from '@angular/core';

import { SharedModule } from '@shared/shared.module';
import { SmsLogComponent } from './sms-log.component';
import { SmsLogRoutingModule } from './sms-log-routing.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { ValidationModule } from '@app/validation/validation.module';
import { NgxMaskModule } from 'ngx-mask';


@NgModule({
    imports: [
        CommonModule,
        FormsModule, ReactiveFormsModule,
        SmsLogRoutingModule,
        SharedModule,
        UtilsModule,
        ValidationModule,
        NgxMaskModule.forRoot()
    ],
    declarations: [SmsLogComponent, IndexComponent],
    entryComponents: []
})
export class SmsLogModule { }
