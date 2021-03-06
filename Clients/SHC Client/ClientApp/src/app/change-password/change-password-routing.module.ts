import { RouterModule, Routes } from '@angular/router';

import { IndexComponent } from './index/index.component';
import { ChangePasswordComponent } from './change-password.component';
import { NgModule } from '@angular/core';

const routes: Routes = [{
  path: '',
  component: ChangePasswordComponent,
  children: [
      { path: 'index', component: IndexComponent },
      { path: '', redirectTo: 'index' }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChangePasswordRoutingModule { }
