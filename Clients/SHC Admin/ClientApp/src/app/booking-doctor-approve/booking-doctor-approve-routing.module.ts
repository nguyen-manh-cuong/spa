import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from '@app/booking-doctor-approve/index/index.component';
import { NgModule } from '@angular/core';
import { BookingDoctorApproveComponent } from '@app/booking-doctor-approve/booking-doctor-approve.component';

const routes: Routes = [
    {
        path: '',
        component: BookingDoctorApproveComponent,
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
export class BookingDoctorApproveRoutingModule { }
