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
        this.frmReset = this._formBuilder.group({
            info: [this.info],
            secretCode: ['', [Validators.required]],
            newPassword: ['', [Validators.required]],
            confirmPassword: ['', [Validators.required]],
            capcha: ['', [Validators.required]]
        });
        this.getCapcha();
    }

    getCapcha() {
        this._dataService.getAny('get-captcha-image').subscribe(res => this._capcha = { code: res.code, data: this._sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + res.data) });
    }

    validateCapcha(value: any) {
        if (value.length == 4)
            this._capcha.code != value ? this.capcha = true : this.capcha = false;
    }

    loginClick() {
        this.router.navigate(['/auth/login']);
    }

    capchaInput() {
        this.capcha = false;
    }

    submit() {
        if (this.frmReset.controls['capcha'].value != this._capcha.code) {
            this.capcha = true;
            return;
        } else {
            this.router.navigate(['/auth/reset-password']);
        }
    }
}
