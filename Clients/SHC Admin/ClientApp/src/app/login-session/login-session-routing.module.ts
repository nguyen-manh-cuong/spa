import { RouterModule, Routes } from '@angular/router';
import { TaskComponent } from './task/task.component';
import { NgModule } from '@angular/core';
import { LoginSessionComponent } from './login-session.component';

const routes: Routes = [
    {
        path: '',
        component: LoginSessionComponent,
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
export class LoginSessionRoutingModule { }
