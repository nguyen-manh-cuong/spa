import { Component, OnInit, Inject, Injector, ViewEncapsulation } from '@angular/core';
import { IMedicalHealthcareHistories } from '../../../shared/Interfaces';
import { DataService } from '../../../shared/service-proxies/service-data';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatTableDataSource } from '@angular/material';
import { ValidationRule } from '../../../shared/common/common';

import * as _ from 'lodash';
import { AppComponentBase } from '../../../shared/app-component-base';
import { PagedListingComponentBase } from '../../../shared/paged-listing-component-base';

@Component({
    selector: 'app-detail',
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DetailComponent extends AppComponentBase implements OnInit {
    public pageSize: number = 20;
    public pageNumber: number = 1;
    public pageSizeOptions: Array<number> = [5, 10, 20, 50];
    public totalItems: number;

    _frm: FormGroup;
    displayedColumns = ['_message', '_sentSmsDate', '_status'];
    _obj: IMedicalHealthcareHistories | any = { code: '', fullName: '', phoneNumber: '', gender: '', birthDate: '', birthMonth: '', birthYear: '', patientId: '', healthInsuranceNumber: '', birthDay: '' };
    _context: any;

    _birthDay: string;
    api = 'smslog';
    dataSource = new MatTableDataSource();
    smsArr = [];

    constructor(
        injector: Injector,
        private _dataService: DataService,
        private _formBuilder: FormBuilder,
        @Inject(MAT_DIALOG_DATA)
        public obj: IMedicalHealthcareHistories) {
        super(injector);
    }

    ngOnInit() {
        if (this.obj) {
            this._obj = _.clone(this.obj);
            this._dataService.getAll(this.api, JSON.stringify({ 'patientId': this._obj.patientId, 'objectType': 1 }), null).subscribe(smsData => {
                for (var item of smsData.items) {
                    let obj = {
                        message: item.message,
                        sentSmsDate: (item.sentDay > 9 ? item.sentDay : ('0' + item.sentDay)) + '/' + (item.sentMonth > 9 ? item.sentMonth : ('0' + item.sentMonth)) + '/' + item.sentYear ,
                        status: item.status == 1 ? 'Thành công' : 'Lỗi'
                    }
                    this.smsArr.push(obj);
                }
                this.dataSource.data = this.smsArr;
                this.totalItems = smsData.totalCount;
            });
        }

        this._birthDay = (this._obj.birthDate ? (this._obj.birthDate > 9 ? this._obj.birthDate : '0' + this._obj.birthDate) + '/' : '') + (this._obj.birthMonth ? (this._obj.birthMonth > 9 ? this._obj.birthMonth : '0' + this._obj.birthMonth) + '/' : '') + this._obj.birthYear;

        this._context = {
            code: [this._obj.code],
            fullName: [this._obj.fullName],
            phoneNumber: [this._obj.phoneNumber],
            gender: [this._obj.gender == 2 ? 'Nữ' : (this._obj.gender == 1 ? 'Nam' : 'Không xác định')],
            healthInsuranceNumber: [this._obj.healthInsuranceNumber],
            birthDay: [this._birthDay]
        };
        this._frm = this._formBuilder.group(this._context);
    }
}
