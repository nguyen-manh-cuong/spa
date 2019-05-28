import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { IndexComponent } from './index/index.component';
import { TemplateComponent } from './template.component';
import { TemplateRoutingModule } from './template-routing.module';
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
    TemplateRoutingModule,
    ValidationModule,
    NgxMaskModule.forRoot()
  ],
  declarations: [TemplateComponent, IndexComponent, TaskComponent],
  entryComponents: [TaskComponent]
})
export class TemplateModule { }
