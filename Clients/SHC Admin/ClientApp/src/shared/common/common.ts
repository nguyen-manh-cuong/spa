import * as _ from 'lodash';
import { AbstractControl } from '@angular/forms';

export class ValidationRule {
    //So sanh 2 control
    compare(frmFirst: string, frmSecond: string) {
        return (ac: AbstractControl) => {
            if (ac.parent && ac.parent.controls[frmFirst] && ac.parent.controls[frmSecond]) {
                if (Number(ac.parent.controls[frmFirst].value) >= Number(ac.parent.controls[frmSecond].value)) return { compare: true };
                //ac.parent.controls[frmSecond].errors = {compare: true}
            }

            return null;
        }
    }

    //Kiem tra space, null
    hasValue(control: AbstractControl) {
        if ((!control.value || (typeof control.value == 'string' && !control.value.trim())) && !isNaN(control.value)) {
            return { required: true };
        }
        return null;
    }

    //Kiem tra special character
    hasSpecialCharacter(control: AbstractControl) {
        const pattern = /^[0-9]*$/;

        if (!pattern.test(control.value)) {
            return { special: true };
        }
        return null;
    }

    topPhoneNumber(control: AbstractControl) {
        let arr: string[] = ['086', '096', '097', '098', '032', '033', '034', '035', '036', '037', '038', '039',
            '089', '090', '093', '070', '079', '077', '076', '078',
            '091', '094', '088', '083', '084', '085', '081', '082',
            '092', '056', '058', '099', '059'];
        const pattern = /^[0-9\+]*$/;
        if(control.value && control.value!=""){
            if (!pattern.test(control.value)) {
                control.setValue(control.value.replace(/[^0-9\+]/g, ""));
            }
            if (control.value.charAt(0) != '+' && control.value.length >= 3 && (arr.indexOf(control.value.substring(0, 3)) < 0)) {
                return { topnumber: true };
            }
            if (control.value.charAt(0) != '+' && control.value.indexOf("+") > 0) {
                return { invalidphonenumber: true };
            }
            if (control.value.length < 10) {
                return { minlength: true };
            }
        }
        return null;
    }

    email(control: AbstractControl) {
        var pattern = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if (control.value && control.value.trim()) {
            if (!pattern.test(control.value)) {
                return { email: true };
            }

            if (control.value.split('@')[0].length > 64 || control.value.split('@')[1].length > 255) {
                return { email: true };
            }
        }

        return null;
    }

}