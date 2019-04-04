import { RouterModule, Routes } from '@angular/router';
import { TaskComponent } from './task/task.component';
import { NgModule } from '@angular/core';
import { SmsTemplateComponent } from './sms-template-task.component';

const routes: Routes = [
    {
        path: '',
        component: SmsTemplateComponent,
        children: [
            { path: 'task', component: TaskComponent },
            { path: '', redirectTo: 'task' }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SmsTemplateTaskRoutingModule { }
