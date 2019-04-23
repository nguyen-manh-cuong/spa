import { RouterModule, Routes } from '@angular/router';

import { IndexComponent } from '@app/booking-list/index/index.component';
import { NgModule } from '@angular/core';
import { BookingListComponent } from '@app/booking-list/booking-list.component';

const routes: Routes = [
    {
        path: '',
        component: BookingListComponent,
        children: [
            { path: 'index', component: IndexComponent },
            //{ path: 'settings', component: SettingsComponent },
            { path: '', redirectTo: 'index' }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BookingListRoutingModule { }
