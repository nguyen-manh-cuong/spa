import { AfterViewInit, Component, Injector, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { AbpSessionService } from '@abp/session/abp-session.service';
import { AppComponentBase } from '@shared/app-component-base';
import { LoginService } from './login.service';
import { Router } from '@angular/router';
import swal from 'sweetalert2';
import { forEach } from '@angular/router/src/utils/collection';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    encapsulation: ViewEncapsulation.None
})

export class LoginComponent extends AppComponentBase implements OnInit {

    frmLogin: FormGroup;
    submitted = false;
    saving = true;
    @ViewChild("userNameOrEmailAddress") userNameOrEmailAddress: ElementRef;

    constructor(private http: HttpClient, injector: Injector, public loginService: LoginService, private _formBuilder: FormBuilder, private _router: Router, private _sessionService: AbpSessionService) {
        super(injector);
    }

    ngOnInit(): void {
        this.frmLogin = this._formBuilder.group({
            userNameOrEmailAddress: [this.loginService.authenticateModel.userNameOrEmailAddress, Validators.required],
            password: [this.loginService.authenticateModel.password, Validators.required]
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

    login(): void {
        this.submitted = true;
        if (this.frmLogin.invalid) { 
            // swal('Thông báo', 'Sai tài khoản hoặc mật khẩu', 'warning');
            for (let key in this.frmLogin.controls) {
                if(this.frmLogin.controls[key] && this.frmLogin.controls[key].errors){
                    this.frmLogin.controls[key].markAsTouched();
                    this.frmLogin.controls[key].markAsDirty();
                }
            }
            return;
        }
        // this.submitting = true;

        this.loginService.authenticateModel = Object.assign(this.loginService.authenticateModel, this.frmLogin.value);
        this.loginService.authenticate(() => { console.log(); }, error => console.log(error));
    }
}
