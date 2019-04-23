import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AccountTypePipe } from 'pipes/account-type.pipe';
import { CommonModule } from '@angular/common';
import { IndexComponent } from './index/index.component';
import { NgModule } from '@angular/core';
//import { SettingsComponent } from './settings/settings.component';
import { SharedModule } from '@shared/shared.module';
import { TaskComponent } from './task/task.component';
import { DetailComponent } from './detail/detail.component';
import { BookingListComponent } from './booking-list.component';
import { BookingListRoutingModule } from './booking-list-routing.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { NgxMaskModule } from 'ngx-mask';
import { ValidationModule } from '@app/validation/validation.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule, ReactiveFormsModule,
        BookingListRoutingModule,
        SharedModule,
        UtilsModule,
        ValidationModule,
        NgxMaskModule.forRoot()
    ],

    declarations: [BookingListComponent, IndexComponent, TaskComponent, DetailComponent],
    entryComponents: [TaskComponent, DetailComponent]
})
export class BookingListModule { }
