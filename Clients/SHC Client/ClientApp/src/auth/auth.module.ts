import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AuthComponent } from './auth.component';
import { AuthRoutingModule } from './auth-routing.module';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { LoginService } from './login/login.service';
import { NgModule } from '@angular/core';
import { RegisterComponent } from './register/register.component';
import { SharedModule } from '@shared/shared.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { ValidationModule } from '@app/validation/validation.module';
import { NgxMaskModule } from 'ngx-mask';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ResetComponent } from './reset/reset.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule, ReactiveFormsModule,
        AuthRoutingModule,
        SharedModule,
        UtilsModule,
        ValidationModule,
        NgxSpinnerModule,
        NgxMaskModule.forRoot()
    ],
    declarations: [LoginComponent, AuthComponent, RegisterComponent, ResetComponent],
    providers: [
        LoginService
    ]
})
export class AuthModule { }
