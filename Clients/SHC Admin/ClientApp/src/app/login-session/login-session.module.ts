import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TaskSessionComponent } from './task/task_session.component';
import { SharedModule } from '@shared/shared.module';
import { LoginSessionComponent } from './login-session.component';
import { LoginSessionRoutingModule } from './login-session-routing.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { ValidationModule } from '@app/validation/validation.module';
import { NgxMaskModule } from 'ngx-mask';
import { LoginService } from '../../auth/login/login.service';


@NgModule({
    imports: [
        CommonModule,
        FormsModule, ReactiveFormsModule,
        LoginSessionRoutingModule,
        SharedModule,
        UtilsModule,
        ValidationModule,
        NgxMaskModule.forRoot()
    ],
    declarations: [LoginSessionComponent, TaskSessionComponent],
    entryComponents: [LoginSessionComponent, TaskSessionComponent],
    providers: [
        LoginService,
    ],
})
export class LoginSessionModule { }
