import { RouterModule, Routes } from '@angular/router';

import { IndexComponent } from './index/index.component';
import { LanguagesComponent } from './languages.component';
import { NgModule } from '@angular/core';

const routes: Routes = [{
  path: '',
  component: LanguagesComponent,
  children: [
      { path: 'index', component: IndexComponent },
      { path: '', redirectTo: 'index' }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LanguagesRoutingModule { }
