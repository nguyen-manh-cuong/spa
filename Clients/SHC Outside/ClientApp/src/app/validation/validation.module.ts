import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { UtilsModule } from '@shared/utils/utils.module';
import { ValidationComponent } from './validation.component';
import { SharedModule } from '@shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        FormsModule, ReactiveFormsModule,
        SharedModule,
        UtilsModule
    ],
    exports: [ValidationComponent],
    declarations: [ValidationComponent] 
})
export class ValidationModule { }
