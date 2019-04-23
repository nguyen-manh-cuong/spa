import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { IBookingInformations } from '@shared/Interfaces';
import { MatDialog } from '@angular/material';

import { DataService } from '@shared/service-proxies/service-data';
import { FormBuilder } from '@angular/forms';
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { TaskComponent } from '../task/task.component';
import { DetailComponent } from '../detail/detail.component';
import swal from 'sweetalert2';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

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
    selector: 'app-index',
    templateUrl: './index.component.html',
    styleUrls: ['./index.component.scss'],
    providers: [
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ],
})
export class IndexComponent extends PagedListingComponentBase<IBookingInformations> implements OnInit {

    displayedColumns = ['orderNumber', 'code', 'patient', 'gender', 'phone', 'year', 'description', 'doctor', 'examinationDate', 'status', 'task'];
    status = [{ id: 4, name: 'Tất cả' }, { id: 3, name: 'Hủy khám' }, { id: 2, name: 'Đã khám' }, { id: 1, name: 'Chưa khám' }, { id: 0, name: 'Mới đăng ký' }];
    times = [{ id: 10, name: 'Theo khoảng thời gian' }, { id: 9, name: 'Năm trước' }, { id: 8, name: 'Năm nay' }, { id: 7, name: 'Quý trước' }, { id: 6, name: 'Quý này' },
        { id: 5, name: 'Tháng trước' }, { id: 4, name: 'Quý này' }, { id: 3, name: 'Quý trước' }, { id: 2, name: 'Năm nay' }, { id: 1, name: 'Năm trước' }, { id: 2, name: 'Theo khoảng thời gian' }];
    dialogDetail: any;
    _medicalFacility = [];
    _doctors = [];

    @ViewChild("startTime") startTime;
    @ViewChild("endTime") endTime;

    constructor(injector: Injector, private _dataService: DataService, public dialog: MatDialog, private _formBuilder: FormBuilder) {
        super(injector);
    }

    ngOnInit() {
        this.api = 'bookinginformations';
        this.frmSearch = this._formBuilder.group({ healthFacilities: [], doctor: [], status: [], startTime: [], endTime: [] });
        this.dataService = this._dataService;
        this.dialogComponent = TaskComponent;
        this.dialogDetail = DetailComponent;
        this.dataService.getAll('healthfacilities').subscribe(resp => { this._medicalFacility = resp.items });
        this.dataService.getAll('doctors').subscribe(resp => { this._doctors = resp.items });

    }
    
    detail(obj): void{
        const dialogRef = this.dialog.open(this.dialogDetail, { minWidth: 'calc(100vw/2)', maxWidth: 'calc(100vw - 300px)', data: obj ? obj : null });
        dialogRef.afterClosed().subscribe(() => this.paginator._changePageSize(this.paginator.pageSize));
    }

    showMessage(title: string, content: string, type: string){
        swal(this.l('PackagesMessageTitle.'), this.l('PackagesMessageContent'), 'error');
    }
}
