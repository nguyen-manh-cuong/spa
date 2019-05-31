import { RouterModule, Routes } from '@angular/router';
import { TaskSessionComponent } from './task/task_session.component';
import { NgModule } from '@angular/core';
import { LoginSessionComponent } from './login-session.component';

const routes: Routes = [
    {
        path: '',
        component: LoginSessionComponent,
        children: [
            { path: 'task', component: TaskSessionComponent },
            { path: '', redirectTo: 'task' }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LoginSessionRoutingModule { }
