import * as _ from 'lodash';
import * as moment from 'moment';
import { AbstractControl } from '@angular/forms';


export class Common {
    inputOnlyNumber(event: any) {
        const pattern = /^[0-9]*$/;
        if (!pattern.test(event.target.value)) {
            event.target.value = event.target.value.replace(/[^0-9]/g, "");
        }
    }
}

export class ValidationRule {   
    compare(frmFirst: string, codeCapcha: string) {
        return (ac: AbstractControl) => {
            if(ac.parent && ac.parent.controls[frmFirst]){
                if(ac.parent.controls[frmFirst].value != codeCapcha) return {capcha: true};
            }

            return null;
        }
    }

    //Kiem tra space, null
    hasValue(control: AbstractControl) {
        if (!control.value || (typeof control.value == 'string' && !control.value.trim())) {
            return {required: true};
        }
        return null;
    }

    //Kiem tra special character
    hasSpecialCharacter(control: AbstractControl) {
        const pattern = /^[0-9]*$/; 

        if (!pattern.test(control.value)) {
            return {special: true};
        }
        return null;
    }

    //email
    email(control: AbstractControl){
        var pattern = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        
        if(control.value && control.value.trim()){
            if (!pattern.test(control.value)) {
                return {email: true};
            }
    
            if (control.value.split('@')[0].length > 64 || control.value.split('@')[1].length > 255) {
                return {email: true};
            }
        }
        
        return null;
    }

    //phone
    topPhoneNumber(control: AbstractControl){
        let arr: string[] = ['086', '096', '097', '098', '032', '033', '034', '035', '036', '037', '038', '039', 
        '089', '090', '093', '070', '079', '077', '076', '078',
        '091', '094', '088', '083', '084', '085', '081', '082',
        '092', '056', '058', '099', '059'];

        if (control.value && control.value.charAt(0) != '+' && control.value.length >= 3 && (arr.indexOf(control.value.trim().substring(0, 3)) < 0)) {
            return {topnumber: true};
        }
        return null;
    }

    //phone
    identification(control: AbstractControl){
        if (control.value && !(control.value.length == 9 || control.value.length == 12)) {
            return {identification: true};
        }
        
        return null;
    }

    passwordStrong(control: AbstractControl){
        var pattern = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,255}$/;

        if(control.value && !pattern.test(control.value)){
            return {passwordStrong: true};
        }

        if(control.value && control.value.search(/[A-Z]/) < 0){
            return {passwordStrong: true};
        }
        return null;
    }

    //Date valid
    dateInvalid(control: AbstractControl){
        if(control.value && !moment(control.value, 'DD/MM/YYYY').isValid()){
            return {special: true};
        }
        return null;
    }
}