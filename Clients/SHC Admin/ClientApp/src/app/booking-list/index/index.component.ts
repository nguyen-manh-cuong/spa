import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { IBookingInformations, IMedicalHealthcareHistories } from '@shared/Interfaces';
import { MatDialog } from '@angular/material';
import { isEmpty, isNil, isNull, omitBy, zipObject } from 'lodash';

import { DataService } from '@shared/service-proxies/service-data';
import { FormBuilder, FormControl } from '@angular/forms';
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { EditComponent } from '../edit/edit.component';
import { DetailComponent } from '../detail/detail.component';
import { TaskComponent } from '@app/sms-template-task/task/task.component';
import swal from 'sweetalert2';
import { SelectionModel } from '@angular/cdk/collections';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { ReasonComponent } from '../reason/reason.component';
import { IHealthfacilities } from '../../../../../../SHC Outside/ClientApp/src/shared/Interfaces';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

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
    _healthfacilities = [];
    healthfacilities = new FormControl();
    filteredOptions: Observable<IHealthfacilities[]>;
    displayedColumns = ['orderNumber', 'code', 'patient', 'gender', 'phone', 'year', 'description', 'doctor', 'examinationDate', 'status', 'task'];
    status = [{ id: 4, name: 'Tất cả' }, { id: 3, name: 'Hủy khám' }, { id: 2, name: 'Đã khám' }, { id: 1, name: 'Chưa khám' }, { id: 0, name: 'Mới đăng ký' }];
   
        times = [  
           { id: 0, name: 'Hôm nay' }, { id: 1, name: 'Hôm qua' }, { id: 2, name: 'Tuần nay' }, { id: 3, name: 'Tuần trước' }, { id: 4, name: 'Tháng này' }, { id: 5, name: 'Tháng trước' },
            { id: 6, name: 'Quý này' }, { id: 7, name: 'Quý trước' }, { id: 8, name: 'Năm nay' },  { id: 9, name: 'Năm trước' }, { id: 10, name: 'Theo khoảng thời gian' }, ];
    dialogDetail: any;
    dialogReasonReject: any;
    _medicalFacility = [];
    _doctors = [];
    _isRequest = false;
    _isChosenTime = false;
    dialogSendComponent: any;
    selectionData = new SelectionModel<IMedicalHealthcareHistories>(true, []);

    @ViewChild("startTime") startTime;
    @ViewChild("endTime") endTime;
    @ViewChild("auto") auto;

    constructor(injector: Injector, private _dataService: DataService, public dialog: MatDialog, private _formBuilder: FormBuilder) {
        super(injector);
    }

    ngOnInit() {
        this.api = 'bookinginformations';              
        this.frmSearch = this._formBuilder.group({ healthfacilities: [], doctor: [], packagesNameDescription: [], status: [4], startTime: [moment(new Date().setHours(7, 0, 0, 0)).toDate()], endTime: new Date(), time: [0], });
        this.dataService = this._dataService;
        this.dialogComponent = EditComponent;
        this.dialogSendComponent = TaskComponent;

        this.dialogDetail = DetailComponent;
        this.dialogReasonReject = ReasonComponent;
        
        // if(this.appSession.user.healthFacilitiesId){
        //     this.dataService.getAll('healthfacilities', "{healthfacilitiesId:"+String(this.appSession.user.healthFacilitiesId)+"}").subscribe(resp => this._healthfacilities = resp.items);
        //     this.dataService.getAll('doctors', String(this.appSession.user.healthFacilitiesId)).subscribe(resp => this._doctors = resp.items);
        //     this.frmSearch.controls['healthfacilities'].setValue(this.appSession.user.healthFacilitiesId);
        // }
        // else{
        //     this.filterOptions();
        // }
        if(this.appSession.user.healthFacilitiesId) {
            this.dataService.getAll('healthfacilities', "{healthfacilitiesId:"+String(this.appSession.user.healthFacilitiesId)+"}").subscribe(resp => this._healthfacilities = resp.items);
            this.frmSearch.controls['healthfacilities'].setValue(this.appSession.user.healthFacilitiesId);
            this.dataService.getAll('doctors', String(this.appSession.user.healthFacilitiesId)).subscribe(resp => this._doctors = resp.items);
        }
        else{
            this.dataService.getAll('healthfacilities').subscribe(resp => this._healthfacilities = resp.items);
            this.filterOptions();
        }

        setTimeout(() => {
            this.startTime.nativeElement.value = moment(new Date()).format("DD/MM/YYYY");
            this.endTime.nativeElement.value = moment(new Date()).format("DD/MM/YYYY");
        });
    }

    displayFn(h?: IHealthfacilities): string | undefined {
        return h ? h.name : undefined;
    }

    
    _filter(name: any): IHealthfacilities[] {
        const filterValue = name.toLowerCase();
        var healthfacilities = isNaN(filterValue) ?         
        this._healthfacilities.filter(h => h.name.toLowerCase().indexOf(filterValue) === 0) : 
        this._healthfacilities.filter(h => h.code.toLowerCase().indexOf(filterValue) === 0);
        //if(healthfacilities.length == 0 && filterValue.length) this.frmSearch.controls['healthfacilities'].setValue(0);
        
        return healthfacilities
    }

    clickCbo() {
        !this.healthfacilities.value ? this.filterOptions() : '';
    }

    filterOptions() {
        this.filteredOptions = this.healthfacilities.valueChanges
            .pipe(
                startWith<string | IHealthfacilities>(''),
                map(value => typeof value === 'string' ? value : value.name),
                map(name => name ? this._filter(name) : this._healthfacilities.slice()),
                map(data => data.slice())
            );
    }

    onInputHealthfacilities(obj: any){
        this.frmSearch.controls['healthfacilities'].setValue('');
        this._doctors=null;
    }

    onSelectHealthFacilities(value:any){
        if(value.healthFacilitiesId){
            this.dataService.getAll('doctor',"{healthfacilities:"+value.healthFacilitiesId+"}").subscribe(resp => { this._doctors = resp.items });
        }
        else{
            this._doctors=null;
        }
        this.frmSearch.controls['healthfacilities'].setValue(value.healthFacilitiesId);
    }

    getGender(status: number) {
        switch (status) {
            case 0:
                return 'Không xác định';
            case 1:
                return 'Nam';
            case 2:
                return 'Nữ';
        }
    }
    // healthfacilitesChange($event){
    //     if($event.value){
    //         this.dataService.getAll('doctor',"{healthfacilities:"+$event.value+"}").subscribe(resp => { this._doctors = resp.items });
    //     }
    //     else{
    //         this._doctors=[];
    //     }
    // }

    updateTimeToSearch() {
        this.frmSearch.controls['startTime'].setValue(moment(this.startTime.nativeElement.value, 'DD/MM/YYYY').add(1, 'day').toDate());

        this.frmSearch.controls['endTime'].setValue(moment(this.endTime.nativeElement.value, 'DD/MM/YYYY').add(1, 'day').toDate());
    }

    openCustomDialog(obj): void {
        this.selectionData.select(obj);
        console.log(this.selectionData);
        const dialogRef = this.dialog.open(this.dialogSendComponent, { minWidth: 'calc(100vw/2)', maxWidth: 'calc(100vw - 300px)', disableClose: true, data: { selection: this.selectionData, type: 1 } });

        dialogRef.afterClosed().subscribe(() => {
            this.paginator.pageIndex = 0;
            this.paginator._changePageSize(this.paginator.pageSize);
            this.selectionData = new SelectionModel<IMedicalHealthcareHistories>(true, []);
        });
    }

    handleTime(element: IBookingInformations) {
        if (element.doctorId == null) {
            switch (element.examinationWorkingTime) {
                case 1:
                    return '8:00 - 12:00';
                case 2:
                    return '12:00 - 17:00';
                case 3:
                    return '17:00 - 21:00';
            }
        } else {
            if (element.timeSlotId != null) {
                return element.bookingTimeSlot.hoursStart + ":" + element.bookingTimeSlot.minuteStart + " - " + element.bookingTimeSlot.hoursEnd + ":" + element.bookingTimeSlot.minuteEnd;
            } else {
                return element.examinationTime;
            }
        }
    }

    getStatus(status: number) {
        switch (status) {
            case 0:
                return 'Mới đăng ký';
            case 1:
                return 'Chưa khám';
            case 2:
                return 'Đã khám';
            case 3:
                return 'Hủy khám';
            case 4:
                return 'Tất cả';
                
        }
    }

    onSelectTime(type: number) {
        switch (type) {
            case 0:
                this.startTime.nativeElement.value = moment(new Date()).format("DD/MM/YYYY");
                this.endTime.nativeElement.value = moment(new Date()).format("DD/MM/YYYY");
                break;
            case 1:
                this.startTime.nativeElement.value = moment(new Date()).add(-1, 'day').format("DD/MM/YYYY");
                this.endTime.nativeElement.value = moment(new Date()).format("DD/MM/YYYY");
                break;
            case 2:
                this.startTime.nativeElement.value = moment(new Date()).startOf('week').format("DD/MM/YYYY");
                this.endTime.nativeElement.value = moment(new Date()).endOf('week').format("DD/MM/YYYY");
                break;
            case 3:
                this.startTime.nativeElement.value = moment(new Date()).add(-1, 'week').startOf('week').format("DD/MM/YYYY");
                this.endTime.nativeElement.value = moment(new Date()).add(-1, 'week').endOf('week').format("DD/MM/YYYY");
                break;
            case 4:
                this.startTime.nativeElement.value = moment(new Date()).startOf('month').format("DD/MM/YYYY");
                this.endTime.nativeElement.value = moment(new Date()).endOf('month').format("DD/MM/YYYY");
                break;
            case 5:
                this.startTime.nativeElement.value = moment(new Date()).add(-1, 'month').startOf('month').format("DD/MM/YYYY");
                this.endTime.nativeElement.value = moment(new Date()).add(-1, 'month').endOf('month').format("DD/MM/YYYY");
                break;
            case 6:
                var quarterAdjustment = (moment().month() % 3) + 1;
                console.log(quarterAdjustment);
                var lastQuarterEndDate = moment().subtract({ months: quarterAdjustment }).endOf('month');
                this.endTime.nativeElement.value = lastQuarterEndDate.format("DD/MM/YYYY");
                this.startTime.nativeElement.value = lastQuarterEndDate.clone().subtract({ months: 2 }).startOf('month').format("DD/MM/YYYY");
                break;
            case 7:
                var quarterAdjustment = (moment().month() % 3) + 4;
                console.log(quarterAdjustment);
                var lastQuarterEndDate = moment().subtract({ months: quarterAdjustment }).endOf('month');
                this.endTime.nativeElement.value = lastQuarterEndDate.format("DD/MM/YYYY");
                this.startTime.nativeElement.value = lastQuarterEndDate.clone().subtract({ months: 2 }).startOf('month').format("DD/MM/YYYY");
                break;
            case 8:
                this.startTime.nativeElement.value = moment(new Date()).startOf('year').format("DD/MM/YYYY");
                this.endTime.nativeElement.value = moment(new Date()).endOf('year').format("DD/MM/YYYY");
                break;
            case 9:
                this.startTime.nativeElement.value = moment(new Date()).add(-1, 'year').startOf('year').format("DD/MM/YYYY");
                this.endTime.nativeElement.value = moment(new Date()).add(-1, 'year').endOf('year').format("DD/MM/YYYY");
                break;
            case 10:
                document.getElementById("cbo-startTime").classList.remove("disabled");
                document.getElementById("cbo-endTime").classList.remove("disabled");
                break;
        }
        this.updateTimeToSearch();
    }
    
    detail(obj): void{
        const dialogRef = this.dialog.open(this.dialogDetail, { minWidth: 'calc(100vw/2)', maxWidth: 'calc(100vw - 300px)', data: obj ? obj : null });
        dialogRef.afterClosed().subscribe(() => this.paginator._changePageSize(this.paginator.pageSize));
    }

    showMessage(title: string, content: string, type: string){
        swal(this.l('PackagesMessageTitle.'), this.l('PackagesMessageContent'), 'error');
    }

    deleteDialogPackage(obj) {
        swal({
            title: this.l('AreYouSure'),
            html: ("Thông tin đặt khám " + obj.ticketId + " sẽ bị hủy"),
            type: 'warning',
            showCancelButton: true,
            confirmButtonClass: 'mat-raised-button mat-primary bg-danger',
            cancelButtonClass: 'mat-button',
            confirmButtonText: this.l('Có, hủy ngay!'),
            cancelButtonText: this.l('Cancel'),
            buttonsStyling: false
        }).then((result) => {
            if (result.value) {
                const dialogRef = this.dialog.open(this.dialogReasonReject, { minWidth: 'calc(100vw/2)', maxWidth: 'calc(100vw - 300px)', data: obj ? obj : null });
                dialogRef.afterClosed().subscribe(() => this.paginator._changePageSize(this.paginator.pageSize));
            }
        });
    }

    customSearch() {
        if (!this.endTime.nativeElement.value && !this.startTime.nativeElement.value) {
            return swal({
                title:'Thông báo', 
                text:'Từ ngày và Đến ngày không được để trống', 
                type:'warning',
                timer:3000});
        }
        if (!this.endTime.nativeElement.value || !this.startTime.nativeElement.value) {
            this.endTime.nativeElement.focus();
            this.startTime.nativeElement.focus();
            return swal({
                title:'Thông báo', 
                text:'Ngày gửi từ và Đến ngày không được để trống', 
                type:'warning',
                timer:3000});
        }
        if (!moment(this.endTime.nativeElement.value, 'DD/MM/YYYY').isValid()) {
            this.startTime.nativeElement.focus();
            return swal({
                title:'Thông báo', 
                text:'Đến ngày không đúng định dạng', 
                type:'warning',
                timer:3000});
          }
        if (!moment(this.startTime.nativeElement.value, 'DD/MM/YYYY').isValid()) {
            this.startTime.nativeElement.focus();
            return swal({
                title:'Thông báo', 
                text:'Từ ngày không đúng định dạng', 
                type:'warning'});
          }
        if (!moment(this.endTime.nativeElement.value, 'DD/MM/YYYY').isValid()) {
            this.endTime.nativeElement.focus();
            return swal({
                title:'Thông báo', 
                text:'Đến ngày không đúng định dạng', 
                type:'warning',
                timer:3000});
        }
        if (((moment(this.endTime.nativeElement.value, 'DD/MM/YYYY').valueOf() - moment(this.startTime.nativeElement.value, 'DD/MM/YYYY').valueOf()) / (1000 * 60 * 60 * 24)) < 0) {
            return swal({
                title:'Thông báo', 
                text:'Đến ngày phải lớn hơn hoặc bằng Từ ngày',
                type: 'warning',
                timer:3000});
          }
        this.startTime.nativeElement.value ? this.frmSearch.controls['startTime'].setValue(moment(this.startTime.nativeElement.value + '00:00:00', 'DD/MM/YYYY hh:mm:ss').add(7, 'hours').toDate()) : '';
        this.endTime.nativeElement.value ? this.frmSearch.controls['endTime'].setValue(moment(this.endTime.nativeElement.value + '23:59:59', 'DD/MM/YYYY hh:mm:ss').add(7, 'hours').toDate()) : '';
        var req = omitBy(this.frmSearch.value, isNil);
        this.btnSearchClicks$.next();
    }
}
