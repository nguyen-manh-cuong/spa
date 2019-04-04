import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
    // MAT_DIALOG_DEFAULT_OPTIONS,
    // MatAutocomplete,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    // MatDividerModule,
    MatExpansionModule,
    // MatGridListModule,
    MatIconModule,
    MatInputModule,
    // MatListModule,
    MatMenuModule,
    // MatNativeDateModule,
    MatPaginatorIntl,
    MatPaginatorModule,
    // MatProgressBarModule,
    MatRadioModule,
    // MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatSortModule,
    // MatStepperModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule
} from '@angular/material';
//
import { ModuleWithProviders, NgModule } from '@angular/core';

import { AbpModule } from '@abp/abp.module';
import { AccountTypePipe } from 'pipes/account-type.pipe';
import { AppAuthService } from './auth/app-auth.service';
import { AppRouteGuard } from './auth/auth-route-guard';
import { AppSessionService } from './session/app-session.service';
import { AppUrlService } from './nav/app-url.service';
import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { RouterModule } from '@angular/router';
import { getDutchPaginatorIntl } from './paginator.intl';
@NgModule({
    imports: [
        CommonModule,
        AbpModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatToolbarModule,
        MatSelectModule,
        MatTabsModule,
        MatInputModule,
        MatChipsModule,
        MatCardModule,
        MatSidenavModule,
        MatCheckboxModule,
        // MatListModule,
        MatMenuModule,
        MatIconModule,
        MatTooltipModule,
        MatDatepickerModule, 
        // MatNativeDateModule, 
        // MatProgressBarModule,
        CdkTableModule, MatTableModule,
        PerfectScrollbarModule
    ],
    declarations: [AccountTypePipe],
    providers: [{ provide: MatPaginatorIntl, useValue: getDutchPaginatorIntl() }],
    exports: [
        CdkTableModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatCardModule,
        MatCheckboxModule,
        MatChipsModule,
        // MatStepperModule,
        MatDatepickerModule,
        MatDialogModule,
        // MatDividerModule,
        MatExpansionModule,
        // MatGridListModule,
        MatIconModule,
        MatInputModule,
        // MatListModule,
        MatMenuModule,
        // MatNativeDateModule,
        MatPaginatorModule,
        MatRadioModule,
        // MatRippleModule,
        MatSelectModule,
        MatSidenavModule,
        MatSliderModule,
        MatSlideToggleModule,
        MatSortModule,
        MatTableModule,
        MatTabsModule,
        MatToolbarModule,
        MatTooltipModule,
        // MatProgressBarModule,
        PerfectScrollbarModule,
        AccountTypePipe
    ]
})
export class SharedModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: SharedModule,
            providers: [
                AppSessionService,
                AppUrlService,
                AppAuthService,
                AppRouteGuard
            ]
        }
    }
}
