import { RouterModule, Routes } from '@angular/router';

import { NgModule } from '@angular/core';

const routes: Routes = [
    { path: '', redirectTo: '/app/dashboard', pathMatch: 'full' },
    {
        path: 'auth',
        loadChildren: 'auth/auth.module#AuthModule', // Lazy load auth module
        data: { preload: true }
    },
    {
        path: 'app',
        loadChildren: 'app/app.module#AppModule', // Lazy load account module
        data: { preload: true }
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    providers: []
})
export class RootRoutingModule { }
