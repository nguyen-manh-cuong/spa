import { RouterModule, Routes } from '@angular/router';

import { AuthComponent } from './auth.component';
import { LoginComponent } from './login/login.component';
import { NgModule } from '@angular/core';
import { RegisterComponent } from './register/register.component';
import { ResetComponent } from './reset-password/reset-password.component';
import { SecretComponent } from './secret/secret.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: AuthComponent,
        children: [
            { path: 'login', component: LoginComponent },
            { path: 'register', component: RegisterComponent },
            { path: 'reset-password', component: ResetComponent },
            { path: 'secret', component: SecretComponent}
        ]
      }
    ])
  ],
  exports: [
    RouterModule
  ]
})
export class AuthRoutingModule { }
