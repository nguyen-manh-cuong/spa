import { RouterModule, Routes } from '@angular/router';

import { NgModule } from '@angular/core';
import { IndexComponent } from './index/index.component';
import { DoctorComponent } from './doctor.component';


const routes: Routes = [{
  path: '',
  component: DoctorComponent,
  children: [
      { path: 'index', component: IndexComponent },
      { path: '', redirectTo: 'index' }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DoctorRoutingModule { }
