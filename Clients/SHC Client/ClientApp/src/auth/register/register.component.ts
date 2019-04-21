import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DataService } from '@shared/service-proxies/service-data';
import { CreateUserDto } from '@shared/service-proxies/service-proxies';
import { ValidationRule } from '@shared/common/common';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Location } from '@angular/common'
import * as _ from 'lodash';
import * as moment from 'moment';
import swal from 'sweetalert2';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
    frmUser: FormGroup;
    validateRule = new ValidationRule();
    insurrancePatterns = { '0': { pattern: new RegExp('\[a-zA-Z0-9\]') } };

    _hideMember = false;
    _hideDoctor = true;
    _hideMF = true;
    _hideSpecialist = true;

    _provinces: any = [];
    _districts: any = [];
    _wards: any = [];

    _dates = _.range(1, 32);
    _months = _.range(1, 13);
    _years = _.range(moment().year() - 100, moment().year());

    _specialist: any = [];
    _context: any;
    _user: CreateUserDto;

    _capcha: { code: string, data: any } = { code: '', data: '' };
    _sex: Array<{ id: number, name: string }> = [{ id: 1, name: 'Nam' }, { id: 2, name: 'Nữ' }, { id: 3, name: 'Không xác định' }];
    capcha = false;

    @ViewChild("fullName") fullName: ElementRef;

    constructor(private _sanitizer: DomSanitizer, private _dataService: DataService, private _formBuilder: FormBuilder, private _location: Location) { }

    ngOnInit() {
        this._user = new CreateUserDto();
        this._context = {
            userName: [this._user.userName, [Validators.required, this.validateRule.hasValue]],
            password: ['', [Validators.required, this.validateRule.passwordStrong]],
            confirmPassword: ['', Validators.required],
            fullName: [this._user.fullName, [Validators.required, this.validateRule.hasValue]],
            email: [this._user.email, [Validators.required, this.validateRule.hasValue, this.validateRule.email]],
            phoneNumber: [this._user.phoneNumber, [Validators.required, this.validateRule.hasValue, this.validateRule.topPhoneNumber]],
            provinceCode: [this._user.provinceCode],
            districtCode: [this._user.districtCode],
            wardCode: [this._user.wardCode],
            address: [this._user.address],
            sex: [1],
            accountType: [1],
            birthDay: [''],
            register: [this._user.register],
            identification: [this._user.identification, this.validateRule.identification],
            insurrance: [this._user.insurrance],
            workPlace: [this._user.workPlace],
            healthFacilitiesName: [this._user.healthFacilitiesName],
            specialist: [this._user.specialist],
            codeCapcha: [''],
            cmnd:[],
            gp: []
        };

        this.frmUser = this._formBuilder.group(this._context);
        this._dataService.getAll('provinces').subscribe(resp => this._provinces = resp.items);
        this._dataService.getAll('categorycommon', 'CHUYENKHOA').subscribe(resp => this._specialist = resp.items);
        this.fullName.nativeElement.focus();

        this.getCapcha();
    }

    onChangeAccountType(value: number) {
        switch (value) {
            case 1:
                this._hideDoctor = true;
                this._hideMember = false;
                this._hideMF = true;
                this._hideSpecialist = true;
                this.frmUser.controls["register"].setValue(null);
                this.cleanControl(['workPlace', 'healthFacilitiesName', 'specialist']);
                break;
            case 2:
                this._hideDoctor = false;
                this._hideMember = true;
                this._hideMF = true;
                this._hideSpecialist = false;
                this.frmUser.controls["register"].setValue(1);
                this.cleanControl(['identification', 'insurrance', 'healthFacilitiesName']);
                break;
            case 3:
                this._hideDoctor = true;
                this._hideMember = true;
                this._hideMF = false;
                this._hideSpecialist = false;
                this.frmUser.controls["register"].setValue(3);
                this.cleanControl(['identification', 'insurrance', 'workPlace']);
                break;
        }
    }

    onSelectProvince(obj: any) {
        var idProvince = obj.target.value.split(":")[1].trim();

        this._districts = this._wards = [];
        this.frmUser.patchValue({ districtCode: null, wardCode: null });
        const province = this._provinces.find((o: { provinceCode: string, name: string; }) => o.provinceCode === idProvince);
        if (province) { this._dataService.get('districts', JSON.stringify({ ProvinceCode: province.provinceCode }), '', 0, 0).subscribe(resp => this._districts = resp.items); }
    }

    onSelectDistrict(obj: any) {
        var idDistrict = obj.target.value.split(":")[1].trim();

        this._wards = [];
        this.frmUser.patchValue({ wardCode: null });
        const district = this._districts.find((o: { districtCode: string, name: string; }) => o.districtCode === idDistrict);
        if (district) { this._dataService.get('wards', JSON.stringify({ DistrictCode: district.districtCode }), '', 0, 0).subscribe(resp => this._wards = resp.items); }
    }

    submit() {
        this.frmUser.value.birthDay = new Date($('#birthY').val() + '-' + $('#birthM').val() + '-' + $('#birthD').val());

        if (this.frmUser.controls['password'].value != this.frmUser.controls['confirmPassword'].value) {
            this.frmUser.controls['confirmPassword'].setErrors({ password: true });
        }
        if (this.frmUser.controls['accountType'].value == 3 && (!this.frmUser.controls['healthFacilitiesName'].value || (this.frmUser.controls['healthFacilitiesName'].value && !this.frmUser.controls['healthFacilitiesName'].value.trim()))) {
            this.frmUser.controls['healthFacilitiesName'].setErrors({ required: true });
        }

        if (this.frmUser.invalid) {
            for (let key in this.frmUser.controls) {
                if (this.frmUser.controls[key] && this.frmUser.controls[key].errors) {
                    this.frmUser.controls[key].markAsTouched();
                    this.frmUser.controls[key].markAsDirty();
                }
            }

            return;
        }

        if (this.frmUser.controls['codeCapcha'].value != this._capcha.code) { 
            this.capcha = true;
            return; 
        }

        this._dataService.create('Register', this.frmUser.value).subscribe(
            () => {
                swal({
                    title: '<u>Đăng ký mở tài khoản thành công !</u>',
                    html: "<b>Họ và tên:</b> " + this.frmUser.controls['fullName'].value + "<br>" + "<b>Số điện thoai:</b> " + this.frmUser.controls['phoneNumber'].value + "<br>" + "<b>Email:</b> " + this.frmUser.controls['email'].value,
                    type: 'success',
                    confirmButtonClass: 'mat-raised-button mat-primary bg-danger',
                    width: 500,
                    buttonsStyling: false
                });
                this._location.back();
            }, err => console.log(err))
    }

    ruleRequire(value: any) {
        if (value && !value.trim()) {
            this.frmUser.controls['healthFacilitiesName'].setErrors({ required: true });
        }
    }

    rulePhoneNumber(event: any) {
        const patternNum = /^[0-9]*$/;

        if (event.target.value && event.target.value.length > 1 && !patternNum.test(event.target.value.trim().substring(1))) {
            this.frmUser.controls['phoneNumber'].setErrors({ special: true });
        }
    }

    ruleEmail(event: any) {
        const pattern = /^[a-zA-Z0-9\.\-\_\@]*$/;
        if (!pattern.test(event.target.value)) {
            event.target.value = event.target.value.replace(/[^a-zA-Z0-9\.\-\_\@]/g, "");
        }
    }

    getCapcha() {
        this._dataService.getAny('get-captcha-image').subscribe(res => this._capcha = { code: res.code, data: this._sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + res.data) });
    }

    cleanControl(listControl) {
        if (this.frmUser) {
            listControl.forEach(el => {
                this.frmUser.controls[el].setValue(null);
            })
        }
    }
}
