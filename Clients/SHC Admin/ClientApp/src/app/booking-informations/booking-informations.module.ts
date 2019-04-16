import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { IndexComponent } from './index/index.component';
import { GenderComponent } from './gender-table/gender.component';
import { BookingInformationsComponent } from './booking-informations.component';
import { BookingInformationsRoutingModule } from './booking-informations-routing.module';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { TaskComponent } from './task/task.component';
import { UtilsModule } from '@shared/utils/utils.module';
import { ValidationModule } from '@app/validation/validation.module';
import { NgxMaskModule} from 'ngx-mask';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    UtilsModule,
    BookingInformationsRoutingModule,
    ValidationModule,
    NgxMaskModule.forRoot()
  ],
    declarations: [BookingInformationsComponent, IndexComponent, TaskComponent, GenderComponent],
  entryComponents: [TaskComponent]
})
export class BookingInformationsModule { }
