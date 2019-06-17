import { Component, Input, ElementRef, OnInit } from '@angular/core';
import * as moment from 'moment';
import { AbstractControl } from '@angular/forms';

@Component({
    selector: 'validation',
    templateUrl: './validation.component.html',
    styleUrls: ['./validation.component.scss']
})

export class ValidationComponent implements OnInit {
    @Input() control;

    constructor() {
    }

    ngOnInit() {
    }

    get message() {
        if (this.control && this.control.errors) {
            // console.log(22, this.control.errors);
            for (let err in this.control.errors) {
                return this.getErrorMessage(err);
            }
        }      
    }

    getErrorMessage(err) {
        const isVi = abp.utils.getCookieValue('Abp.Localization.CultureName') !== 'en';
        let messages = {
            'required': isVi ? 'Không được để trống.' : 'Not be empty',
            'password' : isVi ? 'Xác nhận mật khẩu không khớp.' : 'Password incorrect',
            'passwordStrong': isVi ? 'Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt.' : 'Password incorrect',
            'passwordValidate': isVi ? 'Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt.' : 'Password incorrect',
            'special' : isVi ? 'Không đúng định dạng.' : 'Do not enter special characters',
            'minlength' : isVi ? 'Không đủ độ dài tối thiểu.' : 'Not enough length',
            'email' : isVi ? 'Email không đúng định dạng.' : 'Email invalidate',
            'topnumber' : isVi ? 'Đầu số sai định dạng.' : 'Top number invalidate',
            'identification' : isVi ? 'CMND/CCCD phải có độ dài là 9 hoặc 12 ký tự' : 'Identification invalidate',
            'capcha': isVi ? 'Mã capcha không khớp.' : 'Capcha invalidate',
            'compareDate': isVi ? "Ngày khám phải lớn hơn hoặc bằng ngày hiên tại" : 'Date invalidate',
            'birthDate': isVi ? "Ngày sinh không đúng định dạng" : 'Date invalidate',
        }
        return messages[err]
    }
}
