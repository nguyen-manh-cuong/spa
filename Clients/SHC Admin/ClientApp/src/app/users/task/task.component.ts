import * as _ from 'lodash';
import * as moment from 'moment';

import { Component, Inject, Injector, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IGroup, IUser } from '@shared/Interfaces';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { identity, pickBy } from 'lodash';

import { AppComponentBase } from '@shared/app-component-base';
import { CreateUserDto } from '@shared/service-proxies/service-proxies';
import { DataService } from '@shared/service-proxies/service-data';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
    selector: 'app-task',
    templateUrl: './task.component.html',
    styleUrls: ['./task.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class TaskComponent extends AppComponentBase implements OnInit {

    frmUser: FormGroup;

    _hideDoctor = true;
    _hideMember = true;
    _hideMF = true;
    _hidePatient = true;
    _hideSpecialist = true;

    _user: IUser | CreateUserDto;
    _groups: Array<IGroup>;
    _selection = new SelectionModel<IGroup>(true, []);

    _context: any;
    _isNew: boolean = false;
    _countriesCtrl = new FormControl();
    _filteredCountries: any;

    _provinces: any = [];
    _districts: any = [];
    _wards: any = [];
    _specialist: any = [];

    _sexTypes = [{ id: 1, name: 'Nam' }, { id: 2, name: 'Nữ' }, { id: 3, name: 'Không xác định' }];
    _accountTypes = [{ id: 1, name: 'Thành viên' }, { id: 2, name: 'Người bệnh' }, { id: 3, name: 'Bác sĩ / Chuyên gia / Điều dưỡng' }, { id: 4, name: 'Cơ sở y tế / Doanh nghiệp' }];

    constructor(injector: Injector, private _formBuilder: FormBuilder, private _dataService: DataService, public dialogRef: MatDialogRef<TaskComponent>, @Inject(MAT_DIALOG_DATA) public user: IUser) {
        super(injector);
    }

    ngOnInit() {
        if (this.user) {
            this._user = _.clone(this.user);
            this._isNew = false;

            if (_.has(this.user, 'provinceCode') && !_.isNull(this.user.provinceCode)) {
                this._dataService.get('districts', JSON.stringify({ ProvinceCode: this.user.provinceCode }), '', 0, 0).subscribe(resp => this._districts = resp.items);
            }

            if (_.has(this.user, 'districtCode') && !_.isNull(this.user.districtCode)) {
                this._dataService.get('wards', JSON.stringify({ DistrictCode: this.user.districtCode }), '', 0, 0).subscribe(resp => this._wards = resp.items);
            }

            this.onChangeAccountType(this.user.accountType);
        } else {
            this._user = new CreateUserDto();
            this._isNew = true;
        }

        this._context = {
            userName: [this._user.userName, Validators.required],
            password: [''],
            fullName: [this._user.fullName, Validators.required],
            email: [this._user.email, [Validators.required, Validators.email]],
            phoneNumber: [this._user.phoneNumber],
            provinceCode: [this._user.provinceCode],
            districtCode: [this._user.districtCode],
            wardCode: [this._user.wardCode],
            address: [this._user.address, Validators.required],
            sex: [this._user.sex, Validators.required],
            accountType: [this._user.accountType, Validators.required],
            birthDay: [this._user.birthDay],

            medicalCode: [this._user.medicalCode],
            medicalCodeRelatives: [this._user.medicalCodeRelatives],
            identification: [this._user.identification],
            insurrance: [this._user.insurrance],
            workPlace: [this._user.workPlace],
            healthFacilitiesName: [this._user.healthFacilitiesName],
            specialist: [this._user.specialist]
        };

        this.frmUser = this._formBuilder.group(this._context);
        this._dataService.getAll('groups').subscribe(resp => {
            this._groups = resp.items;
            if (_.has(this.user, 'groups') && this.user.groups.length > 0) { _.intersectionBy(this._groups, this.user.groups, 'id').forEach(g => this._selection.select(g)); }
        });

        this._dataService.getAll('provinces').subscribe(resp => this._provinces = resp.items);
        this._dataService.getAll('category-common-all', 'CHUYENKHOA').subscribe(resp => this._specialist = resp.items);
        if (this.user) this.frmUser.controls['specialist'].setValue(Number(this.user.specialist));
        this.frmUser.controls['sex'].setValue(1);
    }

    onChangeAccountType(value){
        switch(value){
            case 1:
                this._hidePatient = true;
                this._hideDoctor = true;
                this._hideMember = false;
                this._hideMF = true;
                this._hideSpecialist = true;
                this.cleanControl(['medicalCode', 'medicalCodeRelatives', 'workPlace', 'healthFacilitiesName', 'specialist']);
                break;
            case 2:
                this._hidePatient = false;
                this._hideDoctor = true;
                this._hideMember = false;
                this._hideMF = true;
                this._hideSpecialist = true;
                this.cleanControl(['workPlace', 'healthFacilitiesName', 'specialist']);
                break;
            case 3:
                this._hidePatient = true;
                this._hideDoctor = false;
                this._hideMember = true;
                this._hideMF = true;
                this._hideSpecialist = false;
                this.frmUser ? this.frmUser.controls['specialist'].setErrors({required: true}) : "";
                this.cleanControl(['medicalCode', 'medicalCodeRelatives', 'identification', 'insurrance', 'healthFacilitiesName']);
                break;
            case 4:
                this._hidePatient = true;
                this._hideDoctor = true;
                this._hideMember = true;
                this._hideMF = false;
                this._hideSpecialist = false;
                this.cleanControl(['medicalCode', 'medicalCodeRelatives', 'identification', 'insurrance', 'workPlace' ]);
                break;
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
        if (province) { this._dataService.get('districts', JSON.stringify({ ProvinceCode: province.provinceCode }), '', 0, 0).subscribe(resp => this._districts = resp.items); }
    }

    onSelectDistrict(obj: any) {
        this._wards = [];
        this.frmUser.patchValue({ wardCode: null });
        const district = this._districts.find((o: { districtCode: string, name: string; }) => o.districtCode === obj);
        if (district) { this._dataService.get('wards', JSON.stringify({ DistrictCode: district.districtCode }), '', 0, 0).subscribe(resp => this._wards = resp.items); }
    }

    submit() {
        const _birthDay = this.frmUser.value.birthDay ? { birthDay: moment(this.frmUser.value.birthDay).format('YYYY-MM-DDT17:00:00') } : {};
        
        this._isNew ?
            this._dataService.create('users', pickBy(Object.assign(this.frmUser.value, { groups: this._selection.selected }, _birthDay), identity)).subscribe(() => {
                this.dialogRef.close();
            }, err => console.log(err)) :
            this._dataService.update('users', pickBy(Object.assign(this.frmUser.value, { id: this.user.id, groups: this._selection.selected }, _birthDay), identity)).subscribe(() => {
                this.dialogRef.close();
            }, err => console.log(err));
    }

    cleanControl(listControl) {
        if(this.frmUser){
            listControl.forEach(el => {           
                this.frmUser.controls[el].setValue(null);
            })
        }   
    }
}
