import { AfterViewInit, Component, Injector, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { AbpSessionService } from '@abp/session/abp-session.service';
import { AppComponentBase } from '@shared/app-component-base';
import { LoginService } from './login.service';
import { Router } from '@angular/router';
import swal from 'sweetalert2';
import { forEach } from '@angular/router/src/utils/collection';
import { DataService } from '../../shared/service-proxies/service-data';
import * as moment from 'moment';
import { notifyToastr } from '@shared/helpers/utils';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    encapsulation: ViewEncapsulation.None
})

export class LoginComponent extends AppComponentBase implements OnInit {

    frmLogin: FormGroup;
    dataService: DataService;
    submitted = false;
    saving = true;
    capcha = false;
    numberLoginFail = 0;
    _capcha: { code: string, data: any } = { code: '', data: '' };
    userLogin = { userName: '', logCount: 0 };

    @ViewChild("userNameOrEmailAddress") userNameOrEmailAddress: ElementRef;
    @ViewChild('codeCapcha') codeCapcha: ElementRef;

    constructor(
        private http: HttpClient,
        injector: Injector,
        private _dataService: DataService,
        public loginService: LoginService,
        private _sanitizer: DomSanitizer,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _sessionService: AbpSessionService) {
        super(injector);
    }

    ngOnInit(): void {
        this.dataService = this._dataService;
        this.getCapcha();
        this.frmLogin = this._formBuilder.group({
            userNameOrEmailAddress: [this.loginService.authenticateModel.userNameOrEmailAddress, Validators.required],
            password: [this.loginService.authenticateModel.password, Validators.required],
            codeCapcha: [''],
        });
        abp.ui.setBusy();

        this.userNameOrEmailAddress.nativeElement.focus();
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

    onHandleLoginInput(event) {
        console.log(1, JSON.parse(localStorage.getItem('userLog')));
        if (localStorage.getItem('userLog') != null && JSON.parse(localStorage.getItem('userLog')).userName === event.target.value) {
            if (parseInt(JSON.parse(localStorage.getItem('userLog')).logCount) < 10) {
                this.numberLoginFail = parseInt(JSON.parse(localStorage.getItem('userLog')).logCount);
            }
            else {
                //localStorage.removeItem('userLog');
                localStorage.clear();
            }
        }
        else {
            this.numberLoginFail = 0;
        }
    }

    login(): void {
        //this.submitted = true;
        //if (this.frmLogin.invalid) { 
        //    // swal('Thông báo', 'Sai tài khoản hoặc mật khẩu', 'warning');
        //    for (let key in this.frmLogin.controls) {
        //        if(this.frmLogin.controls[key] && this.frmLogin.controls[key].errors){
        //            this.frmLogin.controls[key].markAsTouched();
        //            this.frmLogin.controls[key].markAsDirty();
        //        }
        //    }
        //    return;
        //}
        //// this.submitting = true;

        //this.loginService.authenticateModel = Object.assign(this.loginService.authenticateModel, this.frmLogin.value);
        //this.loginService.authenticate(() => { console.log(); }, error => console.log(error));

        let numLoginFail = 1;
        let lockedTime = 0;

        const userNameOrEmailAddress = this.frmLogin.controls['userNameOrEmailAddress'].value.toLocaleLowerCase();

        this._dataService.get('auth', JSON.stringify({ 'userName': userNameOrEmailAddress }), null, null, null).subscribe(data => {
            if (!data.items) {
                notifyToastr(this.l('Notification'), this.l('Đăng nhập không thành công. Tài khoản không tồn tại'), 'warning');
                return;
            }

            if (localStorage.getItem('userLog') != null) {
                numLoginFail = parseInt(JSON.parse(localStorage.getItem('userLog')).logCount);
            }
            if (numLoginFail === 11) localStorage.removeItem('userLog');
            if (data.items.status != 2 || data.items.mdmStatus != 1 || moment(new Date(data.items.expriredDate)).valueOf() < moment(Date.now()).valueOf()) {
                this._dataService.get('auth', JSON.stringify({ 'userName': userNameOrEmailAddress }), null, null, null).subscribe(data => {
                    return notifyToastr(this.l('Notification'), this.l('Đăng nhập không thành công. Tài khoản chưa được kích hoạt hoặc bị khóa'), 'warning');
                });
                return;
            }

            lockedTime = (moment(Date.now()).valueOf() - moment(new Date(data.items.lockedTime)).valueOf()) / (1000 * 60);
            if (lockedTime < 0) {
                this.numberLoginFail = 0;
                this.userNameOrEmailAddress.nativeElement.focus();
                this.frmLogin.controls['userNameOrEmailAddress'].setValue('');
                this.frmLogin.controls['password'].setValue('');
                //localStorage.removeItem('userLog');

                localStorage.clear();

                notifyToastr(this.l('Notification'), this.l('Đăng nhập không thành công. Vui lòng trở lại sau 60 phút'), 'warning');
                return;
            }

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
                        this.userNameOrEmailAddress.nativeElement.focus();
                        this.frmLogin.controls['userNameOrEmailAddress'].setValue('');

                        this.frmLogin.controls['password'].setValue('');
                        notifyToastr(this.l('Notification'), this.l('Đăng nhập không thành công. Vui lòng trở lại sau 60 phút'), 'warning');
                    }
                    else {
                        notifyToastr(this.l('Notification'), this.l(`Mã xác nhận không trùng khớp. Bạn còn ${10 - numLoginFail} lần thử`), 'warning');
                        this.userLogin.logCount = numLoginFail + 1;
                        this.userLogin.userName = userNameOrEmailAddress;
                        localStorage.setItem('userLog', JSON.stringify(this.userLogin));
                        this.frmLogin.controls['codeCapcha'].setValue('');
                        this.codeCapcha.nativeElement.focus();
                        if (numLoginFail === 10) localStorage.clear();
                        return;
                    }
                }
            }
            this.userLogin.logCount = numLoginFail + 1;
            this.userLogin.userName = userNameOrEmailAddress;
            this.submitted = true;
            if (this.frmLogin.invalid) { return; }
            this.loginService.authenticateModel = Object.assign(this.loginService.authenticateModel, this.frmLogin.value);
            this.loginService.authenticate((success) => {

                if (success) {
                    //if (this.frmLogin.controls['isRemberMeChecked'].value) {
                    //    localStorage.setItem('userName', this.frmLogin.controls['userNameOrEmailAddress'].value);
                    //    localStorage.setItem('password', this.frmLogin.controls['password'].value);
                    //} else {
                    //    localStorage.removeItem('userName');
                    //    localStorage.removeItem('password');
                    //}

                    this.userLogin.logCount = 0;
                    this.userLogin.userName = '';
                    //localStorage.setItem('userLog', JSON.stringify(this.userLogin));
                    localStorage.clear();
                    this._dataService.get('auth', JSON.stringify({ 'userName': userNameOrEmailAddress, 'counter': -1 }), null, null, null).subscribe(data => { });
                }

            }, () => {
                localStorage.setItem('userLog', JSON.stringify(this.userLogin));
                this._dataService.get('auth', JSON.stringify({ 'userName': userNameOrEmailAddress, 'counter': numLoginFail, 'lockedTime': lockedTime }), null, null, null).subscribe(data => {
                    if (numLoginFail > 4) {
                        this.getCapcha();
                    }
                });

                if (numLoginFail <= 5) {
                    notifyToastr(this.l('Notification'), this.l(`Đăng nhập không thành công. Tên đăng nhập hoặc mật khẩu không chính xác. Bạn còn ${5 - numLoginFail} lần thử`), 'warning');
                    return;
                }
                else if (10 === numLoginFail) {
                    this.userNameOrEmailAddress.nativeElement.focus();
                    this.frmLogin.controls['userNameOrEmailAddress'].setValue('');
                    this.frmLogin.controls['password'].setValue('');
                    //localStorage.removeItem('userLog');
                    localStorage.clear();
                    notifyToastr(this.l('Notification'), this.l('Đăng nhập không thành công. Vui lòng trở lại sau 60 phút'), 'warning');
                    return;
                }
                else {
                    notifyToastr(this.l('Notification'), (10 - numLoginFail === 0)
                        ? this.l('Đăng nhập không thành công. Vui lòng trở lại sau 60 phút')
                        : this.l(`Đăng nhập không thành công. Tên đăng nhập hoặc mật khẩu không chính xác. Bạn còn ${10 - numLoginFail} lần thử`), 'warning');
                    return;
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

    resetPasswordClick() {
        this._router.navigateByUrl("auth/reset");
    }

    registerClick() {
        this._router.navigateByUrl("auth/register");
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
}
