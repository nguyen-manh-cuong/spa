import { AfterViewInit, Component, Injector, OnInit } from '@angular/core';
import { IGroup, IUser } from '@shared/Interfaces';
import { MatDialog } from '@angular/material';

import { DataService } from '@shared/service-proxies/service-data';
import { FormBuilder } from '@angular/forms';
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { TaskComponent } from '../task/task.component';
import swal from 'sweetalert2';
import { ResetComponent } from '../reset/reset.component';

@Component({
    selector: 'app-index',
    templateUrl: './index.component.html',
    styleUrls: ['./index.component.scss']
})
export class IndexComponent extends PagedListingComponentBase<IUser> implements OnInit, AfterViewInit {

    displayedColumns = ['orderNumber', 'fullName', 'userName', 'groupName', 'accountType', 'phoneNumber', 'email', 'locality', '_approved', '_lock',  'task'];

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
                const dialogRef = this.dialog.open(this.dialogResetComponent, { minWidth: 'calc(50/2)', maxWidth: 'calc(50 - 50)', disableClose: true, data: obj ? obj : null });
                dialogRef.afterClosed().subscribe(() => {
                    this.paginator.pageIndex = 0;
                    this.paginator._changePageSize(this.paginator.pageSize);
                });
            }
        });
    }

    onSelectProvince(obj: any): void {
        this._districts = this._wards = [];
        this.frmSearch.patchValue({ districtCode: null, wardCode: null });
        const province = this._provinces.find((o: { provinceCode: string, name: string; }) => o.provinceCode === obj);
        if (province) { this.dataService.get('districts', JSON.stringify({ ProvinceCode: province.provinceCode }), '', 0, 0).subscribe(resp => this._districts = resp.items); }
    }

    onSelectDistrict(obj: any): void {
        this._wards = [];
        this.frmSearch.patchValue({ wardCode: null });
        const district = this._districts.find((o: { districtCode: string, name: string; }) => o.districtCode === obj);
        if (district) { this.dataService.get('wards', JSON.stringify({ DistrictCode: district.districtCode }), '', 0, 0).subscribe(resp => this._wards = resp.items); }
    }

    onHandleApproved(user: any, event) {
        if (user.status == 0) {
            return swal({
                title: 'Thông báo',
                text: 'Tài khoản hiện đang khóa.',
                type: 'warning',
                timer: 3000
            }).then((result) => {
                console.log(12, result);
                if (result.value) {
                    this.dataService.get(this.api, '', '', this.paginator.pageIndex, this.paginator.pageSize).subscribe(data => this.dataSources.data = data.items);
                }
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

    onHandleLock(user: any, event): void {
        let msg = user.status == 0 ? `${user.userName} sẽ được mở khóa` : `${user.userName} sẽ bị khóa`;
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

    ruleSpecialCharacter(): void {
        var control = this.frmSearch.controls['userName'];
        const pattern = /^[a-zA-Z0-9]*$/;

        if (control.value && !pattern.test(control.value)) {
            control.setValue(control.value.replace(/[^a-zA-Z0-9]/g, ""));
        }
    }
}
