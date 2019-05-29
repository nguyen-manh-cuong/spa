import { AfterViewInit, Component, Injector, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { AbpSessionService } from '@abp/session/abp-session.service';
import { AppComponentBase } from '@shared/app-component-base';
import { LoginService } from './login.service';
import { Router, Route } from '@angular/router';
import { IHealthfacilities } from '@shared/Interfaces';
import { debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { DataService } from '@shared/service-proxies/service-data';
import { DomSanitizer } from '@angular/platform-browser';
import * as moment from 'moment';
import swal from 'sweetalert2';
import { error } from '@angular/compiler/src/util';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class LoginComponent extends AppComponentBase implements OnInit {

    frmLogin: FormGroup;
    submitted = false;
    saving = true;
    isLoading = false;
    dataService: DataService;
    numberLoginFail = 0;
    @ViewChild('userNameOrEmail') userNameOrEmail;

    constructor(
        private router: Router,
        private _sanitizer: DomSanitizer,
        private _dataService: DataService,
        private http: HttpClient, injector: Injector,
        public loginService: LoginService,
        private _formBuilder: FormBuilder,
        private _sessionService: AbpSessionService) {
        super(injector);
    }

    ngOnInit(): void {
        this.frmLogin = this._formBuilder.group({
            userNameOrEmailAddress: [this.loginService.authenticateModel.userNameOrEmailAddress, Validators.required],
            password: [this.loginService.authenticateModel.password, Validators.required],
            codeCapcha: [''],
        });
        this.dataService = this._dataService;
        this.getCapcha();

        
        setTimeout(() => {
            this.userNameOrEmail.nativeElement.focus();
        }, 1000);
    }

    get f() { return this.frmLogin.controls; }
    get multiTenancySideIsTeanant(): boolean {
        return this._sessionService.tenantId > 0;
    }
    get isSelfRegistrationAllowed(): boolean {
        if (!this._sessionService.tenantId) {
            return false;
        }

        return true;
    }

    capcha = false;
    _capcha: { code: string, data: any } = { code: '', data: '' };

    onHandleLoginInput(event) {
        console.log(event.target.value);
        this._dataService.get('auth', JSON.stringify({ 'userName': event.target.value }), null, null, null).subscribe(data => {
            if (data.items != undefined) {
                let numLoginFail = data.items.counter;
                this.numberLoginFail = numLoginFail;
            }
        });
    }

    login(): void {
        let numLoginFail = 0;
        let lockedTime = 0;
        
        this._dataService.get('auth', JSON.stringify({ 'userName': this.frmLogin.controls['userNameOrEmailAddress'].value }), null, null, null).subscribe(data => {
            if (!data.items) {
                return swal({
                    title: this.l('Notification'),
                    text: this.l('Đăng nhập không thành công. Tên đăng nhập hoặc mật khẩu không chính xác'),
                    type: 'warning',
                    timer: 3000
                });
            }
            console.log(112, data.items);
            lockedTime = (moment(new Date(data.items.lockedTime)).valueOf() - moment(Date.now()).valueOf()) / (1000 * 60);
            
            if (lockedTime > 0 && lockedTime <= 60) {
                return swal({
                    title: this.l('Notification'),
                    text: this.l('Đăng nhập không thành công. Vui lòng trở lại sau 60 phút'),
                    type: 'warning',
                    timer: 3000
                });
            }
            
            numLoginFail = data.items.counter;
            this.numberLoginFail = numLoginFail;
            console.log(821, this.numberLoginFail);
            if (numLoginFail > 5) {
                if (this.frmLogin.controls['codeCapcha'].value != this._capcha.code) {
                    this.capcha = true;
                    return;
                }
            }

            this.submitted = true;
            if (this.frmLogin.invalid) { return; }
            this.loginService.authenticateModel = Object.assign(this.loginService.authenticateModel, this.frmLogin.value);
            this.loginService.authenticate((success) => {
                console.log(success);
                if (success) {
                    this._dataService.get('auth', JSON.stringify({ 'userName': this.frmLogin.controls['userNameOrEmailAddress'].value, 'counter': -1 }), null, null, null).subscribe(data => { });
                }

            }, error => {
                    this._dataService.get('auth', JSON.stringify({
                        'userName': this.frmLogin.controls['userNameOrEmailAddress'].value, 'counter': numLoginFail, 'lockedTime': lockedTime
                    }), null, null, null).subscribe(data => {
                        console.log('OKE');
                        if (numLoginFail > 5) {
                            this.getCapcha();
                        }
                    });
            });
        });
    }

    getCapcha() {
        this._dataService.getAny('get-captcha-image').subscribe(res => this._capcha = { code: res.code, data: this._sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + res.data) });
    }

    validateCapcha(value: any) {
        if (value.length == 4) this._capcha.code != value ? this.capcha = true : this.capcha = false;
    }

    resetPassWordClick() {
        this.router.navigate(['/auth/secret']);
    }
}
