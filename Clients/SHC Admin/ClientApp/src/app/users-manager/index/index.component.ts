import { AfterViewInit, Component, Injector, OnInit } from '@angular/core';
import { IGroup, IUser } from '@shared/Interfaces';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { catchError, map, startWith, switchMap, window } from 'rxjs/operators';
import { merge, of } from 'rxjs';

import { DataService } from '@shared/service-proxies/service-data';
import { FormBuilder } from '@angular/forms';
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { TaskComponent } from '../task/task.component';
import swal from 'sweetalert2';
import { zipObject } from 'lodash';
import { ResetComponent } from '../reset/reset.component';

@Component({
    selector: 'app-index',
    templateUrl: './index.component.html',
    styleUrls: ['./index.component.scss']
})
export class IndexComponent extends PagedListingComponentBase<IUser> implements OnInit, AfterViewInit {

    displayedColumns = ['fullName', 'userName', 'groupName', 'accountType', 'phoneNumber', 'email', 'locality', '_approved', '_lock',  'task'];

    _provinces = [];
    _districts = [];
    _wards = [];
    _groups: Array<IGroup> = [];
    dialogResetComponent: any;

    _accountTypes = [{ id: 1, name: 'Thành viên' }, { id: 2, name: 'Bác sỹ/ Chuyên gia/ Điều dưỡng...' }, { id: 3, name: 'Cơ sở y tế/ doanh nghiệp' }];

    constructor(injector: Injector, private _dataService: DataService, public dialog: MatDialog, private _formBuilder: FormBuilder) {
        super(injector);
    }

    ngOnInit() {
        this.api = 'users';
        this.frmSearch = this._formBuilder.group({ provinceCode: [], districtCode: [], wardCode: [], userName: [], userPhoneEmail: [], group: [], accountType: [], fullName: [] });
        this.ruleSearch = { accountType: 'int', group: 'int' };
        this.dataService = this._dataService;
        this.dialogComponent = TaskComponent;
        this.dialogResetComponent = ResetComponent;
        this.dataService.getAll('provinces').subscribe(resp => this._provinces = resp.items);
        this.dataService.getAll('groups').subscribe(resp => this._groups = resp.items);
        
    }

    resetDialog(obj?: any): void {
        swal({
            title: this.l('Bạn có chắc không?'),
            text: this.l(`${obj.userName} sẽ thay đổi mật khẩu.`),
            type: 'warning',
            showCancelButton: true,
            confirmButtonClass: 'mat-raised-button mat-primary bg-danger',
            cancelButtonClass: 'mat-button',
            confirmButtonText: this.l('Đồng ý'),
            cancelButtonText: this.l('Cancel'),
            buttonsStyling: false
        }).then((result) => {
            if (result.value) {
                const dialogRef = this.dialog.open(this.dialogResetComponent, { minWidth: 'calc(100vw/2)', maxWidth: 'calc(100vw - 300px)', disableClose: true, data: obj ? obj : null });
                dialogRef.afterClosed().subscribe(() => {
                    this.paginator.pageIndex = 0;
                    this.paginator._changePageSize(this.paginator.pageSize);
                });
            }
        });
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

    onHandleApproved(user: any, event) {

        if (user.status == 0) {
            console.log(12, event);
            event.checked = !event.checked;
            return swal({
                title: 'Thông báo',
                text: 'Tài khoản hiện đang khóa.',
                type: 'warning',
                timer: 3000
            })
        }

        let msg = user.statusSHC == 2 ? `${user.userName} sẽ tạm khóa` : (user.statusSHC == 3 ? `${user.userName} sẽ được mở khóa` : `${user.userName} sẽ được phê duyệt`);

        swal({
            title: this.l('Thông báo'),
            text: this.l(`Bạn có chắc không? ${msg}`),
            type: 'warning',
            showCancelButton: true,
            confirmButtonClass: 'mat-raised-button mat-primary bg-danger',
            cancelButtonClass: 'mat-button',
            confirmButtonText: this.l('Đồng ý'),
            cancelButtonText: this.l('Cancel'),
            buttonsStyling: false
        }).then((result) => {
            if (result.value) {
                user.statusSHC == 1 ? 2 : 3;
                this.dataService.update('user-approved', user).subscribe(() => {
                    this.dataService.get(this.api, '', '', this.paginator.pageIndex, this.paginator.pageSize).subscribe(data => this.dataSources.data = data.items);
                });
            }
        })
    }

    onHandleLock(user: any, event) {
        let msg = user.status == 1 ? `${user.userName} sẽ được mở khóa` : `${user.userName} sẽ bị khóa`;
        swal({
            title: this.l('Thông báo'),
            text: this.l(`Bạn có chắc không? ${msg}`),
            type: 'warning',
            showCancelButton: true,
            confirmButtonClass: 'mat-raised-button mat-primary bg-danger',
            cancelButtonClass: 'mat-button',
            confirmButtonText: this.l('Đồng ý'),
            cancelButtonText: this.l('Cancel'),
            buttonsStyling: false
        }).then((result) => {
            if (result.value) {
                user.status == 0 ? 1 : 0;
                this.dataService.update('user-locked', user).subscribe(() => {
                    this.dataService.get(this.api, '', '', this.paginator.pageIndex, this.paginator.pageSize).subscribe(data => this.dataSources.data = data.items);
                });
            }
        })
    }

    getGroupNameByUserId(id: any) {
        this._dataService.get('groups-name', JSON.stringify({'userId': id}), null, null, null).subscribe(resp => {
            //this._groups = resp.items;
            console.log(1, resp.items);
        });
    }
}
