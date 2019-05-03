import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IndexComponent } from './index/index.component';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { TaskComponent } from './task/task.component';
import { BookingDoctorComponent } from './booking-doctor.component';
import { BookingDoctorRoutingModule } from './booking-doctor-routing.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { NgxMaskModule } from 'ngx-mask';
import { ValidationModule } from '@app/validation/validation.module';
import { FullCalendarModule } from '@fullcalendar/angular';



@NgModule({
    imports: [
        CommonModule,
        FormsModule, ReactiveFormsModule,
        BookingDoctorRoutingModule,
        SharedModule,
        UtilsModule,
        ValidationModule,
        NgxMaskModule.forRoot(),
        FullCalendarModule
    ],

    declarations: [BookingDoctorComponent, IndexComponent, TaskComponent],
    entryComponents: [TaskComponent]
})
export class BookingDoctorModule { }
