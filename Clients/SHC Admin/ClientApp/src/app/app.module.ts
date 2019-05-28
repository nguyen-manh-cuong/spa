import { LOCALE_ID, NgModule } from '@angular/core';
import { MAT_DATE_LOCALE, MatButtonModule, MatIconModule, MatListModule, MatSidenavModule, MatToolbarModule,MatNativeDateModule} from '@angular/material';
import { AppComponent } from '@app/app.component';
import { AppRoutingModule } from '@app/app-routing.module';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from '@app/dashboard/dashboard.component';
import { LayoutModule } from '@angular/cdk/layout';
import { SharedModule } from '@shared/shared.module';
import { SideBarNavComponent, RecusiveContentComponent } from './layout/side-bar-nav/side-bar-nav.component';
import { DatePipe } from '@angular/common'; 
import { ValidationModule } from './validation/validation.module';
import { ResetPasswordModule } from './reset-pasword/reset-password.module';
import { MatInputModule } from '@angular/material';
import { HealthfacilitiesListComponent } from './healthfacilities-list/healthfacilities-list.component';


@NgModule({
    imports: [        
        ValidationModule,
        MatInputModule,
        CommonModule,
        AppRoutingModule,
        SharedModule,
        LayoutModule,
        MatToolbarModule,
        MatButtonModule,
        MatSidenavModule,
        MatIconModule,
        MatListModule,
        MatNativeDateModule,
        ResetPasswordModule,
    ],
    providers: [{ provide: LOCALE_ID, useValue: 'vi' }, { provide: MAT_DATE_LOCALE, useValue: 'vi-VN' }, DatePipe],
    declarations: [AppComponent, DashboardComponent, SideBarNavComponent, RecusiveContentComponent, HealthfacilitiesListComponent],
    entryComponents: [RecusiveContentComponent, HealthfacilitiesListComponent]
})
export class AppModule { }
