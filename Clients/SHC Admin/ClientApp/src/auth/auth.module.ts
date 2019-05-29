import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AuthComponent } from './auth.component';
import { AuthRoutingModule } from './auth-routing.module';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { LoginService } from './login/login.service';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { SecretComponent } from './secret/secret.component';
import { ResetComponent } from './reset-password/reset-password.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule, ReactiveFormsModule,
        AuthRoutingModule,
        SharedModule,
        UtilsModule
    ],
    declarations: [LoginComponent, AuthComponent, SecretComponent, ResetComponent],
    providers: [
        LoginService
    ]
})
export class AuthModule { }
