import { RouterModule, Routes } from '@angular/router';

import { packagedistributeIndexComponent } from './index/index.component';
import { SmsComponent } from './sms-package-distribute.component';
import { NgModule } from '@angular/core';

const routes: Routes = [{
  path: '',
  component: SmsComponent,
  children: [
      { path: 'packageindex', component: packagedistributeIndexComponent },
      { path: '', redirectTo: 'packageindex' }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SmsRoutingModule { }
