import { Component, Injector, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { IBookingDoctorsCalendarsView, IHealthfacilities } from '@shared/Interfaces';
import { MatDialog, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material';
import { DataService } from '@shared/service-proxies/service-data';
import { FormBuilder, FormControl } from '@angular/forms';
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { DetailComponent } from '../detail/detail.component';
import { startWith, map, finalize, switchMap, tap, debounceTime } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { SelectionModel } from '@angular/cdk/collections';

import swal from 'sweetalert2';
import * as moment from 'moment';
import * as _ from 'lodash';

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
    encapsulation: ViewEncapsulation.None
})
export class IndexComponent extends PagedListingComponentBase<IBookingDoctorsCalendarsView> implements OnInit {
    _healthfacilities = [];
    _doctors = [];
    _lstWorkingTimes = [];

    displayedColumns = [];
    lstCalendarId: number[] = [];
    status = [{ id: 3, name: 'Tất cả' }, { id: 0, name: 'Chờ duyệt' }, { id: 1, name: 'Đã duyệt' }, { id: 2, name: 'Đã hủy' },];
    dialogDetail: any;
    healthfacilities = new FormControl();
    filteredOptions: Observable<IHealthfacilities[]>;
    selection = new SelectionModel<IBookingDoctorsCalendarsView>(true, []);
    isLoading = false;

    @ViewChild("startTime") startTime;
    @ViewChild("endTime") endTime;
    @ViewChild('auto') auto;

    constructor(injector: Injector, private _dataService: DataService, public dialog: MatDialog, private _formBuilder: FormBuilder) {
        super(injector);
    }

    ngOnInit() {
        this.api = 'bookingdoctorapprove';
        this.frmSearch = this._formBuilder.group({
            healthfacilities: [],
            doctor: [],
            startTime: [moment(new Date().setHours(7, 0, 0, 0)).toDate()],
            endTime: [moment(new Date()).add(6, 'days').toDate],
            status: [3]
        });

        this.dataService = this._dataService;
        this.dialogDetail = DetailComponent;

        if (this.appSession.user.healthFacilitiesId) {
            this.dataService.getAll('doctors', String(this.appSession.user.healthFacilitiesId)).subscribe(resp => this._doctors = resp.items);
            this.frmSearch.controls['healthfacilities'].setValue(this.appSession.user.healthFacilitiesId);
        }
        else {
            this.filterOptions();
            this.healthfacilities.setValue(null);
        }

        setTimeout(() => {
            this.startTime.nativeElement.value = moment(new Date()).format("DD/MM/YYYY");
            this.endTime.nativeElement.value = moment(new Date().setDate(new Date().getDate() + 6)).format("DD/MM/YYYY");
            this.startTime.nativeElement.focus();
            this.endTime.nativeElement.focus();
            this.getDate(this.startTime.nativeElement.value, this.endTime.nativeElement.value);
        }, 1000);
    }

    //dialog detail
    detail(obj): void {
        const dialogRef = this.dialog.open(this.dialogDetail, { minWidth: 'calc(100vw/2)', maxWidth: 'calc(100vw - 300px)', data: obj ? obj : null });
        dialogRef.afterClosed().subscribe(() => this.paginator._changePageSize(this.paginator.pageSize));
    }

    //filter autocomplete
    displayFn(h?: IHealthfacilities): string | undefined {
        return h ? h.name : undefined;
    }

    filterOptions() {
        this.healthfacilities.valueChanges
            .pipe(
              debounceTime(500),
              tap(() => this.isLoading = true),
              switchMap(value => this.filter(value))
            )
            .subscribe(data => {
                this._healthfacilities = data.items;
            });
      }
  
      filter(value: any){
        var fValue = typeof value === 'string'  ? value : (value ? value.name : '')
        this._healthfacilities = [];
  
        return this.dataService
            .get("healthfacilities", JSON.stringify({
                name : isNaN(fValue) ? fValue : "",
                code : !isNaN(fValue) ? fValue : ""
            }), '', null, null)
            .pipe(
                finalize(() => this.isLoading = false)
            )
      }
                                                                                                                                                                                            
