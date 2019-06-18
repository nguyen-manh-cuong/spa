import * as _ from 'lodash';
import * as moment from 'moment';

import { Component, Inject, Injector, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IGroup, IUser } from '@shared/Interfaces';
import { MAT_DIALOG_DATA, MatDialogRef, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, MatTableDataSource, MatPaginator } from '@angular/material';
import { identity, pickBy } from 'lodash';

import { AppComponentBase } from '@shared/app-component-base';
import { CreateUserDto } from '@shared/service-proxies/service-proxies';
import { DataService } from '@shared/service-proxies/service-data';
import { SelectionModel } from '@angular/cdk/collections';
import { ValidationRule } from '@shared/common/common';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import swal from 'sweetalert2';

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
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
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

    _user: IUser | CreateUserDto;
    _groups: Array<IGroup>;
    _selection = new SelectionModel<IGroup>(true, []);

    healthFacilityArr = [];

    _context: any;
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
    _years = _.range(moment().year() - 100, moment().year());
    _invaliBirthday = false;

    flagShowLoadFileCMND: boolean = true;
    flagShowLoadFileGPHN: number = 0;

    keyWorkFind: string = '';
    lblGPHN: string = 'Số thẻ bảo hiểm y tế';

    arrayIdCard = [];
    arrayCertificate = [];

    _idCardError = '';
    _certificateError = '';

    _idCardUrls: Array<{ url: string, file: any, path: string, name: string }> = [];
    _certificateUrls: Array<{ url: string, file: any, path: string, name: string }> = [];

    _idCardUrlsUpdate: Array<{ url: string, file: any, path: string, name: string }> = [];
    _certificateUrlsUpdate: Array<{ url: string, file: any, path: string, name: string }> = [];

    usersHeal = [];

    constructor(injector: Injector, private _formBuilder: FormBuilder, private _dataService: DataService, public dialogRef: MatDialogRef<TaskComponent>, @Inject(MAT_DIALOG_DATA) public user: IUser) {
        super(injector);
    }

    ngOnInit() {
        if (this.user) {
            this._user = _.clone(this.user);
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
            this._user = new CreateUserDto();
            this._isNew = true;

            this._user.userName = '';
            this._user.fullName = '';
            this._user.email = '';
            this._user.phoneNumber = '';
            this._user.provinceCode = '';
            this._user.districtCode = '';
            this._user.wardCode = '';
            this._user.address = '';
            this._user.identification = '';
            this._user.certificationCode = '';
            this._user.insurrance = '';
            this._user.lisenceCode = '';
            this._user.accountType = 1;
        }

        this._context = {
            userId: [this._user.userId],
            userName: [this._user.userName, [Validators.required, this.validateRule.hasValue]],
            password: ['', [Validators.required, this.validateRule.passwordStrong]],
            fullName: [this._user.fullName, [Validators.required, this.validateRule.hasValue]],
            email: [this._user.email, this.validateRule.email],
            phoneNumber: [this._user.phoneNumber, this.validateRule.topPhoneNumber],
            provinceCode: [this._user.provinceCode],
            districtCode: [this._user.districtCode],
            wardCode: [this._user.wardCode],
            address: [this._user.address],
            sex: [1, Validators.required],
            accountType: [this._user.accountType, Validators.required],
            birthDay: [this._user.birthDay],
            cmnd: [],
            gp: [],
            _birthDay: [1],
            _birthMonth: [1],
            _birthYear: [moment().year() - 100],
            code: [],
            groupUser: [],
            identification: [this._user.identification, [this.validateRule.identification, Validators.required]],
            certificationCode: [this._user.certificationCode],
            insurrance: [this._user.insurrance],
            lisenceCode: [this._user.lisenceCode],
            createUserId: [this.appSession.userId],
            updateUserId: [this.appSession.userId],
            healthId: [],
            imageFileOld: []
        };

        this.frmUser = this._formBuilder.group(this._context);
        this._dataService.getAll('groups').subscribe(resp => {
            this._groups = resp.items;
            if (_.has(this.user, 'groups') && this.user.groups.length > 0) { _.intersectionBy(this._groups, this.user.groups, 'groupId').forEach(g => this._selection.select(g)); }
        });

        this._dataService.getAll('provinces').subscribe(resp => this._provinces = resp.items);

        this.checkShowPathFile(this._user.accountType);
    }

    checkShowPathFile(value) {
        if (1 === value) {
            this.flagShowLoadFileCMND = true;
            this.flagShowLoadFileGPHN = 0;
        }
        else if (2 === value) {
            this.flagShowLoadFileCMND = true;
            this.flagShowLoadFileGPHN = 1;
        }
        else {
            this.flagShowLoadFileCMND = false;
            this.flagShowLoadFileGPHN = 2;
            this.getHealthFacilities();
            this._checked = -1;
            this.frmUser.controls['identification'].setErrors(null);
        }
    }

    masterToggle() {
        this.isAllSelected() ?
            this._selection.clear() :
            this._groups.forEach((row: IGroup) => this._selection.select(row));
    }

    isAllSelected() {
        const numSelected = this._selection.selected.length;
        const numRows = this._groups.length;
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
        this.frmUser.controls['groupUser'].setValue(this._selection.selected);
        
        
        let date = moment((day + '/' + month + '/' + this.frmUser.controls['_birthYear'].value), "DD/MM/YYYY");

        this.frmUser.controls['birthDay'].setValue((this.frmUser.controls['_birthYear'].value + '/' + month + '/' + day));
        this.frmUser.controls['healthId'].setValue(this._healths);
        console.log(12, this.frmUser.value);
        if (this._isNew) {
            this._dataService.createUser('users-register', this.frmUser.value).subscribe(() => {
                swal({
                    title: 'Thêm mới thành công',
                    text: ``,
                    type: 'success',
                    timer: 3000
                });
                this.dialogRef.close();
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
                swal({
                    title: 'Cập nhật thành công',
                    text: ``,
                    type: 'success',
                    timer: 3000
                });
                this.dialogRef.close();
            }, err => { });
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
                    return swal({
                        title: 'Thông báo',
                        text: `'File ${file.name} vượt quá 5MB`,
                        type: 'warning',
                        timer: 3000
                    });
                }

                if (fileFormat.indexOf(file.type.toString()) === -1) {
                    return swal({
                        title: 'Thông báo',
                        text: `'File ${file.name} không đúng định dạng`,
                        type: 'warning',
                        timer: 3000
                    });
                }

                if (file.type == 'image/jpeg' || file.type == 'image/png' || 'image/jpg') {
                    if (type == 'idCard') {
                        reader.onload = (e: any) => {
                            this._idCardUrls.push({ url: "/assets/images/212328-200.png", file: file, path: this.replace_alias(file.name), name: this.ruleFileName(file.name) });
                        }
                        this.arrayIdCard.push(file);
                    }

                    if (type == 'certificate') {
                        reader.onload = (e: any) => {
                            this._certificateUrls.push({ url: "/assets/images/212328-200.png", file: file, path: this.replace_alias(file.name), name: this.ruleFileName(file.name) });
                        }
                        this.arrayCertificate.push(file);
                    }

                }
                else if (file.type == 'application/pdf') {
                    if (type == 'idCard') {
                        reader.onload = (e: any) => {
                            this._idCardUrls.push({ url: "/assets/images/24-512.png", file: file, path: this.replace_alias(file.name), name: this.ruleFileName(file.name) });
                        }
                        this.arrayIdCard.push(file);
                    }
                    else if (type == 'certificate') {
                        reader.onload = (e: any) => {
                            this._certificateUrls.push({ url: "/assets/images/24-512.png", file: file, path: this.replace_alias(file.name), name: this.ruleFileName(file.name) });
                        };
                        this.arrayCertificate.push(file);
                    }
                }
                else {
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

    removeFile(i: number, type: number) {
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
    }

    onRemoveFile(i: number, type: number) {
        if (type == 1) {
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

    rulePhoneNumber(event: any) {
        const patternNum = /^[0-9]*$/;

        if (event.target.value && event.target.value.length > 1 && !patternNum.test(event.target.value.trim().substring(1))) {
            this.frmUser.controls['phoneNumber'].setErrors({ special: true });
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
        }
    }

    getHealthFacilities() {
        this._dataService.get('healthfacility', JSON.stringify({ 'keywork': this.keyWorkFind }), '', this.paginator.pageIndex, this.paginator.pageSize).subscribe(resp => {
            this.dataSource.data = resp.items;
            this.totalItems = resp.totalCount;
        });
    }

    _checked = -1;
    _healths = [];
    getHealth(health: any, event: any) {
       
        if (event.checked) {
            this._checked = health.code;
            if (this.flagShowLoadFileGPHN == 2) {
                this._healths = [];
            }
            this._healths.push(health);
        } else {
            this._checked = -1;
            this._healths.splice(this._healths.indexOf(health), 1);
        }
    }

    onHandleSearch() {
        this.paginator.pageIndex = 0;
        this.nameHealthFacilities.nativeElement.value ? this.keyWorkFind = this.nameHealthFacilities.nativeElement.value : this.keyWorkFind = '';

        this._dataService.get('healthfacility', JSON.stringify({ 'keywork': this.keyWorkFind }), '', this.paginator.pageIndex, this.paginator.pageSize).subscribe(resp => {
            this.dataSource.data = resp.items;
            this.totalItems = resp.totalCount;
        });
    }

    ngAfterViewInit(): void {
        
        this._dataService.get('healthfacility','', '', this.paginator.pageIndex, this.paginator.pageSize).subscribe(resp => {
            this.dataSource.data = resp.items;
            let length = resp.items.length;
            for (let item of this.dataSource.data) {
                
            }
            this.totalItems = resp.totalCount;
        });
    }
}
