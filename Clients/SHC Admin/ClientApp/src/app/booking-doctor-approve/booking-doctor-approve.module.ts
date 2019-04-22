import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { IndexComponent } from './index/index.component';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { DetailComponent } from './detail/detail.component';
import { BookingDoctorApproveComponent } from './booking-doctor-approve.component';
import { BookingDoctorApproveRoutingModule } from './booking-doctor-approve-routing.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { NgxMaskModule } from 'ngx-mask';
import { ValidationModule } from '@app/validation/validation.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule, ReactiveFormsModule,
        BookingDoctorApproveRoutingModule,
        SharedModule,
        UtilsModule,
        ValidationModule,
        NgxMaskModule.forRoot()
    ],

    declarations: [BookingDoctorApproveComponent, IndexComponent, DetailComponent],
    entryComponents: [DetailComponent]
})
export class BookingDoctorApproveModule { }
