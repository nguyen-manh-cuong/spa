
import * as _ from 'lodash';
import { Component, Inject, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IBookingTimeslots } from '@shared/Interfaces';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { AppComponentBase } from '@shared/app-component-base';
import { DataService } from '@shared/service-proxies/service-data';
import { ValidationRule } from '@shared/common/common';
import swal from 'sweetalert2';



@Component({
    selector: 'app-task',
    templateUrl: './task.component.html',
    styleUrls: ['./task.component.scss']
})
export class TaskComponent extends AppComponentBase implements OnInit {
    // khai báo biến
    api: string = 'bookingtimeslots';
    _frm: FormGroup;
    ValidationRule = new ValidationRule();    
    _obj: IBookingTimeslots | any = { code: '', name: '', hoursStart: '', minuteStart: '', hourseEnd: '', minuteEnd: '', status: '' };
    _context: any;
    _isNew: boolean = true;

    // khởi tạo
    constructor(injector: Injector, private _dataService: DataService, private _formBuilder: FormBuilder, public dialogRef: MatDialogRef<TaskComponent>, @Inject(MAT_DIALOG_DATA) public obj: IBookingTimeslots) {
        super(injector);
    }

    ngOnInit() {
      
       
        const validationRule = new ValidationRule();
        if (this.obj) {
            this._obj = _.clone(this.obj);
            this._isNew = false;
        }

        // Đổ dữ liệu vào form sửa
        this._context = {
            code: [this._obj.code, [Validators.required, validationRule.hasValue]],
            name: [this._obj.name, [Validators.required, validationRule.hasValue]],
            isActive: true,
            createUserId: [this.appSession.userId],
            updateUserId: [this.appSession.userId],
            timeSlotId: [this._obj.timeSlotId]
        };

        this._frm = this._formBuilder.group(this._context);
    }

    // click nút lưu
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
                this._dataService.create(this.api, _.omit(Object.assign(this._frm.value), 'timeSlotId')).subscribe(() => {
                    swal({
                        title: this.l('SaveSuccess'),
                        text: '',
                        type: 'success',
                        timer: 3000
                    });
                    this.dialogRef.close();
                }, () => { }) :

                this._dataService.update(this.api, Object.assign(this._frm.value, this.obj.timeSlotId)).subscribe(() => {
                    swal({
                        title: this.l('SaveSuccess'),
                        text: '',
                        type: 'success',
                        timer: 3000
                    });
                    this.dialogRef.close();
                }, () => { });
        }
    }
}
