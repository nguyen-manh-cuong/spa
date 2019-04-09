import { AutoFocusDirective } from './auto-focus.directive';
import { BusyIfDirective } from './busy-if.directive';
import { ButtonBusyDirective } from './button-busy.directive';
import { CommonModule } from '@angular/common';
import { MomentFormatPipe } from './moment-format.pipe';
import { NgModule } from '@angular/core';
import { ValidationMessagesComponent } from './validation-messages.component';

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
        ValidationMessagesComponent
    ],
    exports: [
        ButtonBusyDirective,
        AutoFocusDirective,
        BusyIfDirective,
        MomentFormatPipe,
        ValidationMessagesComponent
    ]
})
export class UtilsModule { }
