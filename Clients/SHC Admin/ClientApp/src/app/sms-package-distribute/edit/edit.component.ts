import * as _ from 'lodash';

import { Component, Inject, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { AppComponentBase } from '@shared/app-component-base';
import { DataService } from '@shared/service-proxies/service-data';
import { IPachkageDistribute } from '@shared/Interfaces';
import { standardized, notifyToastr } from '@shared/helpers/utils';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import swal from 'sweetalert2';

@Component({
    selector: 'app-packagedistributeedit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.scss']
})
export class packagedistributeEditComponent extends AppComponentBase implements OnInit {
    api: string = 'smspackagedistribute';

    _frmpackagedistributeedit: FormGroup;
    _obj: IPachkageDistribute | any = {
        id: 0, smsBrandsId: '', healthFacilitiesId: '', monthStart: '', monthEnd: '', yearStart: null, yearEnd: null, smsPackageId: '', isActive: false, quantity: 0, smsPackageUsed: {}
    };
    _context: any;
    _isNew: boolean = true;
    _smsLogs = [];
    _month = [{ id: 1, name: 'Tháng 1' }, { id: 2, name: 'Tháng 2' }, { id: 3, name: 'Tháng 3' }, { id: 4, name: 'Tháng 4' }, { id: 5, name: 'Tháng 5' }, { id: 6, name: 'Tháng 6' },
    { id: 7, name: 'Tháng 7' }, { id: 8, name: 'Tháng 8' }, { id: 9, name: 'Tháng 9' }, { id: 10, name: 'Tháng 10' }, { id: 11, name: 'Tháng 11' }, { id: 12, name: 'Tháng 12' },];
    _currentYear = moment().year();
    _currentMonth = moment().month() + 1;
    _medicalFacility = [];
    _brands = [];
    _package: any = [];
    _yearNow: number;

    @ViewChild("yearStart") yearStart;
    @ViewChild("yearEnd") yearEnd;

    private rules = { month: 'noSpace,capitalize', year: 'singleSpace' };

    constructor(injector: Injector, private _dataService: DataService, private datePipe: DatePipe, private _formBuilder: FormBuilder, public dialogRef: MatDialogRef<packagedistributeEditComponent>, @Inject(MAT_DIALOG_DATA) public obj: IPachkageDistribute) {
        super(injector);
    }

    ngOnInit() {
        if (this.obj) {
            this._obj = _.clone(this.obj);
            this._obj.id = this.obj.id;
            this._obj.monthStart = this.obj.monthStart;
            this._obj.monthEnd = this.obj.monthEnd;
            this._obj.yearStart = this.obj.yearStart;
            this._obj.yearEnd = this.obj.yearEnd;
            this._obj.quantity = this.obj.quantity;
            this._obj.smsPackageUsed = this.obj.smsPackageUsed;
        }
        this._yearNow = new Date().getFullYear();
        this._dataService.getAll('smsbrands-all').subscribe(resp => this._brands = resp.items);
        this._dataService.getAll('healthfacilities').subscribe(resp => this._medicalFacility = resp.items);
        this._dataService.getAll('smspackages-all').subscribe(resp => this._package = resp.items);
        this._dataService.get('smslog', JSON.stringify({ smsPackagesDistributeId: this._obj.id, status: 1 }), '', 0, 20).subscribe(resp => {
            this._smsLogs = resp.items
        });



        this._context = {
            healthFacilitiesId: [this.appSession.user.healthFacilities ? this.appSession.user.healthFacilitiesId : this._obj.healthFacilitiesId, Validators.required],
            smsBrandsId: [this._obj.smsBrandsId, Validators.required],
            monthStart: [this._obj.monthStart,],
            monthEnd: [this._obj.monthEnd,],
            yearStart: [this._obj.yearStart, [Validators.maxLength(4), Validators.pattern('[0-9]*')]],
            yearEnd: [this._obj.yearEnd, [Validators.maxLength(4), Validators.pattern('[0-9]*')]],
            smsPackageId: [this._obj.smsPackageId, Validators.required],
            isActive: [this._obj.isActive],
            userId: [],
        };
        this._frmpackagedistributeedit = this._formBuilder.group(this._context);

        setTimeout(() => {
            this._frmpackagedistributeedit.controls["healthFacilitiesId"].disable();
            this._frmpackagedistributeedit.controls["smsPackageId"].disable();
        });
    }

    submit() {
        const yearNow = new Date().getFullYear();
        if(this._frmpackagedistributeedit.controls['yearStart'].value == this._frmpackagedistributeedit.controls['yearEnd'].value){
            if(this._frmpackagedistributeedit.controls['monthStart'].value > this._frmpackagedistributeedit.controls['monthEnd'].value){
                this.yearStart.nativeElement.focus();
                return notifyToastr('Thông báo', 'Đến tháng phải lớn hơn hoặc bằng Từ tháng', 'warning'); 
                // swal({
                //     title: 'Thông báo',
                //     text: 'Đến tháng phải lớn hơn hoặc bằng Từ tháng',
                //     type: 'warning',
                //     timer: 3000
                // });
            }
        }

        if (this._frmpackagedistributeedit.controls['yearStart'].value < yearNow) {
            this.yearStart.nativeElement.focus();
            return notifyToastr('Thông báo', 'Từ năm phải lớn hơn hoặc bằng năm hiện tại', 'warning');  
            // swal({
            //     title: 'Thông báo',
            //     text: 'Từ năm phải lớn hơn hoặc bằng năm hiện tại',
            //     type: 'warning',
            //     timer: 3000
            // });
        }
        if (this._frmpackagedistributeedit.controls['yearEnd'].value < yearNow) {
            this.yearEnd.nativeElement.focus();
            return notifyToastr('Thông báo', 'Đến năm phải lớn hơn hoặc bằng năm hiện tại', 'warning'); 
            // swal({
            //     title: 'Thông báo',
            //     text: 'Đến năm phải lớn hơn hoặc bằng năm hiện tại',
            //     type: 'warning',
            //     timer: 3000
            // });
        }
        if (this._frmpackagedistributeedit.controls['yearEnd'].value < this._frmpackagedistributeedit.controls['yearStart'].value) {
            return  notifyToastr('Thông báo', 'Đến năm phải lớn hơn hoặc bằng Từ năm','warning');  
            // swal({
            //     title: 'Thông báo',
            //     text: 'Đến năm phải lớn hơn hoặc bằng Từ năm',
            //     type: 'warning',
            //     timer: 3000
            // });
        }

        this._frmpackagedistributeedit.value.healthFacilitiesId = this.obj.healthFacilitiesId;
        this._frmpackagedistributeedit.value.month = this._frmpackagedistributeedit.value.month == null || this._frmpackagedistributeedit.value.month == "" ? 1 : this._frmpackagedistributeedit.value.month;
        this._frmpackagedistributeedit.value.userId = this.appSession.userId;

        this._dataService.update(this.api, standardized(Object.assign(this._frmpackagedistributeedit.value, { id: this.obj.id }), this.rules)).subscribe(() => {
            notifyToastr( this.l('SaveSuccess'), '', 'success');
            // swal({
            //     title: this.l('SaveSuccess'),
            //     text: '',
            //     type: 'success',
            //     timer: 3000
            // });
            this.dialogRef.close();
        }, err => console.log(err));
    }
}
