import { RouterModule, Routes } from '@angular/router';

import { IndexComponent } from '@app/users-manager/index/index.component';
import { NgModule } from '@angular/core';
import { SettingsComponent } from '@app/users-manager/settings/settings.component';
import { UsersManagerComponent } from '@app/users-manager/users-manager.component';

const routes: Routes = [
    {
        path: '',
        component: UsersManagerComponent,
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
export class UsersManagerRoutingModule { }
