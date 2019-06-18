import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AccountTypePipe } from 'pipes/account-type.pipe';
import { CommonModule } from '@angular/common';
import { IndexComponent } from './index/index.component';
import { NgModule } from '@angular/core';
import { SettingsComponent } from './settings/settings.component';
import { SharedModule } from '@shared/shared.module';
import { TaskComponent } from './task/task.component';
import { UsersManagerComponent } from './users-manager.component';
import { UsersManagerRoutingModule } from './users-manager-routing.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { ValidationModule } from '@app/validation/validation.module';
import { NgxMaskModule } from 'ngx-mask';
import { MAT_CHECKBOX_CLICK_ACTION } from '@angular/material';
import { ResetComponent } from './reset/reset.component';


@NgModule({
    imports: [
        CommonModule,
        FormsModule, ReactiveFormsModule,
        UsersManagerRoutingModule,
        SharedModule,
        UtilsModule,
        ValidationModule,
        NgxMaskModule.forRoot()
    ],
    declarations: [UsersManagerComponent, IndexComponent, SettingsComponent, TaskComponent, ResetComponent],
    entryComponents: [TaskComponent, ResetComponent],
    //providers: [{ provide: MAT_CHECKBOX_CLICK_ACTION, useValue: 'noop' }]
})
export class UsersManagerModule { }
