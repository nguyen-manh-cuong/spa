import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from '@app/app.component';
import { AppRouteGuard } from '@shared/auth/auth-route-guard';
import { DashboardComponent } from '@app/dashboard/dashboard.component';
import { NgModule } from '@angular/core';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: AppComponent,
                children: [
                    { path: 'dashboard', component: DashboardComponent, canActivate: [AppRouteGuard] },
                    {
                        path: 'users',
                        loadChildren: 'app/users/users.module#UsersModule', canActivate: [AppRouteGuard]
                    },
                    {
                        path: 'languages',
                        loadChildren: 'app/languages/languages.module#LanguagesModule', canActivate: [AppRouteGuard]
                    },
                    {
                        path: 'sms-package',
                        loadChildren: 'app/sms-package/sms-package.module#SmsPackagesModule', canActivate: [AppRouteGuard]
                    },
                    {
                        path: 'sms-package-distribute',
                        loadChildren: 'app/sms-package-distribute/sms-package-distribute.module#SmsModule', canActivate: [AppRouteGuard]
                    },
                    {
                        path: 'sms-template',
                        loadChildren: 'app/sms-template/sms-template.module#TemplateModule', canActivate: [AppRouteGuard]
                    },
                    {
                        path: 'sms-manual-re-examination',
                        loadChildren: 'app/sms-manual-re-examination/sms-manual-re-examination.module#SmsManualReExaminationModule', canActivate: [AppRouteGuard]
                    },
                    {
                        path: 'sms-manual-birthday',
                        loadChildren: 'app/sms-manual-birthday/sms-manual-birthday.module#SmsManualBirthdayModule', canActivate: [AppRouteGuard]
                    },
                    {
                        path: 'sms-manual',
                        loadChildren: 'app/sms-manual/sms-manual.module#SmsManualModule', canActivate: [AppRouteGuard]
                    },
                    {
                        path: 'sms-log',
                        loadChildren: 'app/sms-log/sms-log.module#SmsLogModule', canActivate: [AppRouteGuard]
                    },
                    {
                        path: 'booking-timeslots',
                        loadChildren: 'app/booking-timeslots/booking-timeslots.module#BookingTimeslotsModule', canActivate: [AppRouteGuard]
                    },
                    {
                        path: 'booking-informations',
                        loadChildren: 'app/booking-informations/booking-informations.module#BookingInformationsModule', canActivate: [AppRouteGuard]
                    },
                    {
                        path: 'category-common',
                        loadChildren: 'app/category-common/category-common.module#CategoryCommonModule', canActivate:[AppRouteGuard]
                    }
               ]
            },
        ])
    ],
    exports: [RouterModule]
})
export class AppRoutingModule { }
