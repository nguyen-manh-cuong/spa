import * as _ from 'lodash';

import { Component, Inject, Injector, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { IProvince, IPackageDetail, IBookingInformations, IDistrict } from '@shared/Interfaces';
import { MAT_DIALOG_DATA, MatDialogRef, MatInput } from '@angular/material';

import { AppComponentBase } from '@shared/app-component-base';
import { DataService } from '@shared/service-proxies/service-data';
import { ValidationRule } from '@shared/common/common';
import * as moment from 'moment';
import swal from 'sweetalert2';


@Component({
    selector: 'app-detail',
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DetailComponent extends AppComponentBase implements OnInit {
    ValidationRule = new ValidationRule();

    _frm: FormGroup;
    _reasonString = "";
    _addressString = "";
    _booking: IBookingInformations | any = {
        fullName: '', examinationDate: '', bookingUser: '', phoneNumber: '', gender: '', year: '',
        district: '', province: '', email: '', bookingRepresent: '', phoneRepresent: '', emailRepresent: ''
    };
    _context: any;
    _isNew: boolean = true;
    _isShow: boolean = false;
    _province: Array<IProvince> = [];
    _district: Array<IDistrict> = [];

    constructor(
        injector: Injector,
        private _dataService: DataService,
        private _formBuilder: FormBuilder,
        @Inject(MAT_DIALOG_DATA)
        public bookingData: IBookingInformations) {
        super(injector);
    }

    ngOnInit() {

        if (this.bookingData) {
            this._booking = _.clone(this.bookingData);
        }
        //label
        this._reasonString = this._booking.reason;

        this._dataService.getAll('provinces').subscribe(resp => { this._province = resp.items });
        this._dataService.getAll('districts').subscribe(resp => { this._district = resp.items });

        setTimeout(() => { this.getAddress() }, 1000);
       

        setTimeout(() => {
            this._frm.controls['doctorName'].disable();
            this._frm.controls['examinationDate'].disable();
            //this._frm.controls['reason'].disable();
            // this._frm.controls['status'].disable();
            this._frm.controls['bookingUser'].disable();
            this._frm.controls['gender'].disable();
            this._frm.controls['age'].disable();
            this._frm.controls['phoneNumber'].disable();

            this._frm.controls['email'].disable();
            //this._frm.controls['address'].disable();
            this._frm.controls['bookingRepresent'].disable();
            this._frm.controls['phoneRepresent'].disable();
            this._frm.controls['emailRepresent'].disable();
        }, 100);

        this._context = {
            // name: [this._package.name, [Validators.required, validation.compare('name', 'description')]],
            doctorName: [this._booking.fullName],
            examinationDate: [this.handleTime(this._booking)],
            //reason: [this._booking.reason, Validators.required],
            // status: [this.getStatus(this._booking.status)],
            bookingUser: [this._booking.bookingUser,],
            bookingRepresent: [this._booking.bookingRepresent,],
            gender: [this.getGender(this._booking.gender)],
            age: [this._booking.birthYear + " (" + this.convertAge(this._booking.birthDate, this._booking.birthMonth, this._booking.birthYear) + ")"],
            phoneNumber: [this._booking.phoneNumber],
            phoneRepresent: [this._booking.phoneRepresent],
            email: [this._booking.email],
            emailRepresent: [this._booking.emailRepresent],
            //address: [this._booking.address ? this._booking.address : ""],

        };
        this._frm = this._formBuilder.group(this._context);
    }

    getAddress() {
        var province = "";
        var district = "";
        var address = "";
        for (var item of this._province) {
            if (item.provinceCode == this._booking.provinceCode) {
                province = item.name;
            }
        }
        for (var data of this._district) {
            if (data.districtCode == this._booking.districtCode) {
                district = data.name
            }
        }
        address = this._booking.address != undefined ? this._booking.address : "" +  (this._booking.address != undefined && district != "" ? ", " : "") +  (district != "" ?  district : "") +  ((district != "") || (this._booking.address != undefined) && province != "" ? ", " : "")   + (province != "" ? province : "");
        this._addressString = address;
        //this._frm.controls['address'].setValue(address);
    }

    getGender(status: number) {
        switch (status) {
            case 0:
                return 'Không xác định';
            case 1:
                return 'Nam';
            case 2:
                return 'Nữ';
        }
    }

    handleTime(element: IBookingInformations) {
        var date = new Date(element.examinationDate);
        var time = "";
        if (element.doctorId == null) {
            switch (element.examinationWorkingTime) {
                case 1:
                    time = '8:00 - 12:00';
                case 2:
                    time = '12:00 - 17:00';
                case 3:
                    time = '17:00 - 21:00';
            }
        } else {
            if (element.timeSlotId != null) {
                time = element.bookingTimeSlot.hoursStart + ":" + element.bookingTimeSlot.minuteStart + " - " + element.bookingTimeSlot.hoursEnd + ":" + element.bookingTimeSlot.minuteEnd;
            } else {
                time = element.examinationTime;
            }
        }
        return moment(date).format("DD/MM/YYYY") + (time ? "," + time : "");
    }

    getStatus(status: number) {
        switch (status) {
            case 0:
                return 'Mới đăng ký';
            case 1:
                return 'Chưa khám';
            case 2:
                return 'Đã khám';
            case 3:
                return 'Hủy khám';
            case 4:
                return 'Tất cả';

        }
    }
}
