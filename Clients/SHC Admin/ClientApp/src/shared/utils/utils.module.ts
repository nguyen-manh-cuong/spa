import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AutoFocusDirective } from './auto-focus.directive';
import { BusyIfDirective } from './busy-if.directive';
import { ButtonBusyDirective } from './button-busy.directive';
import { MomentFormatPipe } from './moment-format.pipe';

@NgModule({
    imports: [
        CommonModule
    ],
    providers: [
       // LocalStorageService
    ],
    declarations: [
        ButtonBusyDirective,
        AutoFocusDirective,
        BusyIfDirective,
        MomentFormatPipe,
    ],
    exports: [
        ButtonBusyDirective,
        AutoFocusDirective,
        BusyIfDirective,
        MomentFormatPipe
    ]
})
export class UtilsModule { }
