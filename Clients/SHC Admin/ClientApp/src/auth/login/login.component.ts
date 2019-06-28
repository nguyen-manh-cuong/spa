import { Component, Injector, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { AbpSessionService } from '@abp/session/abp-session.service';
import { AppComponentBase } from '@shared/app-component-base';
import { LoginService } from './login.service';
import { Router, Route } from '@angular/router';
import { DataService } from '@shared/service-proxies/service-data';
import { DomSanitizer, Title } from '@angular/platform-browser';
import * as moment from 'moment';
import swal from 'sweetalert2';
import { notifyToastr } from '@shared/helpers/utils';

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
    @ViewChild('codeCapcha') codeCapcha;

    constructor(
        private router: Router,
        private _sanitizer: DomSanitizer,
        private _dataService: DataService,
        private http: HttpClient,
        injector: Injector,
        public loginService: LoginService,
        private _formBuilder: FormBuilder,
        private _sessionService: AbpSessionService,
        private titleService: Title ) {
        super(injector);
    }

    ngOnInit(): void {
        this.frmLogin = this._formBuilder.group({
            userNameOrEmailAddress: [localStorage.getItem('userName'), Validators.required], //this.loginService.authenticateModel.userNameOrEmailAddress
            password: [localStorage.getItem('password'), Validators.required], //this.loginService.authenticateModel.password
            codeCapcha: [''],
            isRemberMeChecked: [false]
        });
        this.dataService = this._dataService;
        this.getCapcha();

        setTimeout(() => {
            this.userNameOrEmail.nativeElement.focus();
        }, 1000);

        this.titleService.setTitle("VIETTEL GATEWAY");
        localStorage.removeItem('isLoggedIn');
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
        this._dataService.get('auth', JSON.stringify({ 'userName': event.target.value }), null, null, null).subscribe(data => {
            if (data.items != undefined) {
                if (data.items.counter < 10) {
                    this.numberLoginFail = data.items.counter;
                }

                let lockedTime = (moment(Date.now()).valueOf() - moment(new Date(data.items.lockedTime)).valueOf()) / (1000 * 60);
                if (lockedTime >= 0) {
                    if (data.items.counter >= 10) {
                        this._dataService.get('auth', JSON.stringify({ 'userName': this.frmLogin.controls['userNameOrEmailAddress'].value, 'counter': -1 }), null, null, null).subscribe(data => { });
                    }
                }
            }
        });
    }
    //chém space
    replace_space(str) {
        str = str.replace(/ /g, "");
        return str;
    }
    login(): void {
        let numLoginFail = 1;
        let lockedTime = 0;

        const userNameOrEmailAddress = this.frmLogin.controls['userNameOrEmailAddress'].value.toLocaleLowerCase();

        this._dataService.get('auth', JSON.stringify({ 'userName': userNameOrEmailAddress }), null, null, null).subscribe(data => {
            if (!data.items) {
                notifyToastr(this.l('Notification'), this.l('Đăng nhập không thành công. Tài khoản không tồn tại'), 'warning');
                return;
                //  swal({
                //     title: this.l('Notification'),
                //     text: this.l('Đăng nhập không thành công. Tài khoản không tồn tại'),
                //     type: 'warning',
                //     timer: 3000
                // });
            }

            if (data.items.status != 2 || data.items.mdmStatus != 1 || moment(new Date(data.items.expriredDate)).valueOf() < moment(Date.now()).valueOf()) {
                this._dataService.get('auth', JSON.stringify({'userName': userNameOrEmailAddress}), null, null, null).subscribe(data => {
                    return notifyToastr(this.l('Notification'), this.l('Đăng nhập không thành công. Tài khoản chưa được kích hoạt hoặc bị khóa'), 'warning');
                    //  swal({
                    //     title: this.l('Notification'),
                    //     text: this.l('Đăng nhập không thành công. Tài khoản chưa được kích hoạt hoặc bị khóa'),
                    //     type: 'warning',
                    //     timer: 3000
                    // });
                });
                return;
            }

            lockedTime = (moment(Date.now()).valueOf() - moment(new Date(data.items.lockedTime)).valueOf()) / (1000 * 60);
            if (lockedTime < 0) {
                this.numberLoginFail = 0;
                this.userNameOrEmail.nativeElement.focus();
                this.frmLogin.controls['userNameOrEmailAddress'].setValue('');
                this.frmLogin.controls['password'].setValue('');
                notifyToastr(this.l('Notification'), this.l('Đăng nhập không thành công. Vui lòng trở lại sau 60 phút'), 'warning');
                return;
                // swal({
                //     title: this.l('Notification'),
                //     text: this.l('Đăng nhập không thành công. Vui lòng trở lại sau 60 phút'),
                //     type: 'warning',
                //     timer: 3000
                // });
            }

            numLoginFail = data.items.counter + 1;

            if (numLoginFail >= 10) {
                this.numberLoginFail = 0;
            } else {
                this.numberLoginFail = numLoginFail;
            }
            
            if (numLoginFail > 5) {
                if (this.frmLogin.controls['codeCapcha'].value != this._capcha.code) {
                    this.capcha = true;
                    if (this.codeCapcha != undefined) {
                        this.codeCapcha.nativeElement.focus();
                    }
                    this.frmLogin.controls['codeCapcha'].setValue('');
                    this._dataService.get('auth', JSON.stringify({ 'userName': userNameOrEmailAddress, 'counter': numLoginFail, 'lockedTime': lockedTime }), null, null, null).subscribe(data => { });
                    if (10 - numLoginFail === 0) {
                        this.userNameOrEmail.nativeElement.focus();
                        this.frmLogin.controls['userNameOrEmailAddress'].setValue('');

                        this.frmLogin.controls['password'].setValue('');
                        notifyToastr(this.l('Notification'), this.l('Đăng nhập không thành công. Vui lòng trở lại sau 60 phút'), 'warning');
                        return;
                        //  swal({
                        //     title: this.l('Notification'),
                        //     text: this.l('Đăng nhập không thành công. Vui lòng trở lại sau 60 phút'),
                        //     type: 'warning',
                        //     timer: 3000
                        // });
                    }
                    else {
                        notifyToastr(this.l('Notification'), this.l(`Mã xác nhận không trùng khớp. Bạn còn ${10 - numLoginFail} lần thử`), 'warning');
                        return
                        // swal({
                        //     title: this.l('Notification'),
                        //     text: this.l(`Mã xác nhận không trùng khớp. Bạn còn ${10 - numLoginFail} lần thử`),
                        //     type: 'warning',
                        //     timer: 3000
                        // });
                    }
                }
            }
            this.submitted = true;
            if (this.frmLogin.invalid) { return; }
            this.loginService.authenticateModel = Object.assign(this.loginService.authenticateModel, this.frmLogin.value);
            this.loginService.authenticate((success) => {

                if (success) {
                    if (this.frmLogin.controls['isRemberMeChecked'].value) {
                        localStorage.setItem('userName', this.frmLogin.controls['userNameOrEmailAddress'].value);
                        localStorage.setItem('password', this.frmLogin.controls['password'].value);
                    } else {
                        localStorage.removeItem('userName');
                        localStorage.removeItem('password');
                    }

                    this._dataService.get('auth', JSON.stringify({ 'userName': userNameOrEmailAddress, 'counter': -1 }), null, null, null).subscribe(data => { });
                }

            }, () => {
                    this._dataService.get('auth', JSON.stringify({'userName': userNameOrEmailAddress, 'counter': numLoginFail, 'lockedTime': lockedTime}), null, null, null).subscribe(data => {
                        
                    if (numLoginFail > 4) {
                        this.getCapcha();
                    }
                });

                    if (numLoginFail <= 5) {
                        abp.notify.error(this.l(`Đăng nhập không thành công. Tên đăng nhập hoặc mật khẩu không chính xác. Bạn còn ${5 - numLoginFail} lần thử`), this.l('Notification'), { hideDuration: 3000, preventDuplicates: true, preventOpenDuplicates: true });
                        //notifyToastr(this.l('Notification'), this.l(`Đăng nhập không thành công. Tên đăng nhập hoặc mật khẩu không chính xác. Bạn còn ${5 - numLoginFail} lần thử`), 'warning');
                        return;
                        //  swal({
                        //     title: this.l('Notification'),
                        //     text: this.l(`Đăng nhập không thành công. Tên đăng nhập hoặc mật khẩu không chính xác. Bạn còn ${5 - numLoginFail} lần thử`),
                        //     type: 'warning',
                        //     timer: 3000
                        // });
                    }
                    else if (10 === numLoginFail) {
                        this.userNameOrEmail.nativeElement.focus();
                        this.frmLogin.controls['userNameOrEmailAddress'].setValue('');
                        this.frmLogin.controls['password'].setValue('');
                        notifyToastr(this.l('Notification'), this.l('Đăng nhập không thành công. Vui lòng trở lại sau 60 phút'), 'warning');
                        return;
                        // swal({
                        //     title: this.l('Notification'),
                        //     text: this.l('Đăng nhập không thành công. Vui lòng trở lại sau 60 phút'),
                        //     type: 'warning',
                        //     timer: 3000
                        // });
                    }
                    else {
                        notifyToastr(this.l('Notification'), (10 - numLoginFail === 0) 
                        ? this.l('Đăng nhập không thành công. Vui lòng trở lại sau 60 phút') 
                            : this.l(`Đăng nhập không thành công. Tên đăng nhập hoặc mật khẩu không chính xác. Bạn còn ${10 - numLoginFail} lần thử`), 'warning');
                        return;
                        // swal({
                        //     title: this.l('Notification'),
                        //     text: (10 - numLoginFail === 0) ? this.l('Đăng nhập không thành công. Vui lòng trở lại sau 60 phút') : this.l(`Đăng nhập không thành công. Tên đăng nhập hoặc mật khẩu không chính xác. Bạn còn ${10 - numLoginFail} lần thử`),
                        //     type: 'warning',
                        //     timer: 3000
                        // });
                    }
            });
        });
    }
    capchaInput(event) {
        // khong cho phep nhap khoang trang
        event.target.value = this.replace_space(this.replace_alias(event.target.value));       
    }
    getCapcha() {
        this._dataService.getAny('get-captcha-image').subscribe(res => this._capcha = { code: res.code, data: this._sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + res.data) });
    }

    validateCapcha(value: any) {
        if (value.length == 4) this._capcha.code != value ? this.capcha = true : this.capcha = false;
    }

    resetPassWordClick() {
        this.router.navigateByUrl('/auth/reset');
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
}
