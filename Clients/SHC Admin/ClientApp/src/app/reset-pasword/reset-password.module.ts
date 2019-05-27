import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TaskComponent } from './task/task.component';
import { SharedModule } from '@shared/shared.module';
import { ResetPasswordComponent } from './reset-password.component';
import { ResetPasswordRoutingModule } from './reset-password-routing.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { ValidationModule } from '@app/validation/validation.module';
import { NgxMaskModule } from 'ngx-mask';


@NgModule({
    imports: [
        CommonModule,
        FormsModule, ReactiveFormsModule,
        ResetPasswordRoutingModule,
        SharedModule,
        UtilsModule,
        ValidationModule,
        NgxMaskModule.forRoot()
    ],
    declarations: [ResetPasswordComponent, TaskComponent],
    entryComponents: [ResetPasswordComponent, TaskComponent]
})
export class ResetPasswordModule { }
