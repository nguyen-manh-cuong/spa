import { AfterViewInit, Component, Injector, OnInit, ViewEncapsulation, Output, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AbpSessionService } from '@abp/session/abp-session.service';
import { AppComponentBase } from '@shared/app-component-base';
import { Router } from '@angular/router';
import { IHealthfacilities } from '@shared/Interfaces';
import { debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { DataService } from '@shared/service-proxies/service-data';
import { DomSanitizer, Title } from '@angular/platform-browser';
import swal from 'sweetalert2';

@Component({
    selector: 'app-secret',
    templateUrl: './secret.component.html',
    styleUrls: ['./secret.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SecretComponent extends AppComponentBase implements OnInit {

    frmSecret: FormGroup;

    _capcha: { code: string, data: any } = { code: '', data: '' };

    capcha = false;

    continue = false;

    constructor(
        private router: Router,
        private _sanitizer: DomSanitizer,
        private _dataService: DataService,
        private http: HttpClient, injector: Injector,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _sessionService: AbpSessionService,
        private titleService:Title) {
        super(injector);
        
    }

    ngOnInit(): void {
        this.frmSecret = this._formBuilder.group({ info: ['', [Validators.required]], capcha: ['', [Validators.required]] });
        this.getCapcha();
        this.titleService.setTitle("VIETTEL GATEWAY | Quên mật khẩu");
    }

    getCapcha() {
        this._dataService.getAny('get-captcha-image').subscribe(res => this._capcha = { code: res.code, data: this._sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + res.data) });
    }

    loginClick() {
        this.router.navigate(['/auth/login']);
    }

    
    capchaInput(event) {
        event.target.value = this.replace_alias(this.replace_space(event.target.value));
        if (this._capcha.code != event.target.value) {
            this.frmSecret.controls['capcha'].setErrors({'capcha':true});
        }
    }

    infoInput($event){
        $event.target.value = this.replace_space($event.target.value);
        if($event.target.value==''){
            this.frmSecret.controls['info'].setErrors({'required':true});
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

    makeSecret(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    submit() {
        var info = this.frmSecret.controls['info'].value;
        var secret = this.makeSecret(8);
        if (this.frmSecret.controls['capcha'].value != this._capcha.code) {
            return swal({
                title:"Đổi mật khẩu không thành công",
                text: "Mã xác nhận không chính xác",
                type: "warning",
                timer: 3000
            }).then(()=>{
            })
        } else {
            this._dataService.create("users", Object.assign({
                userName: info,
                phoneNumber: info,
                email: info,
                secretCode: secret
            })).subscribe(() => {
                this.continue = true;
            },err=>{
                this.getCapcha();
            });
        }
    }
}
