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
            for (let err in this.control.errors) {
                return this.getErrorMessage(err);
            }
        }
    }

    getErrorMessage(err) {
        const isVi = abp.utils.getCookieValue('Abp.Localization.CultureName') !== 'en';
        let messages = {
            'required': isVi ? 'Không được để trống' : 'Not be empty',
            'compare': isVi ? 'SMS đến phải lớn hơn SMS từ' : 'The SMS to must be larger than the SMS from',
            'special': isVi ? 'Không đúng định dạng' : 'Do not enter special characters',
            'invalidphonenumber': isVi ? 'Số điện thoại không đúng định dạng' : 'Invalid phone number',
            'minlength': isVi ? 'Không đủ độ dài tối thiểu' : 'The phone number not match length',
            'topnumber': isVi ? 'Sai đầu số điện thoại' : 'Invalid phone number',
            'email': isVi ? 'Sai định dạng email' : 'Invalid email'
        }
        return messages[err]
    }
}
