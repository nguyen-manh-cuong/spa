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
    selector: 'app-task',
    templateUrl: './task.component.html',
    styleUrls: ['./task.component.scss']
})
export class TaskComponent extends AppComponentBase implements OnInit {
    api: string = 'smspackages';
    ValidationRule = new ValidationRule();

    _frm: FormGroup;
    _booking: IBookingInformations | any = {
        fullName: '', examinationDate: '', reason: '', status: '', bookingUser: '', phoneNumber: '', gender: '', year: '',
    address: '', district: '', province: '', email: '', bookingRepresent: '', phoneRepresent: '', emailRepresent: ''  };
    _context: any;
    _isNew: boolean = true;
    _province: Array<IProvince> = [];
    _district: Array<IDistrict> = [];

    constructor(
        injector: Injector, 
        private _dataService: DataService, 
        private _formBuilder: FormBuilder, 
        public dialogRef: MatDialogRef<TaskComponent>, 
        @Inject(MAT_DIALOG_DATA)
        public bookingData: IBookingInformations) { 
            super(injector); 
        }

    ngOnInit() {

        if (this.bookingData) {
            this._booking = _.clone(this.bookingData);
        }

        this._dataService.getAll('provinces').subscribe(resp => { this._province = resp.items });
        this._dataService.getAll('districts').subscribe(resp => { this._district = resp.items });

        setTimeout(() => { this.getAddress() }, 1000);

        this._context = {
            // name: [this._package.name, [Validators.required, validation.compare('name', 'description')]],
            doctorName: [this._booking.fullName],
            examinationDate: [this.handleTime(this._booking)],
            reason: [this._booking.reason, Validators.required],
            status: [this.getStatus(this._booking.status)],
            bookingUser: [this._booking.bookingUser,],
            gender: [this.getGender(this._booking.gender)],
            age: [this._booking.birthYear + " (" + this.convertAge(this._booking.birthDate, this._booking.birthMonth, this._booking.birthYear) + ")"],
            phoneNumber: [this._booking.phoneNumber],
            email: [this._booking.email],
            address: [this._booking.address ? this._booking.address : ""],
        };

        this._frm = this._formBuilder.group(this._context);
    }

    getAddress() {
        console.log(this._province);
        console.log(this._district);
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
        console.log(province);
        console.log(district);
        address = this._booking.address != undefined ? this._booking.address : "" + (district != "" ? " ," + district : "") + (province != "" ? " ," + province : "");
        console.log(address);
        this._frm.controls['address'].setValue(address);
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
        return moment(date).format("DD/MM/YYYY") + ", " + time;
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
