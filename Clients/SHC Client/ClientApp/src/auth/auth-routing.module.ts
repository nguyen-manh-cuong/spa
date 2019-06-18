import { RouterModule, Routes } from '@angular/router';

import { AuthComponent } from './auth.component';
import { LoginComponent } from './login/login.component';
import { NgModule } from '@angular/core';
import { RegisterComponent } from './register/register.component';
import { ResetComponent } from './reset/reset.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: AuthComponent,
        children: [
            { path: 'login', component: LoginComponent },
            { path: 'register', component: RegisterComponent },
            { path: 'reset', component: ResetComponent}
        ]
      }
    ])
  ],
  exports: [
    RouterModule
  ]
})
export class AuthRoutingModule { }
