import * as _ from 'lodash';
import { Component, Inject, Injector, OnInit, ViewChild, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatInput } from '@angular/material';
import { AppComponentBase } from '@shared/app-component-base';
import { DataService } from '@shared/service-proxies/service-data';
import { ValidationRule } from '@shared/common/common';
import swal from 'sweetalert2';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { AppAuthService } from '@shared/auth/app-auth.service';

@Component({
    selector: 'app-index',
    templateUrl: './index.component.html',
    styleUrls: ['./index.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class IndexComponent extends AppComponentBase implements OnInit {
    // variable
    api: string = 'reset-password-user';
    frmResetPassword: FormGroup;
    _obj: any = { NewPassword: '', OldPassword: '', UserName: '' }
    validateRule = new ValidationRule();
    checkOldPassword = true;
    ckeckPasswordOldNew = false;

    @ViewChild('password') password;

    //contructor
    constructor(injector: Injector, private _dataService: DataService, private _formBuilder: FormBuilder, private _sanitizer: DomSanitizer, private _authService: AppAuthService, private titleService: Title) { super(injector); }

    ngOnInit() {
        const validationRule = new ValidationRule();
        this.frmResetPassword = this._formBuilder.group({
            Password: [this._obj.Password, [Validators.required]],
            NewPassword: [this._obj.NewPassword, [this.validateRule.passwordValidate, Validators.required, this.validateRule.hasValue]],
            UserName: this.appSession.user.userName,
            RePassword: ['', [this.validateRule.passwordValidate, Validators.required, this.validateRule.hasValue]],
            capcha: ['', [Validators.required]]
        })
        this.getCapcha();
        this.titleService.setTitle('VIETTEL GATEWAY | Cập nhật thông tin');

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

    capchaInput(event) {
        // khong cho phep nhap khoang trang
        event.target.value = this.replace_space(this.replace_alias(event.target.value));
        if ((this._capcha.code != event.target.value) && this.frmResetPassword.controls['capcha'].value) {
            this.frmResetPassword.controls['capcha'].setErrors({ 'capcha': true });
        }
    }
    capchaClick(event) {
        if (event.target.value == '') {
            this.frmResetPassword.controls['capcha'].setErrors({ 'required': true });
        }
    }

    onPaste() {
        this.checkOldPassword = true;
    }

    newPasswordInput(event) {
        event.target.value = this.replace_space(event.target.value);
        if (event.target.value && event.target.value === this.frmResetPassword.controls['Password'].value) {
            this.ckeckPasswordOldNew = true;
        }
        else {
            this.ckeckPasswordOldNew = false;
        }
    }

    passwordInput(event) {
        event.target.value = this.replace_space(event.target.value);
        this.checkOldPassword = true;
    }

    repasswordInput(event) {
        event.target.value = this.replace_space(event.target.value);
    }

    replace_alias(str) {
        str = str.replace(/[^A-Za-z0-9]+/ig, "");
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        str = str.replace(/đ/g, "d");
        str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
        str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
        str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
        str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
        str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
        str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
        str = str.replace(/Đ/g, "D");
        return str;
    }

    replace_space(str) {
        str = str.replace(/ /g, "");
        return str;
    }

    // update databsae
    resetPassword() {

        if (this.frmResetPassword.controls['NewPassword'].value != this.frmResetPassword.controls['RePassword'].value) {
            this.getCapcha();
            this.frmResetPassword.controls['capcha'].setValue('');
            return swal({
                title: 'Thông báo',
                text: 'Đổi mật khẩu không thành công. Xác nhận mật khẩu mới không đúng',
                type: 'warning',
                timer: 3000
            });
        }
        if (this.frmResetPassword.controls['capcha'].value != this._capcha.code) {
            this.capcha = true;
            this.frmResetPassword.controls['capcha'].setValue('');
            this.getCapcha();
            return;
        }
        // call api
        this._dataService.update(this.api, Object.assign(this.frmResetPassword.value)).subscribe(() => {
            this.checkOldPassword = true;
            swal({
                title: this.l('Đổi mật khẩu thành công'),
                text: '',
                type: 'success',
                timer: 3000
            }).then(() => {
                this._authService.logout();
            });     
        }, err => {
            this.checkOldPassword = false;
            this.frmResetPassword.controls['capcha'].setValue('');
            this.password.nativeElement.focus();

            this.frmResetPassword.controls['capcha'].setErrors(null);
            this.getCapcha();
        });
    }


}
