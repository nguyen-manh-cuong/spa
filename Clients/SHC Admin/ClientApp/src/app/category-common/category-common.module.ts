import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { IndexComponent } from './index/index.component';
import { CategoryCommonComponent } from './category-common.component';
import {CategoryCommonRoutingModule  } from './category-common-routing.module';
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
    CategoryCommonRoutingModule
  ],
  declarations: [CategoryCommonComponent, IndexComponent, TaskComponent],
  entryComponents: [TaskComponent]
})
export class CategoryCommonModule { }
