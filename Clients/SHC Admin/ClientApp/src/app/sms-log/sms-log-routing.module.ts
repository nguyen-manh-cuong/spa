import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from './index/index.component';
import { NgModule } from '@angular/core';
import { SmsLogComponent } from './sms-log.component';

const routes: Routes = [
    {
        path: '',
        component: SmsLogComponent,
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
export class SmsLogRoutingModule { }
