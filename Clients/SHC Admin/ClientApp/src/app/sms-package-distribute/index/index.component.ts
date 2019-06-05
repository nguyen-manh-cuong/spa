import { AfterViewInit, Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatButton, MatDialog, MatDialogRef } from '@angular/material';

import { DataService } from '@shared/service-proxies/service-data';
import { IPachkageDistribute } from '@shared/Interfaces';
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { packagedistributeTaskComponent } from '../task/task.component';
import swal from 'sweetalert2';
import { packagedistributeViewComponent } from '../view/view.component';
import { DatePipe } from '@angular/common';
import { packagedistributeEditComponent } from '../edit/edit.component';
import { SelectAutocompleteComponent } from '@app/mat-select-autocomplete/select-autocomplete.component'
import { getPermission } from '@shared/helpers/utils';
import { Router } from '@angular/router';
import { AnyARecord } from 'dns';

@Component({
    selector: 'app-packagedistributeindex',
    templateUrl: './index.component.html',
    styleUrls: ['./index.component.scss']
})

export class packagedistributeIndexComponent extends PagedListingComponentBase<IPachkageDistribute> implements OnInit {

    frmSearch: FormGroup;
    displayedColumns = this.appSession.user.accountType != 0 ? ['Stt', 'StartTime', 'pk', 'sms', 'isActive', 'task'] : ['Stt', 'HealthFacilitiesId', 'StartTime', 'pk', 'sms', 'isActive', 'task'];

    _month = [{ id: 13, name: 'Tất cả' }, { id: 1, name: 'Tháng 1' }, { id: 2, name: 'Tháng 2' }, { id: 3, name: 'Tháng 3' }, { id: 4, name: 'Tháng 4' }, { id: 5, name: 'Tháng 5' }, { id: 6, name: 'Tháng 6' }, { id: 7, name: 'Tháng 7' }, { id: 8, name: 'Tháng 8' }, { id: 9, name: 'Tháng 9' }, { id: 10, name: 'Tháng 10' }, { id: 11, name: 'Tháng 11' }, { id: 12, name: 'Tháng 12' },];
    _medicalFacility = [{ healthFacilitiesId: 1, name: 'Cơ sở y tế phường Đại Kim', code: '' }, { healthFacilitiesId: 2, name: 'Cơ sở y tế phường Định Công', code: '' }, { healthFacilitiesId: 3, name: 'Cơ sở y tế phường Hoàng Liệt', code: '' }, 
    { healthFacilitiesId: 4, name: 'Cơ sở y tế phường Giáp Bát', code: '' }, { healthFacilitiesId: 5, name: 'Cơ sở y tế phường Lĩnh Nam', code: '' }];
    _medicalFacilityFind = [];
    _Status = [{ id: 2, name: 'Tất cả' }, { id: 1, name: 'Hiệu lực' }, { id: 0, name: 'Không hiệu lực' }];

    showError = false;
    errorMessage = '';
    permission: any;

    constructor(injector: Injector, private _dataService: DataService, private datePipe: DatePipe, public dialog: MatDialog, private _formBuilder: FormBuilder, private router: Router) { super(injector); }

    ViewComponent: any;
    EditComponent: any;
    @ViewChild(SelectAutocompleteComponent) multiSelect: SelectAutocompleteComponent;
    @ViewChild("monthStart") monthStart;
    @ViewChild("monthEnd") monthEnd;

    ngOnInit() {
        this.api = 'smspackagedistribute';
        this.dataService = this._dataService;

        this.dialogComponent = packagedistributeViewComponent;
        this.ViewComponent = this.dialogComponent;

        this.dialogComponent = packagedistributeEditComponent;
        this.EditComponent = this.dialogComponent;
        this.permission = getPermission(abp.nav.menus['mainMenu'].items, this.router.url);


        this.dialogComponent = packagedistributeTaskComponent;
        this.frmSearch = this._formBuilder.group({
            monthStart: [13,],
            monthEnd: [13,],
            toYear: ['', [Validators.maxLength(4), Validators.min(0), Validators.max(9999), Validators.pattern('[0-9]*')]],
            fromYear: ['', [Validators.maxLength(4), Validators.min(0), Validators.max(9999), Validators.pattern('[0-9]*')]],
            HealthFacilitiesId: [this.appSession.user.healthFacilities ? [this.appSession.user.healthFacilitiesId] : '',],
            Status: [2,],
        });

        this._dataService.getAll('healthfacilities').subscribe(resp => {
            this._medicalFacility = resp.items;
        });
    }