    //selected checkbox table
    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSources.data.length;
        return numSelected === numRows;
    }

    masterToggle() {
        if (this.isAllSelected()) {
            this.selection.clear()

            this.dataSources.data.forEach((row: IBookingDoctorsCalendarsView) => {
                this.tdChecked(row, false);
            });
        } else {
            this.dataSources.data.forEach((row: IBookingDoctorsCalendarsView) => {
                this.tdChecked(row, true);
                this.selection.select(row)
            });
        }
    }

    toggle(row: any, event: any) {
        this.tdChecked(row, event.checked);
        this.selection.toggle(row);
    }

    tdChecked(row: any, checked: any) {
        if (checked) {
            row.lstBookingDoctorsCalendars.forEach(el => {
                if (el.status == 0) {
                    $('#' + el.calendarId).prop('checked', true).prop("disabled", true);
                }
            });
        } else {
            row.lstBookingDoctorsCalendars.forEach(el => {
                if (el.status == 0) {
                    $('#' + el.calendarId).prop('checked', false).prop("disabled", false);;
                }
            });
        }
    }

    onSelectHealthFacilities(obj: any) {
        this._doctors = [];
        this.dataService.getAll('doctors', obj.healthFacilitiesId).subscribe(resp => this._doctors = resp.items);
    }

    //summit
    update(obj: any) {
        var content = obj ? (obj.status == 1 ? this.l('ApproveExamScheduleCancel') : this.l('ApproveExamScheduleRestore')) : this.l('ApproveExamScheduleWillApprove');
        var status = obj ? (obj.status == 1 ? 2 : 0) : 1;
        var lstCalendarId = obj ? [obj.calendarId] : this.getSelected();
        if (!lstCalendarId.length)
            return swal({
            title: this.l('Notification'),
            text: this.l('NoWaitingSchedule'),
            type: 'warning',
            timer: 3000
        })

        swal({
            title: this.l('AreYouSure'),
            html: content,
            type: 'warning',
            showCancelButton: true,
            confirmButtonClass: 'mat-raised-button mat-primary bg-danger',
            cancelButtonClass: 'mat-button',
            confirmButtonText: this.l('YesUpdate'),
            cancelButtonText: this.l('Cancel'),
            buttonsStyling: false
        }).then((result) => {
            if (result.value) {
                this._dataService.update(this.api, { lstCalendarId: lstCalendarId, status: status, userId: this.appSession.userId }).subscribe(() => {
                    this.paginator._changePageSize(this.paginator.pageSize);
                    this.paginator.pageIndex = 0;
                    this.selection = new SelectionModel<IBookingDoctorsCalendarsView>(true, []);
                    this.lstCalendarId = [];
                    swal({
                        title: this.l('Complete'),
                        text: '',
                        type: 'success',
                        timer: 3000
                    })
                }, err => { });
            }
        });
    }

    getCalendarId(calendarId: any, checked: any) {
        if (checked) {
            this.lstCalendarId.push(calendarId)
        } else {
            for (let i = 0; i < this.lstCalendarId.length; i++) {
                if (this.lstCalendarId[i] == calendarId && this.lstCalendarId[i]) this.lstCalendarId.splice(i, 1);
            }
        }
    }

    getSelected(): number[] {
        this.selection.selected.forEach(el => {
            el.lstBookingDoctorsCalendars.forEach(elCalendars => {
                elCalendars.status == 0 ? this.lstCalendarId.push(elCalendars.calendarId) : '';
            });
        });

        return _.uniq(this.lstCalendarId);
    }

    // search(){
    //     var req = _.omitBy(this.frmSearch.value, _.isNil);
    //     req.healthfacilities = req && req.healthfacilities ? req.healthfacilities.healthFacilitiesId : "";

    //     this.paginator.pageIndex = 0;
    //     this.dataService
    //     .get(this.api, JSON.stringify(req), '', this.paginator.pageIndex, this.paginator.pageSize)
    //     .subscribe(resp => {
    //         setTimeout(() => this.isTableLoading = true, 100);
    //         this.totalItems = resp.totalCount;
    //         this.dataSources.data = resp.items;
    //     });
    // }

    //handle search
    customSearch() {
        if (!this.startTime.nativeElement.value || !this.endTime.nativeElement.value) {
            return swal({
                title: this.l('Notification'),
                text: this.l('FromDateToDateCannotBlank'),
                type: 'warning',
                timer: 3000
            });
        }

        if (!moment(this.startTime.nativeElement.value, 'DD/MM/YYYY').isValid()) {
            return swal({
                title: this.l('Notification'),
                text: this.l('FromDateIncorrectFormat'),
                type: 'warning',
                timer: 3000
            });
        }

        if (!moment(this.endTime.nativeElement.value, 'DD/MM/YYYY').isValid()) {
            return swal({
                title: this.l('Notification'),
                text: this.l('ToDateIncorrectFormat'),
                type: 'warning',
                timer: 3000
            });
        }

        if (((moment(this.endTime.nativeElement.value, 'DD/MM/YYYY').valueOf() - moment(this.startTime.nativeElement.value, 'DD/MM/YYYY').valueOf()) / (1000 * 60 * 60 * 24)) < 0) {
            return swal({
                title: this.l('Notification'),
                text: this.l('FromDateMustBeGreaterThanOrEqualToDate'),
                type: 'warning',
                timer: 3000
            });
        }

        if (((moment(this.endTime.nativeElement.value, 'DD/MM/YYYY').valueOf() - moment(this.startTime.nativeElement.value, 'DD/MM/YYYY').valueOf()) / (1000 * 60 * 60 * 24)) > 6) {
            return swal({
                title: this.l('Notification'),
                text: this.l('SearchWithin7Day'),
                type: 'warning',
                timer: 3000
            });
        }

        this.healthfacilities.value ? this.frmSearch.controls['healthfacilities'].setValue(this.healthfacilities.value.healthFacilitiesId) : (this.appSession.user.healthFacilitiesId == null ? this.frmSearch.controls['healthfacilities'].setValue(null) : '');
        this.startTime.nativeElement.value ? this.frmSearch.controls['startTime'].setValue(moment(this.startTime.nativeElement.value + '00:00:00', 'DD/MM/YYYY hh:mm:ss').add(7, 'hours').toDate()) : '';
        this.endTime.nativeElement.value ? this.frmSearch.controls['endTime'].setValue(moment(this.endTime.nativeElement.value + '23:59:59', 'DD/MM/YYYY hh:mm:ss').add(7, 'hours').toDate()) : '';
        this.getDate(this.startTime.nativeElement.value, this.endTime.nativeElement.value);
        this.btnSearchClicks$.next();
        //this.search();
    }

    //gen date -> column
    getDate(startTime: string, endTime: string) {
        var start = moment(startTime, "DD/MM/YYYY").toDate();
        var end = moment(endTime, "DD/MM/YYYY").toDate();

        if (!moment(start).isValid || !moment(end).isValid) return console.log('isvalid');

        this.displayedColumns = ['orderNumber', 'select', 'name'];
        this._lstWorkingTimes = [];
        var days = (moment(end).valueOf() - moment(start).valueOf()) / (1000 * 60 * 60 * 24);

        for (let i = 0; i <= days; i++) {
            var date = new Date(start.getFullYear(), start.getMonth(), start.getDate());
            date.setDate(date.getDate() + i);

            this.displayedColumns.push(i.toString());
            this._lstWorkingTimes.push({
                index: i,
                dayCol: this.getDayOfWeek(date.getDay()) + moment(date).format("DD/MM/YYYY"),
                date: moment(date).format("DD/MM/YYYY")
            });
        }
    }

    getDayOfWeek(day: number): string {
        switch (day) {
            case 1:
                return "Thứ 2 - ";
            case 2:
                return "Thứ 3 - ";
            case 3:
                return "Thứ 4 - ";
            case 4:
                return "Thứ 5 - ";
            case 5:
                return "Thứ 6 - ";
            case 6:
                return "Thứ 7 - ";
            case 0:
                return "Chủ nhật - ";
        }
    }
}
