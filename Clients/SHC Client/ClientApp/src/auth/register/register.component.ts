import { IUsersServices } from '@shared/Interfaces';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DataService } from '@shared/service-proxies/service-data';
import { CreateUserDto } from '@shared/service-proxies/service-proxies';
import { ValidationRule } from '@shared/common/common';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Location } from '@angular/common';
import * as _ from 'lodash';
import * as moment from 'moment';
import swal from 'sweetalert2';
import { FileValidator } from 'ngx-material-file-input';

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
    _idCardError = "";
    _certificateError = "";

    _dates = _.range(1, 32);
    _months = _.range(1, 13);
    _years = _.range(moment().year() - 100, moment().year());

    _specialist: any = [];
    _context: any;
    _idCardUrls: Array<{ url: string, name: string }>;
    _certificateUrls: Array<{ url: string, name: string }>;
    _user: CreateUserDto;
    _invaliBirthday = false;

    _capcha: { code: string, data: any } = { code: '', data: '' };
    _sex: Array<{ id: number, name: string }> = [{ id: 1, name: 'Nam' }, { id: 2, name: 'Nữ' }, { id: 3, name: 'Không xác định' }];
    _obj: IUsersServices | any = { isUsingdoctor: '', isUsingCall: '', isUsingUpload: '', isUsingRegister: '', isUsingVideo: '', isUsingExamination: '' };
    capcha = false;

    @ViewChild("fullName") fullName: ElementRef;
    @ViewChild("imageData") imageData: ElementRef;

    constructor(private _sanitizer: DomSanitizer, private _dataService: DataService, private _formBuilder: FormBuilder, private _location: Location, ) { }

    ngOnInit() {
        this._user = new CreateUserDto();
        this._idCardUrls = [];
        this._certificateUrls = [];
        // if (this.obj) {
        //     this._obj = _.clone(this.obj);
        //   }
        this._context = {
            userName: [this._user.userName, [Validators.required, this.validateRule.hasValue]],
            password: ['', [Validators.required, this.validateRule.passwordStrong]],
            confirmPassword: ['', Validators.required],
            fullName: [this._user.fullName, [Validators.required, this.validateRule.hasValue]],
            email: [this._user.email, [Validators.required, this.validateRule.hasValue, this.validateRule.email]],
            phoneNumber: [this._user.phoneNumber, [Validators.required, this.validateRule.hasValue, this.validateRule.topPhoneNumber]],
            provinceCode: [this._user.provinceCode ? this._user.provinceCode : '' ],
            districtCode: [this._user.districtCode ? this._user.districtCode : ''],
            wardCode: [this._user.wardCode ? this._user.wardCode : ''],
            address: [this._user.address ? this._user.address : ''],
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
            cmnd: [null],
            gp: [null],
            isUsingdoctor: [this._obj.isUsingdoctor],
            isUsingCall: [this._obj.isUsingCall],
            isUsingUpload: [this._obj.isUsingUpload],
            isUsingRegister: [this._obj.isUsingRegister],
            isUsingVideo: [this._obj.isUsingVideo],
            isUsingExamination: [this._obj.isUsingExamination],
            rules: [false]
        };

        this.frmUser = this._formBuilder.group(this._context);
        this._dataService.getAll('provinces').subscribe(resp => this._provinces = resp.items);
        this._dataService.getAll('categorycommon', 'CHUYENKHOA').subscribe(resp => this._specialist = resp.items);
        this.fullName.nativeElement.focus();

        this.getCapcha();
    }

    onSelectBirthDay(obj: any) {
        this.checkBirthDate();
    }

    onSelectBirthMonth(obj: any) {
        this.checkBirthDate();
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
        this.frmUser.patchValue({ districtCode: '', wardCode: '' });
        const province = this._provinces.find((o: { provinceCode: string, name: string; }) => o.provinceCode === idProvince);
        if (province) { this._dataService.get('districts', JSON.stringify({ ProvinceCode: province.provinceCode }), '', 0, 0).subscribe(resp => this._districts = resp.items); }
    }

    onSelectDistrict(obj: any) {
        var idDistrict = obj.target.value.split(":")[1].trim();

        this._wards = [];
        this.frmUser.patchValue({ wardCode: '' });
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
       
        if (this.frmUser.controls['accountType'].value == 1 || this.frmUser.controls['accountType'].value == 2) {
            if (this.frmUser.controls['cmnd'].value == null || this.frmUser.controls['gp'].value == null) {
                return swal({
                    title: 'Thông báo',
                    text: 'Bạn phải cung cấp giấy tờ xác thực',
                    type: 'warning',
                    timer: 3000
                });
            }

            else if (this.frmUser.controls['cmnd'].value.files != null || this.frmUser.controls['gp'].value.files != null) {
                if (this.frmUser.controls['cmnd'].value.files.length == 0 || this.frmUser.controls['gp'].value.files.length == 0) {
                    return swal({
                        title: 'Thông báo',
                        text: 'Bạn phải cung cấp giấy tờ xác thực',
                        type: 'warning',
                        timer: 3000
                    });
                }
            }
        }

        if (this.frmUser.controls['accountType'].value != 1) {
            if (!this.frmUser.controls['isUsingdoctor'].value &&
                !this.frmUser.controls['isUsingCall'].value &&
                !this.frmUser.controls['isUsingUpload'].value &&
                !this.frmUser.controls['isUsingRegister'].value &&
                !this.frmUser.controls['isUsingVideo'].value &&
                !this.frmUser.controls['isUsingExamination'].value) {
                return swal({
                    title: 'Thông báo',
                    text: 'Bạn phải chọn ít nhất một dịch vụ',
                    type: 'warning',
                    timer: 3000
                });
            }
        }


        if (this._invaliBirthday) return;

        if (this.frmUser.controls['codeCapcha'].value != this._capcha.code) {
            this.capcha = true;
            return;
        }

        this._dataService.createUpload('Register', this.frmUser.value).subscribe(
            () => {
                swal({
                    title: '<u>Đăng ký mở tài khoản thành công !</u>',
                    html: "<b>Họ và tên:</b> " + this.frmUser.controls['fullName'].value + "<br>" + "<b>Số điện thoai:</b> " + this.frmUser.controls['phoneNumber'].value + "<br>" + "<b>Email:</b> " + this.frmUser.controls['email'].value,
                    type: 'success',
                    confirmButtonClass: 'mat-raised-button mat-primary bg-danger',
                    width: 500,
                    buttonsStyling: false,
                    timer: 3000
                }).then((result) => {
                    //if (result.value) {
                    //this._location.back();
                    //}
                    this._location.back();
                });
            }, err => console.log('err: ' + err))
    }

    //validate  
    checkBirthDate() {
        if (!moment($('#birthD').val() + '/' + $('#birthM').val() + '/' + $('#birthY').val(), "DD/MM/YYYY").isValid()) {
            this._invaliBirthday = true;
        } else {
            this._invaliBirthday = false;
        }
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

    removeFile(i: number, type: number) {
        console.log(i);
        if (type == 1) {
            this.arrayIdCard.splice(i, 1);
            this._idCardUrls.splice(i, 1);
            this.frmUser.controls['cmnd'].setValue({ files: this.arrayIdCard });
        }
        else {
            this._certificateUrls.splice(i, 1);
            this.arrayCertificate.splice(i, 1);
            this.frmUser.controls['gp'].setValue({ files: this.arrayCertificate });
        }
        
        //for (var i = 0; i < this._idCardUrls.length; i++) {
        //    if (storedFiles[i].name === file) {
        //        storedFiles.splice(i, 1);
        //        break;
        //    }
        //}
    }

    arrayIdCard = [];
    arrayCertificate = [];
    detectFiles(event, type) {
        let files = event.target.files;
        if (files) {
            for (let file of files) {
                let reader = new FileReader();
                reader.readAsDataURL(file);
                console.log(file.size);
                if (file.size > 5242880) {
                    return swal({
                        title: 'Thông báo',
                        text: `'File ${file.name} vượt quá 5MB`,
                        type: 'warning'
                    });
                }
                if (file.type == 'image/jpeg' || file.type == 'image/png') {
                    if (type == 'idCard') {
                        reader.onload = (e: any) => {
                            this._idCardUrls.push({ url: "/assets/images/212328-200.png", name: file });
                        }
                        this.arrayIdCard.push(file);
                    }

                    if (type == 'certificate') {
                        reader.onload = (e: any) => {
                            this._certificateUrls.push({ url: "/assets/images/212328-200.png", name: file });
                        }
                        this.arrayCertificate.push(file);
                    }

                }
                if (file.type == 'application/pdf') {
                    if (type == 'idCard') {
                        reader.onload = (e: any) => {
                            this._idCardUrls.push({ url: "/assets/images/24-512.png", name: file });
                        }
                        this.arrayIdCard.push(file);
                    }

                    if (type == 'certificate') {
                        reader.onload = (e: any) => {
                            this._certificateUrls.push({ url: "/assets/images/24-512.png", name: file });
                        }
                        this.arrayCertificate.push(file);
                    }
                } else {
                    if (type == 'idCard') {
                        this._idCardError = "File tải lên không phải file ảnh và pdf";
                    }
                    if (type == 'certificate') {
                        this._certificateError = "File tải lên không phải file ảnh và pdf";
                    }
                }
            }

            this.frmUser.controls['cmnd'].setValue({ files: this.arrayIdCard });
            this.frmUser.controls['gp'].setValue({ files: this.arrayCertificate });
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

    validateCapcha(value: any){
        if(value.length == 4) this._capcha.code != value ? this.capcha = true : this.capcha = false;
    }

    cleanControl(listControl) {
        if (this.frmUser) {
            listControl.forEach(el => {
                this.frmUser.controls[el].setValue(null);
            })
        }
    }
}
