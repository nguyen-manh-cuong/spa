import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from './index/index.component';
import { NgModule } from '@angular/core';
import { SmsManualBirthdayComponent } from './sms-manual-birthday.component';

const routes: Routes = [
    {
        path: '',
        component: SmsManualBirthdayComponent,
        children: [
            { path: 'index', component: IndexComponent },
            { path: '', redirectTo: 'index' }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SmsManualBirthdayRoutingModule { }
