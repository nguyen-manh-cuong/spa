import * as _ from 'lodash';

import { Component, Inject, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IBookingDoctorsCalendars } from '@shared/Interfaces';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { AppComponentBase } from '@shared/app-component-base';
import { DataService } from '@shared/service-proxies/service-data';


@Component({
    selector: 'app-task',
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.scss']
})
export class DetailComponent extends AppComponentBase implements OnInit {
    _frm: FormGroup;
    _bookingDoctorsCalendars: IBookingDoctorsCalendars;
    _context: any;

    constructor(injector: Injector, private _dataService: DataService, private _formBuilder: FormBuilder, public dialogRef: MatDialogRef<DetailComponent>, @Inject(MAT_DIALOG_DATA) public bookingDoctorsCalendars: IBookingDoctorsCalendars) { super(injector); }

    ngOnInit() {
        if (this.bookingDoctorsCalendars) {
            this._bookingDoctorsCalendars = _.clone(this.bookingDoctorsCalendars);
        }

        this._context = {
            healthfacilities: [this.bookingDoctorsCalendars.fullName],
            doctor: [this.bookingDoctorsCalendars.fullName],
            address: [this.bookingDoctorsCalendars.address]  
        };

        this._frm = this._formBuilder.group(this._context);
    }
}
