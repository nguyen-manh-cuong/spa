import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LOCALE_ID, NgModule } from '@angular/core';

import { AppComponent } from '@app/app.component';
import { AppRoutingModule } from '@app/app-routing.module';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '@angular/cdk/layout';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from '@shared/shared.module';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { ValidationModule } from '@app/validation/validation.module';
import { NgxMaskModule } from 'ngx-mask';
import { BookingIPCCComponent } from './bookingIPCC/bookingIPCC.component';
import { NgxMyDatePickerModule } from 'ngx-mydatepicker';



@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        AppRoutingModule,
        SharedModule,
        LayoutModule,
        // UtilsModule,
        NgSelectModule,
        SlickCarouselModule,
        ValidationModule,
        NgxMaskModule.forRoot(),
        NgxMyDatePickerModule.forRoot() 
    ],
    providers: [{ provide: LOCALE_ID, useValue: 'vi' }],
    declarations: [AppComponent, BookingIPCCComponent ]
})
export class AppModule { }
