import swal from 'sweetalert2';
import * as _ from 'lodash';
import * as moment from 'moment';

import { Component, Inject, Injector, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IGroup, IUser } from '@shared/Interfaces';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { identity, pickBy } from 'lodash';

import { AppComponentBase } from '@shared/app-component-base';
import { CreateUserDto } from '@shared/service-proxies/service-proxies';
import { DataService } from '@shared/service-proxies/service-data';
import { SelectionModel } from '@angular/cdk/collections';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { ValidationRule } from '@shared/common/common';

@Component({
    selector: 'app-reset',
    templateUrl: './reset.component.html',
    styleUrls: ['./reset.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ResetComponent extends AppComponentBase implements OnInit {

    frmUser: FormGroup;

    _capcha: { code: string, data: any } = { code: '', data: '' };

    capcha = false;

    _user: IUser | CreateUserDto;

    _context: any;

    constructor(
        injector: Injector,
        private _formBuilder: FormBuilder,
        private _dataService: DataService,
        public dialogRef: MatDialogRef<ResetComponent>,
        @Inject(MAT_DIALOG_DATA) public user: IUser,
        private _sanitizer: DomSanitizer) {
        super(injector);
    }

    ngOnInit() {
        const validationRule = new ValidationRule();

        if (this.user) {
            this._user = _.clone(this.user);

            this._context = {
                userName: [this._user.userName],
                newPassword: ['', [Validators.required, validationRule.passwordStrong]],
                confirmPassword: ['', [Validators.required, validationRule.passwordStrong]],
                capcha: ['', [Validators.required]],
            };
            this.getCapcha();
            this.frmUser = this._formBuilder.group(this._context);
        }
    }

    getCapcha() {
        this._dataService.getAny('get-captcha-image').subscribe(res => this._capcha = { code: res.code, data: this._sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + res.data) });
    }

    capchaInput(event) {
        event.target.value = this.replace_space(this.replace_alias(event.target.value));
        if (this._capcha.code != event.target.value) {
            this.frmUser.controls['capcha'].setErrors({'capcha':true});
        }
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

    confirmPasswordInput(value) {
        if (value != this.frmUser.controls['newPassword'].value) {
            this.frmUser.controls['confirmPassword'].setErrors({ 'comparePassword': true });
        }
    }

    submit() {
        if (this.frmUser.controls['newPassword'].value != this.frmUser.controls['confirmPassword'].value) {
            return swal({
                title: "Đổi mật khẩu không thành công",
                text: "Xác nhận mật khẩu mới không đúng",
                type: "warning",
                timer: 3000
            });
        }
       
        this._user.password = this.frmUser.controls['newPassword'].value;
        console.log(11, this._user);

        this._dataService.update("users-reset-password", this._user).subscribe(() => {
            swal({
                title: "Cấp lại mật khẩu thành công",
                type: "success",
                timer: 3000
            });
            return this.dialogRef.close();
        });
    }
}
