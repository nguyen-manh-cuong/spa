import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from '@app/booking-doctor/index/index.component';
import { NgModule } from '@angular/core';
import { BookingDoctorComponent } from '@app/booking-doctor/booking-doctor.component';

const routes: Routes = [
    {
        path: '',
        component: BookingDoctorComponent,
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
export class BookingDoctorRoutingModule { }
