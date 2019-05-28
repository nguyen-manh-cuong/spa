import * as _ from 'lodash';
import { Component, Inject, Injector, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatInput } from '@angular/material';
import { AppComponentBase } from '@shared/app-component-base';
import { DataService } from '@shared/service-proxies/service-data';
import { ValidationRule } from '@shared/common/common';
import swal from 'sweetalert2';

@Component({
    selector: 'app-index',
    templateUrl: './index.component.html',
    styleUrls: ['./index.component.scss']
})
export class IndexComponent extends  AppComponentBase implements OnInit {
    // variable
    api: string = 'reset-password-user';
    frmResetPassword: FormGroup;
    _obj: any = { NewPassword: '', OldPassword: '', UserName: '' }

    //contructor
    constructor(injector: Injector, private _dataService: DataService, private _formBuilder: FormBuilder) { super(injector); }

    ngOnInit() {
        const validationRule = new ValidationRule();
        this.frmResetPassword = this._formBuilder.group({
            NewPassword: [this._obj.NewPassword],
            OldPassword: [this._obj.OldPassword],
            UserName: []

        })
    }
    resetPassword() {
        console.log('gia tri cua form', this.frmResetPassword)
        // call api
        this._dataService.update(this.api, Object.assign(this.frmResetPassword.value)).subscribe(() => {
            swal({
                title: this.l('SaveSuccess'),
                text: '',
                type: 'success',
                timer: 3000
            });
        }, err => { });
    }

}
