import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AccountTypePipe } from 'pipes/account-type.pipe';
import { CommonModule } from '@angular/common';
import { IndexComponent } from './index/index.component';
import { NgModule } from '@angular/core';
import { SettingsComponent } from './settings/settings.component';
import { SharedModule } from '@shared/shared.module';
import { TaskComponent } from './task/task.component';
import { UsersComponent } from './users.component';
import { UsersRoutingModule } from './users-routing.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { ValidationModule } from '@app/validation/validation.module';
import { NgxMaskModule } from 'ngx-mask';



@NgModule({
    imports: [
        CommonModule,
        FormsModule, ReactiveFormsModule,
        UsersRoutingModule,
        SharedModule,
        UtilsModule,
        ValidationModule,
        NgxMaskModule.forRoot()
    ],
    declarations: [UsersComponent, IndexComponent, SettingsComponent, TaskComponent],
    entryComponents: [TaskComponent]
})
export class UsersModule { }
