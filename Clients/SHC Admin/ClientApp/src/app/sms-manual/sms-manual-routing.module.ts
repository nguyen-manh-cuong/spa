import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from './index/index.component';
import { NgModule } from '@angular/core';
import { SmsManualComponent } from './sms-manual.component';

const routes: Routes = [
    {
        path: '',
        component: SmsManualComponent,
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
export class SmsManualRoutingModule { }
