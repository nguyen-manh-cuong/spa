import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from '@app/app.component';
import { AppRouteGuard } from '@shared/auth/auth-route-guard';
import { NgModule } from '@angular/core';
import { BookingIPCCComponent } from './bookingIPCC/bookingIPCC.component';



@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: 'bookingIPCC',
                component: AppComponent,
                children: [
                    { path: '', component: BookingIPCCComponent }
                ]
            }
        ])
    ],
    exports: [RouterModule]
})
export class AppRoutingModule { }
