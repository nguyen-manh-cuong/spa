import { AfterViewInit, Component, Injector, OnInit } from '@angular/core';
import { IGroup, IUser } from '@shared/Interfaces';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { merge, of } from 'rxjs';

import { DataService } from '@shared/service-proxies/service-data';
import { FormBuilder } from '@angular/forms';
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { TaskComponent } from '../task/task.component';
import swal from 'sweetalert2';
import { zipObject } from 'lodash';

@Component({
    selector: 'app-index',
    templateUrl: './index.component.html',
    styleUrls: ['./index.component.scss']
})
export class IndexComponent extends PagedListingComponentBase<IUser> implements OnInit, AfterViewInit {

    displayedColumns = ['fullName', 'userName', 'accountType', 'phoneNumber', 'email', 'locality', 'task'];

    _provinces = [];
    _districts = [];
    _wards = [];
    _groups: Array<IGroup> = [];

    _accountTypes = [{ id: 1, name: 'Quản trị' }, { id: 2, name: 'Thành viên' }, { id: 3, name: 'Người bệnh' }, { id: 4, name: 'Bác sĩ / Chuyên gia / Điều dưỡng' }, { id: 5, name: 'Cơ sở y tế / Doanh nghiệp' }];

    constructor(injector: Injector, private _dataService: DataService, public dialog: MatDialog, private _formBuilder: FormBuilder) {
        super(injector);
    }

    ngOnInit() {
        this.api = 'users';
        this.frmSearch = this._formBuilder.group({ provinceCode: [], districtCode: [], wardCode: [], userName: [], userPhoneEmail: [], group: [], accountType: [], fullName: [] });
        this.ruleSearch = { accountType: 'int', group: 'int' };
        this.dataService = this._dataService;
        this.dialogComponent = TaskComponent;

        this.dataService.getAll('provinces').subscribe(resp => this._provinces = resp.items);
        this.dataService.getAll('groups').subscribe(resp => this._groups = resp.items);
    }

    onSelectProvince(obj: any) {
        this._districts = this._wards = [];
        this.frmSearch.patchValue({ districtCode: null, wardCode: null });
        const province = this._provinces.find((o: { provinceCode: string, name: string; }) => o.provinceCode === obj);
        if (province) { this.dataService.get('districts', JSON.stringify({ ProvinceCode: province.provinceCode }), '', 0, 0).subscribe(resp => this._districts = resp.items); }
    }

    onSelectDistrict(obj: any) {
        this._wards = [];
        this.frmSearch.patchValue({ wardCode: null });
        const district = this._districts.find((o: { districtCode: string, name: string; }) => o.districtCode === obj);
        if (district) { this.dataService.get('wards', JSON.stringify({ DistrictCode: district.districtCode }), '', 0, 0).subscribe(resp => this._wards = resp.items); }
    }
}
