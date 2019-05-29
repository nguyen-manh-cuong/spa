import * as _ from 'lodash';
import { Component, Inject, Injector, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatInput } from '@angular/material';
import { AppComponentBase } from '@shared/app-component-base';
import { DataService } from '@shared/service-proxies/service-data';
import { ValidationRule } from '@shared/common/common';
import swal from 'sweetalert2';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-index',
    templateUrl: './index.component.html',
    styleUrls: ['./index.component.scss']
})
export class IndexComponent extends AppComponentBase implements OnInit {
    // variable
    api: string = 'reset-password-user';
    frmResetPassword: FormGroup;
    _obj: any = { NewPassword: '', OldPassword: '', UserName: '' }

    //contructor
    constructor(injector: Injector, private _dataService: DataService, private _formBuilder: FormBuilder, private _sanitizer: DomSanitizer) { super(injector); }

    ngOnInit() {
        const validationRule = new ValidationRule();
        this.frmResetPassword = this._formBuilder.group({
            OldPassword: [this._obj.OldPassword],
            NewPassword: [this._obj.NewPassword],
            UserName: this.appSession.user.userName,
            RePassword: [],
            codeCapcha: [''],
        })
        this.getCapcha();

    }
    //capchar
    capcha = false;
    _capcha: { code: string, data: any } = { code: '', data: '' };

    getCapcha() {
        this._dataService.getAny('get-captcha-image').subscribe(res => this._capcha = { code: res.code, data: this._sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + res.data) });
    }

    validateCapcha(value: any) {
        if (value.length == 4) this._capcha.code != value ? this.capcha = true : this.capcha = false;
    }

    // update databsae
    resetPassword() {
        if (this.frmResetPassword.controls['NewPassword'].value != this.frmResetPassword.controls['RePassword'].value) {
            return swal({
                title: 'Thông báo',
                text: 'Đổi mật khẩu không thành công. Xác nhận khẩu mới không đúng',
                type: 'warning',
                timer: 3000
            });
        }
        if (this.frmResetPassword.controls['codeCapcha'].value != this._capcha.code) {
            this.capcha = true;
            return;
        }
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
