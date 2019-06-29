import swal from 'sweetalert2';
import * as moment from 'moment';
import * as _ from 'lodash';

import { Component, Injector, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { IBookingDoctorsApprove, IHealthfacilities } from '@shared/Interfaces';
import { MatDialog } from '@angular/material';
import { DataService } from '@shared/service-proxies/service-data';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AppComponentBase } from '@shared/app-component-base';
import { TaskComponent } from '../task/task.component';
import { MatAutocompleteTrigger } from '@angular/material';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { EventInput } from '@fullcalendar/core';
import viLocale from '@fullcalendar/core/locales/vi';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGrigPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Observable } from 'rxjs';
import { startWith, map, debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { getPermission, notifyToastr } from '@shared/helpers/utils';
import { Router } from '@angular/router';



@Component({
    selector: 'app-index',
    templateUrl: './index.component.html',
    styleUrls: ['./index.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class IndexComponent extends AppComponentBase implements OnInit {
    _healthfacilities = [];
    _doctors = [];
    _months = _.range(1, 13);
    _status = [{ id: 3, name: 'Tất cả' }, { id: 0, name: 'Chờ duyệt' }, { id: 1, name: 'Đã duyệt' }, { id: 2, name: 'Đã hủy' }];
    viLocale: viLocale;
    healthfacilities = new FormControl();
    filteredOptions: Observable<IHealthfacilities[]>;
    dataService: DataService;
    frmSearch: FormGroup;

    isLoading = false;
    showFilter: boolean = true;
    dialogTask: any;
    calendarWeekends = true;
    calendarPlugins = [listPlugin, dayGridPlugin, timeGrigPlugin, interactionPlugin];
    calendarEvents: EventInput[] = [];
    permission: any;
    currentMonth: number;

    checkCalendar: number;

    @ViewChild('calendar') calendarComponent: FullCalendarComponent;
    @ViewChild('healthfacilities') healthfacility;
    @ViewChild('inputUnit', { read: MatAutocompleteTrigger }) inputUnitTrigger: MatAutocompleteTrigger;

    constructor(injector: Injector, private _dataService: DataService, public dialog: MatDialog, private _formBuilder: FormBuilder, private router: Router) {
        super(injector);
    }

    ngOnInit() {
        this.frmSearch = this._formBuilder.group({
            healthfacilities: [],
            doctor: [],
            month: [new Date().getMonth() + 1],
            status: [3]
        });
        this.dataService = this._dataService;
        this.dialogTask = TaskComponent;
        this.calendarComponent.locale = viLocale;
        this.permission = getPermission(abp.nav.menus['mainMenu'].items, this.router.url);

        if (this.appSession.user.healthFacilitiesId) {
            this.dataService.getAll('doctors', String(this.appSession.user.healthFacilitiesId)).subscribe(resp => this._doctors = resp.items);
            this.frmSearch.controls['healthfacilities'].setValue(this.appSession.user.healthFacilitiesId);
        } else {
            this.filterOptions();
            this.healthfacilities.setValue(null);
        }
    }

    search() {
        if (this.frmSearch.controls['healthfacilities'].value == null) {
            return notifyToastr(this.l('Notification'), this.l('Đơn vị và Bác sỹ không được để trống'), 'warning');
            // swal({
            //     title: this.l('Notification'),
            //     text: this.l('Đơn vị và Bác sỹ không được để trống'),
            //     type: 'warning',
            //     timer: 3000
            // });
        }

        let calendarApi = this.calendarComponent.getApi();


        if (calendarApi.view.type == "dayGridMonth") {
            var searchMonth = this.frmSearch.controls['month'].value;

            this.currentMonth = calendarApi.state.currentDate.getMonth() + 1;

            if (searchMonth < this.currentMonth) {
                for (let i = 0; i < (this.currentMonth - searchMonth); i++) {
                    calendarApi.prev();
                }
                this.currentMonth = searchMonth;
            } else {
                for (let i = 0; i < (searchMonth - this.currentMonth); i++) {
                    calendarApi.next();
                }
                this.currentMonth = searchMonth;
            }
        }

        if (calendarApi.view.type == "timeGridWeek") {
            calendarApi.gotoDate(new Date().setMonth(this.frmSearch.controls['month'].value - 1));
        }
        if (calendarApi.view.type == "timeGridDay") {
            calendarApi.gotoDate(new Date(new Date().setDate(1)).setMonth(this.frmSearch.controls['month'].value - 1));
        }


        if (((!this.appSession.user.healthFacilitiesId && this.healthfacilities.value) || (this.appSession.user.healthFacilitiesId)) && this.frmSearch.controls['doctor'].value) {
            !this.appSession.user.healthFacilitiesId ? this.frmSearch.controls['healthfacilities'].setValue(this.healthfacilities.value.healthFacilitiesId) : "";

            this.dataService
                .get("bookingdoctor", JSON.stringify(_.omitBy(this.frmSearch.value, _.isNil)), '', null, null)
                .subscribe(resp => {
                    this.calendarEvents = resp.items;
                });
        } else {
            //this.appSession.user.healthFacilitiesId == null ? this.frmSearch.controls['healthfacilities'].setValue(null) : '';
            notifyToastr(this.l('Notification'), this.l('Bác sỹ không được để trống'), 'warning');
            // swal({
            //     title: this.l('Notification'),
            //     text: this.l('Bác sỹ không được để trống'),
            //     type: 'warning',
            //     timer: 3000
            // });
        }
    }

    //dialog detail 
    openDialog(obj): void {
        this.dialog.open(this.dialogTask, { minWidth: 'calc(100vw/2)', maxWidth: 'calc(100vw - 300px)', data: obj ? obj : null });
        //dialogRef.afterClosed().subscribe(() => this.paginator._changePageSize(this.paginator.pageSize));
    }

    //filter autocomplete
    displayFn(h?: IHealthfacilities): string | undefined {
        return h ? h.name : undefined;
    }

    inputUnitClick(){
        this.inputUnitTrigger.openPanel();
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

    filter(value: any) {
        var fValue = typeof value === 'string' ? value : (value ? value.name : '')
        this._healthfacilities = [];

        return this.dataService
            .get("healthfacilities", JSON.stringify({
                name: isNaN(fValue) ? fValue : "",
                code: !isNaN(fValue) ? fValue : ""
            }), '', null, null)
            .pipe(
                finalize(() => this.isLoading = false)
            )
    }

    onSelectHealthFacilities(obj: any) {
        this.frmSearch.controls['healthfacilities'].setValue(obj.healthFacilitiesId);
        this.frmSearch.controls['doctor'].setValue('');
        this._doctors = [];
        this.dataService.getAll('doctors', obj.healthFacilitiesId).subscribe(resp => this._doctors = resp.items);
    }

    //calendar
    handleEvent(obj: any) {
        if (obj.view.type == "listWeek") {
            var des = obj.event.extendedProps.description ? obj.event.extendedProps.description : "";
            obj.el.innerHTML = obj.el.innerHTML.split("<a>")[0] + des + "</a></td>";
        }
    }

    //filter
    toggedFilter() {
        const _filter = $('form.form-filter');
        if (_filter.length <= 0) { return; }
        this.showFilter = !this.showFilter;
        _filter.css({ 'height': this.showFilter ? 'auto' : 0, 'overflow': this.showFilter ? 'auto' : 'hidden' });
    }
}
