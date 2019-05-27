import * as _ from 'lodash';
import { Component, Inject, Injector, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatInput } from '@angular/material';
import { AppComponentBase } from '@shared/app-component-base';
import { DataService } from '@shared/service-proxies/service-data';
import { ValidationRule } from '@shared/common/common';


@Component({
    selector: 'app-task',
    templateUrl: './task.component.html',
    styleUrls: ['./task.component.scss']
})
export class TaskComponent extends AppComponentBase implements OnInit {
    // variable
    frmResetPassword: FormGroup;
    _obj: any = { passwordOld: '', passwordNew: '', rePassword: '' }

    //contructor
    constructor(injector: Injector, private _dataService: DataService, private _formBuilder: FormBuilder, public dialogRef: MatDialogRef<TaskComponent>, @Inject(MAT_DIALOG_DATA) public obj) { super(injector); }

    ngOnInit() {
        const validationRule = new ValidationRule();
        this.frmResetPassword = this._formBuilder.group({
            passwordOld: [this._obj.passwordOld],
            passwordNew: [this._obj.passwwordNew],
            rePassword: [this._obj.rePassword]

        })
        if (this.obj) {
            this._obj = _.clone(this.obj);
        }
    }
    resetPassword() {
        // call api
    }
}
