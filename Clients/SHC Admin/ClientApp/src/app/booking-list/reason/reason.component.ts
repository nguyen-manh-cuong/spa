import * as _ from 'lodash';

import { Component, Inject, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { IProvince, IPackageDetail, IBookingInformations, IDistrict } from '@shared/Interfaces';
import { MAT_DIALOG_DATA, MatDialogRef, MatInput } from '@angular/material';

import { AppComponentBase } from '@shared/app-component-base';
import { DataService } from '@shared/service-proxies/service-data';
import { ValidationRule } from '@shared/common/common';
import * as moment from 'moment';
import swal from 'sweetalert2';


@Component({
    selector: 'app-reason',
    templateUrl: './reason.component.html',
    styleUrls: ['./reason.component.scss']
})
export class ReasonComponent extends AppComponentBase implements OnInit {
    api: string = 'bookinginformations';
    _context: any;
    _frm: FormGroup;
    

    _booking: IBookingInformations | any = {
        fullName: '', examinationDate: '', reason: '', status: '', bookingUser: '', phoneNumber: '', gender: '', year: '',
        address: '', district: '', province: '', email: '', bookingRepresent: '', phoneRepresent: '', emailRepresent: ''
    };
    @ViewChild("txtReason") txtReason: MatInput;
    constructor(
        injector: Injector,
        private _dataService: DataService,
        private _formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<ReasonComponent>, 
        @Inject(MAT_DIALOG_DATA)
        public bookingData: IBookingInformations) { 
            super(injector); 
        }

    ngOnInit() {
        const validationRule = new ValidationRule();
        if (this.bookingData) {
            this._booking = _.clone(this.bookingData);
        }

        this._context = {
            bookingId: [this._booking.bookingId],
            reasonReject: ['', [Validators.required, validationRule.hasValue]],
        };
        this._frm = this._formBuilder.group(this._context);
    }

    submit() {

        var params = _.pick(this._frm.value, ['bookingId', 'reasonReject']);

        if (this._booking) {
            params.bookingId = this._booking.bookingId;
            params.reasonReject = this._frm.value.reasonReject;
        }

        if(params.reasonReject===''){
            
            swal({
                title: this.l('Thông báo'),
                text: 'Không được bỏ trống',
                type: 'warning',
                timer: 3000
            })
            this.txtReason.focus();
        }
        else{
            this._dataService.update(this.api, params).subscribe(() => {
                this._dataService.delete(this.api, this._booking.bookingId).subscribe(e => {
                    swal(this.l('Hủy thành công'), "Thông tin đặt khám " + this._booking.ticketId + "  đã bị hủy", 'success');
                    this.dialogRef.close();
                });
            }, err => console.log(err));    
        }
    }
}
