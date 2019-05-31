import { AfterViewInit, Component, Injector, OnInit, ViewEncapsulation, Output, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { AbpSessionService } from '@abp/session/abp-session.service';
import { AppComponentBase } from '@shared/app-component-base';

import { Router } from '@angular/router';
import { IHealthfacilities } from '@shared/Interfaces';
import { debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { DataService } from '@shared/service-proxies/service-data';
import { DomSanitizer } from '@angular/platform-browser';
import swal from 'sweetalert2';
import { AppConsts } from '@shared/AppConsts';
import { Observable } from 'rxjs';
import { ValidationRule } from '@shared/common/common';

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ResetComponent extends AppComponentBase implements OnInit {

    @Input() info: String;

    frmReset: FormGroup;

    _capcha: { code: string, data: any } = { code: '', data: '' };

    capcha = false;

    constructor(
        private router: Router,
        private _sanitizer: DomSanitizer,
        private _dataService: DataService,
        private http: HttpClient, injector: Injector,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _sessionService: AbpSessionService) {
        super(injector);
    }

    ngOnInit(): void {
        const validationRule = new ValidationRule();

        this.frmReset = this._formBuilder.group({
            info: [this.info],
            secretCode: ['', [Validators.required]],
            newPassword: ['', [Validators.required, validationRule.passwordStrong]],
            confirmPassword: ['', [Validators.required, validationRule.passwordStrong]],
            capcha: ['', [Validators.required]]
        });
        this.getCapcha();
    }

    getCapcha() {
        this._dataService.getAny('get-captcha-image').subscribe(res => this._capcha = { code: res.code, data: this._sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + res.data) });
    }

    loginClick() {
        this.router.navigate(['/auth/login']);
    }

    capchaInput(event) {
        event.target.value = this.replace_space(this.replace_alias(event.target.value));
        if (this._capcha.code != event.target.value) {
            this.frmReset.controls['capcha'].setErrors({'capcha':true});
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
        if (value != this.frmReset.controls['newPassword'].value) {
            this.frmReset.controls['confirmPassword'].setErrors({ 'comparePassword': true });
        }
    }

    secretCodeInput($event){
        $event.target.value=this.replace_space($event.target.value);
    }

    submit() {
        if (this.frmReset.controls['newPassword'].value != this.frmReset.controls['confirmPassword'].value) {
            this.getCapcha();
            return swal({
                title: "Đổi mật khẩu không thành công",
                text: "Xác nhận mật khẩu mới không đúng",
                type: "warning",
                timer: 3000
            }).then(()=>{
            });
        }

        if (this.frmReset.controls['capcha'].value != this._capcha.code) {
            this.getCapcha();
            return swal({
                title: "Đổi mật khẩu không thành công",
                text: "Mã xác nhận không chính xác",
                type: "warning",
                timer: 3000
            }).then(()=>{
            })
        } else {
            this._dataService.update("users", Object.assign(
                {
                    userName: this.info,
                    phoneNumber: this.info,
                    email: this.info,
                    password: this.frmReset.controls['newPassword'].value,
                    secretCode: this.frmReset.controls['secretCode'].value
                })).subscribe(() => {
                    swal({
                        title: "Đổi mật khẩu thành công",
                        type: "success",
                        timer: 3000
                    });
                    return this.router.navigate(["/auth/login"]);
                },err=>{
                    this.getCapcha();
                });
        }
    }
}
