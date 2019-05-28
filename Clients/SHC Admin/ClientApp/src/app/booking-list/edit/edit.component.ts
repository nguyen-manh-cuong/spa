import * as _ from 'lodash';

import { Component, Inject, Injector, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { IProvince, IPackageDetail, IBookingInformations, IDistrict } from '@shared/Interfaces';
import { MAT_DIALOG_DATA, MatDialogRef, MatInput } from '@angular/material';

import { AppComponentBase } from '@shared/app-component-base';
import { DataService } from '@shared/service-proxies/service-data';
import { ValidationRule } from '@shared/common/common';
import * as moment from 'moment';
import swal from 'sweetalert2';


@Component({
    selector: 'app-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.scss']
})
export class EditComponent extends AppComponentBase implements OnInit, AfterViewInit {
    api: string = 'bookinglist';
    ValidationRule = new ValidationRule();

    _frm: FormGroup;
    _booking: IBookingInformations | any = {
        fullName: '', examinationDate: '', reason: '', status: '', bookingUser: '', phoneNumber: '', gender: '', year: '',
        address: '', district: '', province: '', email: '', bookingRepresent: '', phoneRepresent: '', emailRepresent: ''
    };
    selectedStatus = "";
    _status = [{ id: 3, name: 'Hủy khám' }, { id: 2, name: 'Đã khám' }, { id: 1, name: 'Chờ khám' }, { id: 0, name: 'Mới đăng ký' }];
    _context: any;
    _isShow: boolean = false;
    _isNew: boolean = true;
    @ViewChild("reason") reason: MatInput;
    _province: Array<IProvince> = [];
    _district: Array<IDistrict> = [];

    constructor(
        injector: Injector, 
        private _dataService: DataService, 
        private _formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<EditComponent>, 
        @Inject(MAT_DIALOG_DATA)
        public bookingData: IBookingInformations) { 
            super(injector); 
        }

    ngOnInit() {
        console.log(_.trim("     dfgdfgd      12   haha a     ".replace(/\s+/g," ")))
        const validationRule = new ValidationRule();
        if (this.bookingData) {
            this._booking = _.clone(this.bookingData);
            this.selectedStatus = this._status.find(x => x.id == this._booking.status).name;
            console.log(this.selectedStatus);
        }
        setTimeout(() => { this.getAddress() }, 1000);
        this._dataService.getAll('provinces').subscribe(resp => { this._province = resp.items });
        this._dataService.getAll('districts').subscribe(resp => { this._district = resp.items });

        this._context = {
            // name: [this._package.name, [Validators.required, validation.compare('name', 'description')]],
            doctorName: [this._booking.fullName],
            examinationDate: [this.handleTime(this._booking)],
            reason: [this._booking.reason, [Validators.required, validationRule.hasValue]],
            status: [this._booking.status],
            bookingUser: [this._booking.bookingUser,[Validators.required,validationRule.hasValue]],
            bookingRepresent: [this._booking.bookingRepresent,],
            gender: [this.getGender(this._booking.gender)],
            age: [this._booking.birthYear + " (" + this.convertAge(this._booking.birthDate, this._booking.birthMonth, this._booking.birthYear) + ")"],
            phoneNumber: [this._booking.phoneNumber],
            phoneRepresent: [this._booking.phoneRepresent],
            email: [this._booking.email],
            emailRepresent: [this._booking.emailRepresent],
            address: [this._booking.address],
            bookingId: [this._booking.bookingId,]
        };

        setTimeout(() => {
            this._frm.controls['doctorName'].disable();
            this._frm.controls['examinationDate'].disable();
            this._frm.controls['gender'].disable();
            this._frm.controls['age'].disable();
            this._frm.controls['phoneNumber'].disable();
            this._frm.controls['email'].disable(); 
        }, 100);


        this._frm = this._formBuilder.group(this._context);
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this._booking.reason == null ? this.reason.focus() : '';
        }, 1000);
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
        //address = this._booking.address != undefined ? this._booking.address + ", " : "" + (district != "" ? district : "") + (province != "" ? ", " + province : "");
        address = this._booking.address != undefined ? this._booking.address : "" +  (this._booking.address != undefined && district != "" ? ", " : "") +  (district != "" ?  district : "") +  ((district != "") || (this._booking.address != undefined) && province != "" ? ", " : "")   + (province != "" ? province : "");
        console.log('Địa chỉ', address);
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
        return moment(date).format("DD/MM/YYYY") + (time ? "," + time : "");
    }

    submit() {
        console.log(this._booking.bookingId);
        console.log(this._frm.value);

        var params = _.pick(this._frm.value, ['bookingId', 'reason', 'status', 'bookingUser', 'address', 'updateUserId']);

        if (this._booking) {
            params.bookingId = this._booking.bookingId;
            params.reason = this._frm.value.reason;
            params.status = this._frm.value.status;
            params.bookingUser = this._frm.value.bookingUser;
            if(this._frm.value.address != null){
                params.address =_.trim(this._frm.value.address.replace(/\s+/g," "))
            }
            params.updateUserId = this.appSession.userId;
        }

        this._dataService.update(this.api, params).subscribe(() => {
            swal({
                title:this.l('SaveSuccess'), 
                text:'', 
                type:'success',
                timer:3000});
            this.dialogRef.close();
        }, err => console.log(err));

        
    }


}
