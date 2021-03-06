import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LOCALE_ID, NgModule } from '@angular/core';

import { AppComponent } from '@app/app.component';
import { AppRoutingModule } from '@app/app-routing.module';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '@angular/cdk/layout';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from '@shared/shared.module';
// import { UtilsModule } from '@shared/utils/utils.module';
import { BookingComponent } from './booking/booking.component';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { ValidationModule } from '@app/validation/validation.module';
import { NgxMaskModule } from 'ngx-mask';
import { NgxMyDatePickerModule } from 'ngx-mydatepicker';
import { NgxSpinnerModule } from 'ngx-spinner';


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
        NgxMyDatePickerModule.forRoot(),
        NgxSpinnerModule
    ],
    providers: [{ provide: LOCALE_ID, useValue: 'vi' }],
    declarations: [AppComponent, BookingComponent ]
})
export class AppModule { }
