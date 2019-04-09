import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryCommonComponent } from './category-common.component';
import { IndexComponent } from './index/index.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { CategoryCommonRoutingModule } from './category-common-routing.module';
import { TaskComponent } from './task/task.component';
import { ValidationModule } from '@app/validation/validation.module';
import { NgxMaskModule } from 'ngx-mask';

@NgModule({
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,
    CategoryCommonRoutingModule,
    SharedModule,
    UtilsModule,
    ValidationModule,
    NgxMaskModule.forRoot()
  ],
  declarations: [CategoryCommonComponent, IndexComponent, TaskComponent],
  entryComponents: [TaskComponent]
})
export class CategoryCommonModule { }