    getMedicalById(id: number): string {
        try {
            return this._medicalFacilityFind.find(e => e.id == id).name;
        }
        catch{
            return "";
        }
    }

    deleteDialogPackage(obj: IPachkageDistribute, key: string, benhvien: number, id?: number | string) {
        swal({
            title: this.l('AreYouSure'),
            html: this.l('DeleteWarningMessage', obj[key]),
            type: 'warning',
            showCancelButton: true,
            confirmButtonClass: 'mat-raised-button mat-primary bg-danger',
            cancelButtonClass: 'mat-button',
            confirmButtonText: this.l('YesDelete'),
            cancelButtonText: this.l('Cancel'),
            buttonsStyling: false
        }).then((result) => {
            if (result.value) {
                    this.dataService.delete(this.api, obj[id ? id : 'id']).subscribe(e => {
                        this.paginator._changePageSize(this.paginator.pageSize);
                        this.paginator.pageIndex = 0;
                        swal({
                            title: this.l('SuccessfullyDeleted'),
                            html: this.l('DeletedInSystem', obj[key]),
                            type: 'success',
                            timer: 3000
                        });
                    });
            }
        });
    }

    openView(obj?: IPachkageDistribute): void {
        const dialogRef = this.dialog.open(this.ViewComponent, { minWidth: 'calc(100vw/2)', maxWidth: 'calc(100vw - 300px)', data: obj ? obj : null });
        dialogRef.afterClosed().subscribe(() => {
            this.paginator.pageIndex = 0;
            this.paginator._changePageSize(this.paginator.pageSize);
        });
    }

    openEdit(obj?: IPachkageDistribute): void {
        const dialogRef = this.dialog.open(this.EditComponent, { minWidth: 'calc(100vw/2)', maxWidth: 'calc(100vw - 300px)', data: obj ? obj : null });
        dialogRef.afterClosed().subscribe(() => {
            this.paginator.pageIndex = 0;
            this.paginator._changePageSize(this.paginator.pageSize);
        });
    }


    onSelectMonthStart(value) {
        this.frmSearch.controls['monthStart'].setValue(value);
    }
    onSelectMonthEnd(value) {
        this.frmSearch.controls['monthEnd'].setValue(value);
    }

    getSelectedOptions(selected) {
        this.frmSearch.controls['HealthFacilitiesId'].setValue(selected);
    }


    customSearch() {
        if (this.frmSearch.controls['fromYear'].value == this.frmSearch.controls['toYear'].value) {
            if(this.frmSearch.controls['monthStart'].value > this.frmSearch.controls['monthEnd'].value){
                return swal({
                    title: 'Thông báo',
                    text: 'Đến tháng phải lớn hơn hoặc bằng Từ tháng',
                    type: 'warning',
                    timer: 3000
                });
            }
        }
        if (this.frmSearch.controls['fromYear'].value > this.frmSearch.controls['toYear'].value) {
                return swal({
                    title: 'Thông báo',
                    text: 'Đến năm phải lớn hơn hoặc bằng Từ năm',
                    type: 'warning',
                    timer: 3000
                });
        }
        this.btnSearchClicks$.next();
    }

    checkPermission(isEdit: boolean, isDelete: boolean): boolean{
        if(isEdit || isDelete){
            return true;
        } else{
            this.displayedColumns = this.appSession.user.accountType != 0 ? ['Stt', 'StartTime', 'pk', 'sms', 'isActive'] : ['Stt', 'HealthFacilitiesId', 'StartTime', 'pk', 'sms', 'isActive'];
            return false;
        }
    }
}
