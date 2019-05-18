
import * as _ from 'lodash';

import { Component, Inject, Injector, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { IBookingTimeslots } from '@shared/Interfaces';
import { MAT_DIALOG_DATA, MatDialogRef, MatInput } from '@angular/material';

import { AppComponentBase } from '@shared/app-component-base';
import { DataService } from '@shared/service-proxies/service-data';
import { ValidationRule } from '@shared/common/common';
import { standardized } from '@shared/helpers/utils';
import swal from 'sweetalert2';



@Component({
    selector: 'app-task',
    templateUrl: './task.component.html',
    styleUrls: ['./task.component.scss']
})
export class TaskComponent extends AppComponentBase implements OnInit {
    api: string = 'bookingtimeslots';
    ValidationRule = new ValidationRule();
    _frm: FormGroup;
    _obj: IBookingTimeslots | any = { code: '', name: '', hoursStart: '', minuteStart: '', hourseEnd: '', minuteEnd: '', status: '' };
    _context: any;
    _isNew: boolean = true;
    _hours: Array<string> = [];
    _minute: Array<string> = [];




    private rules = { code: 'noSpace', name: 'noSpace' };

    constructor(injector: Injector, private _dataService: DataService, private _formBuilder: FormBuilder, public dialogRef: MatDialogRef<TaskComponent>, @Inject(MAT_DIALOG_DATA) public obj: IBookingTimeslots) {
        super(injector);
    }

    ngOnInit() {
        // Fill data combobox Hours
        for (var i = 0; i < 24; i++) {
            if (i < 10) {
                var hours = "0" + i;
                this._hours.push(hours);
            }
            else {
                this._hours.push(i.toString());
            }

        }
        // Fill data combobox Minute
        for (var i = 0; i < 60; i++) {
            if (i < 10) {
                var minute = "0" + i;
                this._minute.push(minute);
            }
            else {
                this._minute.push(i.toString());
            }

        }
        const validationRule = new ValidationRule();
        if (this.obj) {
            this._obj = _.clone(this.obj);
            this._isNew = false;
        }

        this._context = {
            code: [this._obj.code, [Validators.required, validationRule.hasValue]],
            name: [this._obj.name, [Validators.required, validationRule.hasValue]],
            hoursStart: [],
            minuteStart: [],
            hoursEnd: [validationRule.compare('hoursStart', 'hoursEnd')],
            minuteEnd: [],
            isActive: true,
            createUserId: [this.appSession.userId],
            updateUserId: [this.appSession.userId],
            healthFacilitiesId: [this.appSession.user.healthFacilitiesId],
            timeSlotId: [this._obj.timeSlotId]
        };

        this._frm = this._formBuilder.group(this._context);
        //this._frm.setValue({hoursStart: "00", minuteStart: "00", hoursEnd: "00", minuteEnd: "00"});
        this._frm.controls['hoursStart'].setValue("00");
        this._frm.controls['minuteStart'].setValue("00");
        this._frm.controls['hoursEnd'].setValue("00");
        this._frm.controls['minuteEnd'].setValue("00");
        if (this._obj.code) {
            this._frm.controls['hoursStart'].setValue(this._obj.hoursStart);
            this._frm.controls['minuteStart'].setValue(this._obj.minuteStart);
            this._frm.controls['hoursEnd'].setValue(this._obj.hoursEnd);
            this._frm.controls['minuteEnd'].setValue(this._obj.minuteEnd);
            this._frm.controls['isActive'].setValue(this._obj.isActive);
            //this._frm.controls['code'].disable();
        }
    }

    submit() {
        console.log(101, this._frm.value);

        var start = this._frm.controls['hoursStart'].value.concat(this._frm.controls['minuteStart'].value);
        var end = this._frm.controls['hoursEnd'].value.concat(this._frm.controls['minuteEnd'].value);
        if (start >= end) {
            swal({
                title: this.l('Thông báo'),
                text: 'Thời gian kết thúc phải lớn hơn thời gian bắt đầu!',
                type: 'error',
                timer: 3000
            });
        }
        else {
            this._isNew ?
                this._dataService.create(this.api, _.omit(Object.assign(this._frm.value), 'timeSlotId')).subscribe(e => {
                    swal({
                        title: this.l('SaveSuccess'),
                        text: '',
                        type: 'success',
                        timer: 3000
                    });
                    this.dialogRef.close();
                }, err => { }) :

                this._dataService.update(this.api, Object.assign(this._frm.value, this.obj.timeSlotId)).subscribe(() => {
                    swal({
                        title: this.l('SaveSuccess'),
                        text: '',
                        type: 'success',
                        timer: 3000
                    });
                    this.dialogRef.close();
                }, err => { });
        }
    }
}
