import { RouterModule, Routes } from '@angular/router';

import { IndexComponent } from '@app/users/index/index.component';
import { NgModule } from '@angular/core';
import { SettingsComponent } from '@app/users/settings/settings.component';
import { UsersComponent } from '@app/users/users.component';

const routes: Routes = [
    {
        path: '',
        component: UsersComponent,
        children: [
            { path: 'index', component: IndexComponent },
            { path: 'settings', component: SettingsComponent },
            { path: '', redirectTo: 'index' }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UsersRoutingModule { }
