import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AuthComponent } from './auth.component';
import { AuthRoutingModule } from './auth-routing.module';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { LoginService } from './login/login.service';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { ValidationModule } from '@app/validation/validation.module';
import { ResetComponent } from './reset/reset.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule, ReactiveFormsModule,
        AuthRoutingModule,
        SharedModule,
        ValidationModule,
        UtilsModule
    ],
    declarations: [LoginComponent, AuthComponent, ResetComponent],
    providers: [
        LoginService
    ]
})
export class AuthModule { }
