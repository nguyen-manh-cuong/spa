import { RouterModule, Routes } from '@angular/router';

import { IndexComponent } from '@app/sms-package/index/index.component';
import { NgModule } from '@angular/core';
//import { SettingsComponent } from '@app/sms/settings/settings.component';
import { SmsPackagesComponent } from '@app/sms-package/sms-package.component';

const routes: Routes = [
    {
        path: '',
        component: SmsPackagesComponent,
        children: [
            { path: 'index', component: IndexComponent },
            //{ path: 'settings', component: SettingsComponent },
            { path: '', redirectTo: 'index' }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SmsPackagesRoutingModule { }
