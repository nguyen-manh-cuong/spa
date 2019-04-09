import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { IndexComponent } from './index/index.component';
import { TimeslotsComponent } from './timeslots.component';
import { TimeslotsRoutingModule } from './timeslots-routing.module';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { TaskComponent } from './task/task.component';
import { UtilsModule } from '@shared/utils/utils.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    UtilsModule,
    TimeslotsRoutingModule
  ],
  declarations: [TimeslotsComponent, IndexComponent, TaskComponent],
  entryComponents: [TaskComponent]
})
export class TimeslotsModule { }
