import * as _ from 'lodash';
import * as moment from 'moment';

import { Component, Inject, Injector, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IGroup, IUser } from '@shared/Interfaces';
import { MAT_DIALOG_DATA, MatDialogRef, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, MatTableDataSource, MatPaginator } from '@angular/material';
import { AppComponentBase } from '@shared/app-component-base';
import { CreateUserDto } from '@shared/service-proxies/service-proxies';
import { DataService } from '@shared/service-proxies/service-data';
import { SelectionModel } from '@angular/cdk/collections';
import { ValidationRule } from '@shared/common/common';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { cleanUnicode } from '../../../shared/helpers/utils';
import { RootModule } from '../../../root.module';

export const MY_FORMATS = {
    parse: {
        dateInput: 'DD/MM/YYYY',
    },
    display: {
        dateInput: 'DD/MM/YYYY',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};

@Component({
    selector: 'app-task',
    templateUrl: './task.component.html',
    styleUrls: ['./task.component.scss'],
    providers: [
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
    ],
    encapsulation: ViewEncapsulation.None
})
export class TaskComponent extends AppComponentBase implements OnInit {
    public pageSize: number = 5;
    public pageNumber: number = 1;
    public pageSizeOptions: Array<number> = [5, 10, 20, 50];
    public totalItems: number;

    displayedColumns = ['colSelect', 'colHel'];
    dataSource = new MatTableDataSource();

    @ViewChild('paginator') paginator: MatPaginator;
    @ViewChild('nameHealthFacilities') nameHealthFacilities;

    validateRule = new ValidationRule();
    frmUser: FormGroup;

    userDto: IUser | CreateUserDto;
    groups: Array<IGroup>;
    _selection = new SelectionModel<IGroup>(true, []);

    healthFacilityArr = [];
    _healthCodes = [];

    context: any;
    _isNew: boolean = false;

    _countriesCtrl = new FormControl();
    _filteredCountries: any;

    _provinces: any = [];
    _districts: any = [];
    _wards: any = [];

    _sexTypes = [{ id: 1, name: 'Nam' }, { id: 2, name: 'Nữ' }, { id: 3, name: 'Không xác định' }];
    _accountTypes = [{ id: 1, name: 'Thành viên' }, { id: 2, name: 'Bác sỹ/ Chuyên gia/ Điều dưỡng...' }, { id: 3, name: 'Cơ sở y tế/ doanh nghiệp' }];

    _dates = _.range(1, 32);
    _months = _.range(1, 13);
    _years = _.range(moment().year() - 100, moment().year() + 1);
    _invaliBirthday = false;
    invalidBirth: boolean = false;

    flagShowLoadFileCmnd: boolean = true;
    flagShowLoadFileGphn: number = 0;

    keyWorkFind: string = '';

    arrayIdCard = [];
    arrayCertificate = [];

    _idCardError = '';
    _certificateError = '';

    _idCardUrls: Array<{ url: string, file: any, path: string, name: string }> = [];
    _certificateUrls: Array<{ url: string, file: any, path: string, name: string }> = [];

    _idCardUrlsUpdate: Array<{ url: string, file: any, path: string, name: string }> = [];
    _certificateUrlsUpdate: Array<{ url: string, file: any, path: string, name: string }> = [];

    usersHeal = [];
    highlight: boolean = false;

    @ViewChild('email') email;

    highLightEmail: boolean = false;
    highLightPhone: boolean = false;
    highLightIdentification: boolean = false;
    highLightCertification: boolean = false;
    highLightInsurrance: boolean = false;
    highLightLisence: boolean = false;

    constructor(injector: Injector, private _formBuilder: FormBuilder, private _dataService: DataService, public dialogRef: MatDialogRef<TaskComponent>, @Inject(MAT_DIALOG_DATA) public user: IUser) {
        super(injector);
    }

    ngOnInit() {
        if (this.user) {
            this.userDto = _.clone(this.user);
            this._isNew = false;

            if (_.has(this.user, 'provinceCode') && !_.isNull(this.user.provinceCode)) {
                this._dataService.get('districts', JSON.stringify({ ProvinceCode: this.user.provinceCode }), '', 0, 100).subscribe(resp => this._districts = resp.items);
            }

            if (_.has(this.user, 'districtCode') && !_.isNull(this.user.districtCode)) {
                this._dataService.get('wards', JSON.stringify({ DistrictCode: this.user.districtCode }), '', 0, 100).subscribe(resp => this._wards = resp.items);
            }

            
            this._dataService.get('users-attach', JSON.stringify({ 'userId': this.user.userId }), null, null, null).subscribe(resp => {
                let imageArr = resp.items;
                for (let item of imageArr) {
                    if (item.type === '1') {
                        this._idCardUrlsUpdate.push(item);
                    }
                    else {
                        this._certificateUrlsUpdate.push(item);
                    }
                }
            });

            this._dataService.get('health', JSON.stringify({ 'userId': this.user.userId }), null, null, null).subscribe(resp => {
                let length = resp.items.length;
                for (let i = 0; i < length; i++) {
                    this.usersHeal.push(resp.items[i].healthFacilitiesId);
                }
            });
        }
        else {
            this.userDto = new CreateUserDto();
            this._isNew = true;

            this.userDto.userName = '';
            this.userDto.fullName = '';
            this.userDto.email = '';
            this.userDto.phoneNumber = '';
            this.userDto.provinceCode = '';
            this.userDto.districtCode = '';
            this.userDto.wardCode = '';
            this.userDto.address = '';
            this.userDto.identification = '';
            this.userDto.certificationCode = '';
            this.userDto.insurrance = '';
            this.userDto.lisenceCode = '';
            this.userDto.accountType = 1;
        }

        this.context = {
            userId: [this.userDto.userId],
            userName: [this.userDto.userName, [Validators.required, this.validateRule.hasValue]],
            password: ['', [this._isNew ? Validators.required : this.validateRule.hasValueNull, this._isNew ? this.validateRule.passwordStrong : this.validateRule.hasValueNull]],
            fullName: [this.userDto.fullName, [Validators.required, this.validateRule.hasValue]],
            email: [this.userDto.email, this.validateRule.email],
            phoneNumber: [this.userDto.phoneNumber, this.validateRule.topPhoneNumber],
            provinceCode: [this.userDto.provinceCode],
            districtCode: [this.userDto.districtCode],
            wardCode: [this.userDto.wardCode],
            address: [this.userDto.address],
            sex: [1, Validators.required],
            accountType: [this.userDto.accountType, Validators.required],
            birthDay: [this.userDto.birthDay],
            cmnd: [],
            gp: [],
            _birthDay: [this.userDto.birthDay ? ((new Date(this.userDto.birthDay)).getDate()) : 1],
            _birthMonth: [this.userDto.birthDay ? ((new Date(this.userDto.birthDay)).getMonth() + 1) : 1],
            _birthYear: [this.userDto.birthDay ? ((new Date(this.userDto.birthDay)).getFullYear()) : (moment().year() - 100)],
            code: [],
            groupUser: [],
            identification: [this.userDto.identification],
            certificationCode: [this.userDto.certificationCode],
            insurrance: [this.userDto.insurrance],
            lisenceCode: [this.userDto.lisenceCode],
            createUserId: [this.appSession.userId],
            updateUserId: [this.appSession.userId],
            healthId: [],
            imageFileOld: []
        };

        this.frmUser = this._formBuilder.group(this.context);
        this._dataService.getAll('groups').subscribe(resp => {
            this.groups = resp.items;
            if (this.user) {
                this._dataService.getAll('groups-userid').subscribe(res => {
                    for (const item of res.items) {
                        for (const it of resp.items) {
                            if (item.groupId === it.groupId && item.applicationId === it.applicationId && item.userId === this.user.userId) {
                                this._selection.select(it);
                            }
                        }
                    }
                });
            }
        });

        this._dataService.getAll('provinces').subscribe(resp => this._provinces = resp.items);

        this.checkShowPathFile(this.userDto.accountType);
       
    }

    // BHYT - Insurrance, CMND - Identification, GPHN - CertificationCode, GPKD - LicenseCode
    checkShowPathFile(value): void {
        
        this.frmUser.setErrors({ invalid: true });
        this.highLightInsurrance = false;
        this.highLightIdentification = false;
        this.highLightLisence = false;
        this.highLightCertification = false;
        this.highLightEmail = false;
        this.highLightPhone = false;

        this.frmUser.controls['certificationCode'].setValue(null);
        this.frmUser.controls['lisenceCode'].setValue(null);
        this.frmUser.controls['insurrance'].setValue(null);
        this.frmUser.controls['identification'].setValue(null);

        this._idCardUrls = [];
        this._certificateUrls = [];

        if (1 === value) {
            this.frmUser.controls['certificationCode'].setErrors(null);
            this.frmUser.controls['lisenceCode'].setErrors(null);

            this.flagShowLoadFileCmnd = true;
            this.flagShowLoadFileGphn = 0;
        }
        else if (2 === value) {
            this.frmUser.controls['insurrance'].setErrors(null);
            this.frmUser.controls['lisenceCode'].setErrors(null);

            this.flagShowLoadFileCmnd = true;
            this.flagShowLoadFileGphn = 1;
        }
        else {
            this.flagShowLoadFileCmnd = false;
            this.flagShowLoadFileGphn = 2;
            this.getHealthFacilities();
            this.checkedHealth = -1;
            this._healths = [];

            this.frmUser.controls['insurrance'].setErrors(null);
            this.frmUser.controls['identification'].setErrors(null);
            this.frmUser.controls['certificationCode'].setErrors(null);
        }
    }

    masterToggle() {
        this.isAllSelected() ?
            this._selection.clear() :
            this.groups.forEach((row: IGroup) => this._selection.select(row));
    }

    isAllSelected() {
        const numSelected = this._selection.selected.length;
        const numRows = this.groups.length;
        return numSelected === numRows;
    }

    onSelectProvince(obj: any) {
        this._districts = this._wards = [];
        this.frmUser.patchValue({ districtCode: null, wardCode: null });
        const province = this._provinces.find((o: { provinceCode: string, name: string; }) => o.provinceCode === obj);
        if (province) { this._dataService.get('districts', JSON.stringify({ ProvinceCode: province.provinceCode }), '', 0, 100).subscribe(resp => this._districts = resp.items); }
    }

    onSelectDistrict(obj: any) {
        this._wards = [];
        this.frmUser.patchValue({ wardCode: null });
        const district = this._districts.find((o: { districtCode: string, name: string; }) => o.districtCode === obj);
        if (district) { this._dataService.get('wards', JSON.stringify({ DistrictCode: district.districtCode }), '', 0, 100).subscribe(resp => this._wards = resp.items); }
    }

    submit() {
        let day = this.frmUser.controls['_birthDay'].value < 10 ? ('0' + this.frmUser.controls['_birthDay'].value) : this.frmUser.controls['_birthDay'].value;
        let month = this.frmUser.controls['_birthMonth'].value < 10 ? ('0' + this.frmUser.controls['_birthMonth'].value) : this.frmUser.controls['_birthMonth'].value;
        this.frmUser.controls['birthDay'].setValue((this.frmUser.controls['_birthYear'].value + '/' + month + '/' + day));

        this.frmUser.controls['healthId'].setValue(this._healths);
        this.frmUser.controls['groupUser'].setValue(this._selection.selected);
        if (1 === this.frmUser.controls['accountType'].value) {
            this.frmUser.controls['certificationCode'].setValue('');
            this.frmUser.controls['lisenceCode'].setValue('');

            if (this._isNew) {
                if (this._idCardUrls.length === 0) {
                    abp.notify.error('Phải tải lên  hình ảnh xác thực – Chứng minh nhân dân / Thẻ căn cước / Hộ chiếu',
                        '',
                        { hideDuration: 3000, preventDuplicates: true, preventOpenDuplicates: true });
                    this.frmUser.setErrors(null);
                    return;
                }

                if (this._certificateUrls.length === 0) {
                    abp.notify.error('Phải tải lên  hình ảnh xác thực - Thẻ BHYT',
                        '',
                        { hideDuration: 3000, preventDuplicates: true, preventOpenDuplicates: true, });
                    this.frmUser.setErrors(null);
                    return;
                }
            } else {
                if (this._idCardUrls.length === 0 && this._idCardUrlsUpdate.length === 0) {
                    abp.notify.error('Phải tải lên  hình ảnh xác thực – Chứng minh nhân dân / Thẻ căn cước / Hộ chiếu',
                        '',
                        { hideDuration: 3000, preventDuplicates: true, preventOpenDuplicates: true });
                    this.frmUser.setErrors(null);
                    return;
                }

                if (this._certificateUrls.length === 0 && this._certificateUrlsUpdate.length === 0) {
                    abp.notify.error('Phải tải lên  hình ảnh xác thực - Thẻ BHYT',
                        '',
                        { hideDuration: 3000, preventDuplicates: true, preventOpenDuplicates: true, });
                    this.frmUser.setErrors(null);
                    return;
                }
            }
        }
        else if (2 === this.frmUser.controls['accountType'].value) {
            this.frmUser.controls['insurrance'].setValue('');
            this.frmUser.controls['lisenceCode'].setValue('');

            if (this._isNew) {
                if (this._idCardUrls.length === 0) {
                    abp.notify.error('Phải tải lên  hình ảnh xác thực – Chứng minh nhân dân / Thẻ căn cước / Hộ chiếu',
                        '',
                        { hideDuration: 3000, preventDuplicates: true, preventOpenDuplicates: true });
                    this.frmUser.setErrors({ invalid: false });
                    return;
                }

                if (this._certificateUrls.length === 0) {
                    abp.notify.error('Phải tải lên  hình ảnh xác thực - Giấy phép hành nghề',
                        '',
                        { hideDuration: 3000, preventDuplicates: true, preventOpenDuplicates: true, return: false });
                    this.frmUser.setErrors({ invalid: false });
                    return;
                }
            } else {
                if (this._idCardUrls.length === 0 && this._idCardUrlsUpdate.length === 0) {
                    abp.notify.error('Phải tải lên  hình ảnh xác thực – Chứng minh nhân dân / Thẻ căn cước / Hộ chiếu', '', { hideDuration: 3000, preventDuplicates: true, preventOpenDuplicates: true });
                    this.frmUser.setErrors({ invalid: false });
                    return;
                }


                if (this._certificateUrls.length === 0 && this._certificateUrlsUpdate.length === 0) {
                    abp.notify.error('Phải tải lên  hình ảnh xác thực - Giấy phép hành nghề', '', { hideDuration: 3000, preventDuplicates: true, preventOpenDuplicates: true, return: false });
                    this.frmUser.setErrors({ invalid: false });
                    return;
                }
            }
        }
        else {
            this.frmUser.controls['identification'].setValue('');
            this.frmUser.controls['certificationCode'].setValue('');
            this.frmUser.controls['insurrance'].setValue('');

            
            if (this._isNew) {
                if (this._certificateUrls.length === 0) {
                    abp.notify.error('Phải tải lên  hình ảnh xác thực - Giấy phép kinh doanh',
                        '',
                        { hideDuration: 3000, preventDuplicates: true, preventOpenDuplicates: true });
                    this.frmUser.setErrors({ invalid: false });
                    return;
                }
            } else {
                if (this._certificateUrls.length === 0 && this._certificateUrlsUpdate.length === 0) {
                    abp.notify.error('Phải tải lên  hình ảnh xác thực - Giấy phép kinh doanh', '', { hideDuration: 3000, preventDuplicates: true, preventOpenDuplicates: true });
                    this.frmUser.setErrors({ invalid: false });
                    return;
                }
            }
        }


        if (this._isNew) {

            this._dataService.createUser('users-register', this.frmUser.value).subscribe(() => {
                abp.notify.success('Lưu thành công', '', { hideDuration: 3000, preventDuplicates: true, preventOpenDuplicates: true });
                this.dialogRef.close();
            }, error => {
                    this.getErrorHighLight();
                    
            });
        }
        else {
            let str = '';
            for (let item of this._idCardUrlsUpdate) {
                str += item.path + ',';
            }

            for (let item of this._certificateUrlsUpdate) {
                str += item.path + ',';
            }
            this.frmUser.controls['imageFileOld'].setValue(str);

            this._dataService.updateUser('users-update', this.frmUser.value).subscribe(() => {
                abp.notify.success('Lưu thành công', '', { hideDuration: 3000, preventDuplicates: true, preventOpenDuplicates: true });
                this.dialogRef.close();
            }, err => {
                    this.getErrorHighLight();
                    this.frmUser.setErrors({ invalid: false });
            });
        }
        
    }

    getErrorHighLight() {
        if (RootModule.message === 'Email đã tồn tại!') {
            //this.frmUser.controls['email'].setValue('');
            //this.frmUser.controls['email'].setErrors(null);
            //this.frmUser.setErrors({ invalid: true });

            this.highLightEmail = true;
        } else {
            this.highLightEmail = false;
        }

        if (RootModule.message === 'Số CMND đã tồn tại!') {
            this.highLightIdentification = true;
        } else {
            this.highLightIdentification = false;
        }

        if (RootModule.message === 'Số GPHN đã tồn tại!') {
            this.highLightCertification = true;
        } else {
            this.highLightCertification = false;
        }

        if (RootModule.message === 'Số GPKD đã tồn tại!') {
            this.highLightLisence = true;
        } else {
            this.highLightLisence = false;
        }

        if (RootModule.message === 'Số thẻ BHYT  đã tồn tại!') {
            this.highLightInsurrance = true;
        } else {
            this.highLightInsurrance = false;
        }

        if (RootModule.message === 'Số điện thoại đã tồn tại!') {
            this.highLightPhone = true;
        } else {
            this.highLightPhone = false;
        }
    }

    ruleSpecialCharacter() {
        var control = this.frmUser.controls['userName'];
        const pattern = /^[a-zA-Z0-9]*$/;

        if (control.value && !pattern.test(control.value)) {
            control.setValue(control.value.replace(/[^a-zA-Z0-9]/g, ""));
        }
    }

    onSelectAccountType(value) {
        this.checkShowPathFile(value);
    }

    detectFiles(event, type) {
        let files = event.target.files;
        let fileFormat = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (files) {
            for (let file of files) {
                let reader = new FileReader();
                reader.readAsDataURL(file);
                if (file.size > 5242880) {
                    abp.notify.error(`File ${file.name} vượt quá 5MB`, 'Thông báo', { hideDuration: 3000, preventDuplicates: true, preventOpenDuplicates: true });
                    return;
                }

                if (fileFormat.indexOf(file.type.toString()) === -1) {
                    abp.notify.error(`File ${file.name} không đúng định dạng`, 'Thông báo', { hideDuration: 3000, preventDuplicates: true, preventOpenDuplicates: true });
                    return;
                }

                if (String(file.type) === 'image/jpeg' || String(file.type) === 'image/png' || String(file.type) === 'image/jpg') {
                    if (String(type) === 'idCard') {
                        reader.onload = (e: any) => {
                            this._idCardUrls.push({ url: "/assets/images/212328-200.png", file: file, path: this.replace_alias(file.name), name: file.name });
                        }
                        this.arrayIdCard.push(file);
                    }

                    if (String(type) === 'certificate') {
                        reader.onload = (e: any) => {
                            this._certificateUrls.push({ url: "/assets/images/212328-200.png", file: file, path: this.replace_alias(file.name), name: file.name });
                        }
                        this.arrayCertificate.push(file);
                    }

                }
                else if (String(file.type) === 'application/pdf') {
                    if (String(type) === 'idCard') {
                        reader.onload = (e: any) => {
                            this._idCardUrls.push({ url: "/assets/images/24-512.png", file: file, path: this.replace_alias(file.name), name: file.name });
                        }
                        this.arrayIdCard.push(file);
                    }
                    else if (String(type) === 'certificate') {
                        reader.onload = (e: any) => {
                            this._certificateUrls.push({ url: "/assets/images/24-512.png", file: file, path: this.replace_alias(file.name), name: file.name });
                        };
                        this.arrayCertificate.push(file);
                    }
                }
                else {
                    if (String(type) === 'idCard') {
                        this._idCardError = "File tải lên không phải file ảnh và pdf";
                    }
                    if (String(type) === 'certificate') {
                        this._certificateError = "File tải lên không phải file ảnh và pdf";
                    }
                }
            }

            this.frmUser.controls['cmnd'].setValue({ files: this.arrayIdCard });
            this.frmUser.controls['gp'].setValue({ files: this.arrayCertificate });
        }
    }

    removeFile(i: number, type: number) {
        if (type === 1) {
            this.arrayIdCard.splice(i, 1);
            this._idCardUrls.splice(i, 1);
            this.frmUser.controls['cmnd'].setValue({ files: this.arrayIdCard });
        }
        else {
            this._certificateUrls.splice(i, 1);
            this.arrayCertificate.splice(i, 1);
            this.frmUser.controls['gp'].setValue({ files: this.arrayCertificate });
        }
    }

    onRemoveFile(i: number, type: number) {
        if (type === 1) {
            this._idCardUrlsUpdate.splice(i, 1);
        }
        else {
            this._certificateUrlsUpdate.splice(i, 1);
        }
    }

    onSelectDay() {
        this.checkBirthDate();
    }

    onSelectMonth() {
        this.checkBirthDate();
    }

    onSelectYear() {
        this.checkBirthDate();
    }

    rulePhoneNumber(event: any) {
        const patternNum = /^[0-9]*$/;

        if (event.target.value && event.target.value.length > 1 && !patternNum.test(event.target.value.trim().substring(1))) {
            this.frmUser.controls['phoneNumber'].setErrors({ special: true });
        }
        event.target.value = this.replace_space(this.replace_alias(event.target.value));
        if (event.target.value == '') {
            this.frmUser.controls['phoneNumber'].setErrors({ 'required': true });
        }
    }

    ruleEmail(event: any) {
        const pattern = /^[a-zA-Z0-9\.\-\_\@]*$/;
        var control = this.frmUser.controls['email'];

        if (!pattern.test(event.target.value)) {
            control.setValue(control.value.replace(/[^a-zA-Z0-9\.\-\_\@]/g, ""));
        }
    }

    replace_alias(str) {
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
        str = str.replace(/ /g, "_");
        return str;
    }

    replace_alias_number(str) {
        str = str.replace(/a|e|i|o|u|y|d|A|E|I|O|U|Y|D/g, "");
        return str;
    }

    replace_space(str) {
        str = str.replace(/ /g, "_");
        return str;
    }

    ruleFileName(name) {
        if (name.length > 30) {
            return name.substring(0, 27) + "...";
        } else {
            return name;
        }
    }

    getFileName(name) {
        return name.substring(9);
    }

    checkBirthDate() {
        if (!moment(this.frmUser.controls['_birthDay'].value + '/' + this.frmUser.controls['_birthMonth'].value + '/' + this.frmUser.controls['_birthYear'].value, "DD/MM/YYYY").isValid()) {
            this._invaliBirthday = true;
        }
        else {
            this._invaliBirthday = false;
            const nowYear = (new Date()).getFullYear();
            if (nowYear === parseFloat(this.frmUser.controls['_birthYear'].value)) {
                const nowMonth = (new Date()).getMonth() + 1;
                if (nowMonth < parseFloat(this.frmUser.controls['_birthMonth'].value)) {
                    this.invalidBirth = true;
                    return;
                }
                else if (nowMonth === parseFloat(this.frmUser.controls['_birthMonth'].value)) {
                    const nowDate = (new Date()).getDate();
                    if (nowDate < parseFloat(this.frmUser.controls['_birthDay'].value)) {
                        this.invalidBirth = true;
                        return;
                    }
                }
            }
            this.invalidBirth = false;
        }
    }

    getHealthFacilities() {
        this._dataService.get('health', JSON.stringify({ 'keyWork': this.keyWorkFind, 'userId': this.user ? this.user.userId : '' }), '', this.paginator.pageIndex, this.paginator.pageSize).subscribe(resp => {
            this.dataSource.data = resp.items;
            this.totalItems = resp.totalCount;
        });
    }

    checkedHealth = -1;
    _healths = [];

    getHealth(health: any, event: any) {
        if (event.checked) {
            this.checkedHealth = health.code;
            if (this.flagShowLoadFileGphn === 2) {
                this._healths = [];
                this._healthCodes = [];
            }
            this._healths.push(health);
            this._healthCodes.push(health.code);
        } else {
            this.checkedHealth = -1;
            this._healths.splice(this._healths.indexOf(health), 1);
            this._healthCodes.splice(this._healthCodes.indexOf(health.code),1);
        }
    }

    onHandleSearch() {
        this.paginator.pageIndex = 0;
        this.nameHealthFacilities.nativeElement.value ? this.keyWorkFind = this.nameHealthFacilities.nativeElement.value : this.keyWorkFind = '';

        this._dataService.get('health', JSON.stringify({ 'keyWork': this.keyWorkFind, 'userId': this.user ? this.user.userId : '' }), '', this.paginator.pageIndex, this.paginator.pageSize).subscribe(resp => {
            this.dataSource.data = resp.items;
            this.totalItems = resp.totalCount;
        });
    }

    // Xóa khoảng trắng
    cleanSpace(str) {
        str = str.replace(/ /g, "");
        return str;
    }

    cleanUnicode(str: string): string {
        return str
            .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
            .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
            .replace(/ì|í|ị|ỉ|ĩ/g, 'i')
            .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
            .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
            .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
            .replace(/đ/g, 'd')
            .replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A")
            .replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E")
            .replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I")
            .replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O")
            .replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U")
            .replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y")
            .replace(/Đ/g, "D")
            .replace(/!|@|\$|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\"| |\"|\&|\#|\[|\]|~/g, ' ')
            .replace(/-+-/g, '-')
            .replace(/(\s)+/g, '$1');
    }

    // Xóa khoảng trắng và kí tự unicode
    inputInsurrance(event) {
        event.target.value = this.cleanSpace(this.cleanUnicode(event.target.value));
        this.frmUser.controls['insurrance'].setValue(this.cleanSpace(this.cleanUnicode(event.target.value)));
    }

    identificationInput($event) {
        if ($event.target.value.length > 9 && $event.target.value.length < 12) {
            this.frmUser.controls['identification'].setErrors({ identification:true})
        }
    }

    inputCertificationCode(event) {
        event.target.value = this.cleanSpace(this.cleanUnicode(event.target.value));
        this.frmUser.controls['certificationCode'].setValue(this.cleanSpace(this.cleanUnicode(event.target.value)));
    }

    inputLisenceCode(event) {
        event.target.value = this.cleanSpace(this.cleanUnicode(event.target.value));
        this.frmUser.controls['lisenceCode'].setValue(this.cleanSpace(this.cleanUnicode(event.target.value)));
    }

    ngAfterViewInit(): void {
        if (this.user) {
            this.frmUser.controls['password'].setErrors(null);
        }
        this._dataService.get('health', this.user ?  JSON.stringify({ 'userId': this.user.userId}) : '', '', this.paginator.pageIndex, this.paginator.pageSize).subscribe(resp => {
            this.dataSource.data = resp.items;
            this.totalItems = resp.totalCount;
            for (const item of resp.items) {
                if (this.flagShowLoadFileGphn === 2) {
                    if (item.check) {
                        this.checkedHealth = item.code;
                        this._healths.push(item);
                        break;
                    }
                } else {
                    if (item.check) {
                        this._healths.push(item);
                    }
                }
            }
        });
    }
}
