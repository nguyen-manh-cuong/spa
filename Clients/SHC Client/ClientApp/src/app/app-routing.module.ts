import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from '@app/app.component';
import { AppRouteGuard } from '@shared/auth/auth-route-guard';
import { DashboardComponent } from '@app/dashboard/dashboard.component';
import { NgModule } from '@angular/core';
import { BookingComponent } from './booking/booking.component';



@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: AppComponent,
                children: [
                    { path: 'dashboard', loadChildren: 'app/dashboard/dashboard.module#DashboardModule', canActivate: [AppRouteGuard] }
                ]
            },
            {
                path: 'booking',
                component: AppComponent,
                children: [
                    { path: '', component: BookingComponent }
                ]
            },
            {
                path: 'change-password',
                loadChildren: 'app/change-password/change-password.module#ChangePasswordModule', canActivate: [AppRouteGuard]
            }
        ])
    ],
    exports: [RouterModule]
})
export class AppRoutingModule { }
