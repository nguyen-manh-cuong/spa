import { RouterModule, Routes } from '@angular/router';

import { AuthComponent } from './auth.component';
import { LoginComponent } from './login/login.component';
import { NgModule } from '@angular/core';
import { SecretComponent } from './secret/secret.component';
import { ResetComponent } from './reset-password/reset-password.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: AuthComponent,
        children: [
          { path: 'login', component: LoginComponent },
          { path: 'reset-password', component: SecretComponent},
          { path: 'secret', redirectTo:'login'},
          { path: '', redirectTo:'login'}
        ]
      }
    ])
  ],
  exports: [
    RouterModule
  ]
})
export class AuthRoutingModule { }
