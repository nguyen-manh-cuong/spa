import * as _ from 'lodash';
import * as moment from 'moment';
import swal from 'sweetalert2';

import { Component, Inject, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { IBookingDoctorsCalendars, IHealthfacilities } from '@shared/Interfaces';
import { MAT_DIALOG_DATA, MatDialogRef, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, getMatIconFailedToSanitizeLiteralError } from '@angular/material';

import { AppComponentBase } from '@shared/app-component-base';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { DataService } from '@shared/service-proxies/service-data';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { ValidationRule } from '@shared/common/common';

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
    selector: 'app-task',
    templateUrl: './task.component.html',
    styleUrls: ['./task.component.scss'],
    providers: [
        {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
        {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
    ],
})

export class TaskComponent extends AppComponentBase implements OnInit {
    _frm: FormGroup;
    _context: any;
    _healthfacilities: any[];
    _doctors = [];
    _timeSlot = [];
    _lstWorkingTimes = [];
    _lstTimeSlot: any[] = [];

    filteredOptions: Observable<IHealthfacilities[]>;
    healthfacilities = new FormControl();
    dataService: DataService;

    @ViewChild("startTime") startTime;
    @ViewChild("endTime") endTime;

    constructor(injector: Injector, private _dataService: DataService, private _formBuilder: FormBuilder, public dialogRef: MatDialogRef<TaskComponent>, @Inject(MAT_DIALOG_DATA) public bookingDoctorsCalendars: IBookingDoctorsCalendars) { super(injector); }

    ngOnInit() {
        const validationRule = new ValidationRule();

        this._context = {
            startTime: [moment(new Date().setHours(7, 0, 0, 0)).toDate(), Validators.required],
            endTime: [moment(new Date()).add(6, 'days').toDate],
            healthfacilities: [,Validators.required],
            doctor: [,Validators.required],
            address: [,[Validators.required, validationRule.hasValue]]
        };
        this._frm = this._formBuilder.group(this._context);
        this.dataService = this._dataService;
        this.dataService.getAll('healthfacilities', (this.appSession.user.healthFacilitiesId ? String(this.appSession.user.healthFacilitiesId) : '')).subscribe(resp => this._healthfacilities = resp.items);
        
        setTimeout(() => {
            this.startTime.nativeElement.value = moment(new Date()).format("DD/MM/YYYY");
            this.endTime.nativeElement.value = moment(new Date().setDate(new Date().getDate() + 6)).format("DD/MM/YYYY");
            this.startTime.nativeElement.focus();
            this.endTime.nativeElement.focus();
            this.getDate(this.startTime.nativeElement.value, this.endTime.nativeElement.value);
        }, 1000);
    }

    //filter autocomplete
    displayFn(h?: IHealthfacilities): string | undefined {
        return h ? h.name : undefined;
    }

    filterOptions() {
        this.filteredOptions = this.healthfacilities.valueChanges
            .pipe(
            startWith<string | IHealthfacilities>(''),
            map(value => typeof value === 'string' ? value : value.name),
            map(name => name ? this._filter(name) : this._healthfacilities.slice()),
            map(data => data.slice(0, 30))
        );
    }

    _filter(name: any): IHealthfacilities[] {
        const filterValue = name.toLowerCase();
        
        var healthfacilities = isNaN(filterValue) ?         
        this._healthfacilities.filter(h => h.name.toLowerCase().indexOf(filterValue) === 0) : 
        this._healthfacilities.filter(h => h.code.toLowerCase().indexOf(filterValue) === 0);
   
        return healthfacilities
    }

    clickCbo() {
        !this.healthfacilities.value ? this.filterOptions() : '';
    }

    onSelectHealthFacilities(obj: any) {
        this._doctors = this._timeSlot = [];
        this._frm.controls['doctor'].setValue(null);
        this.healthfacilities.value ? this._frm.controls['healthfacilities'].setValue(this.healthfacilities.value.healthFacilitiesId) : (this.appSession.user.healthFacilitiesId == null ? this._frm.controls['healthfacilities'].setValue(null) : '');

        setTimeout(() => {
            console.log(obj.healthFacilitiesId);
            this.dataService.getAll('doctors', obj.healthFacilitiesId).subscribe(resp => this._doctors = resp.items);
            this.dataService.getAll('bookingtimeslot', JSON.stringify({healthfacilities : obj.healthFacilitiesId})).subscribe(resp => this._timeSlot = resp.items);
        }, 500);
    }

    //hand click checkbox
    getTimeSlot(timeSlotId: any, date: any, checked: any){
        if(checked){
            this._lstTimeSlot.push({
                timeSlotId: timeSlotId, 
                date: date,
                dateTime: moment(date, 'DD/MM/YYYY')
            })
        } else{
            for (let i = 0; i < this._lstTimeSlot.length; i++) {
                if((this._lstTimeSlot[i].timeSlotId == timeSlotId) && (this._lstTimeSlot[i].date == date)) this._lstTimeSlot.splice(i, 1);
            }
        }
    }

    //
    submit(status: any) {
        if(this.checkDate()) return;
        if(!this._lstTimeSlot.length) return swal(this.l('Notification'), this.l('Lịch khám không được để trống'), 'warning');
        var params = this._frm.value;
        params.lstTimeSlot = this._lstTimeSlot;
        params.status = status;
        params.userId = this.appSession.userId;

        this._dataService.create("bookingdoctor", params).subscribe(() => {
            swal(this.l('SaveSuccess'), '', 'success');
            this.dialogRef.close();
        }, err => {})
    }

    //handle change
    changeDate(value: any, type: any) {
        if(!this.checkDate()){
            this.getDate(this.startTime.nativeElement.value, this.endTime.nativeElement.value);
            if(type == 1) this.startTime.nativeElement.value ? this._frm.controls['startTime'].setValue(moment(this.startTime.nativeElement.value + '00:00:00', 'DD/MM/YYYY hh:mm:ss').add(7, 'hours').toDate()) : '';
            if(type == 2) this.endTime.nativeElement.value ? this._frm.controls['endTime'].setValue(moment(this.endTime.nativeElement.value + '23:59:59', 'DD/MM/YYYY hh:mm:ss').add(7, 'hours').toDate()) : '';
        } 
    }

    checkDate(): boolean{
        if(!this.startTime.nativeElement.value || !this.endTime.nativeElement.value){
            swal(this.l('Notification'), this.l('FromDateToDateCannotBlank'), 'warning');
            return true;
        }

        if(!moment(this.startTime.nativeElement.value, 'DD/MM/YYYY').isValid()){
            swal(this.l('Notification'), this.l('FromDateIncorrectFormat'), 'warning');
            return true;
        }

        if(!moment(this.endTime.nativeElement.value, 'DD/MM/YYYY').isValid()){
            swal(this.l('Notification'), this.l('ToDateIncorrectFormat'), 'warning');
            return true;
        }
        
        if(((moment(this.endTime.nativeElement.value, 'DD/MM/YYYY').valueOf() - moment(this.startTime.nativeElement.value, 'DD/MM/YYYY').valueOf()) / (1000*60*60*24)) < 0){
            swal(this.l('Notification'), this.l('FromDateMustBeGreaterThanOrEqualToDate'), 'warning');
            return true;
        }

        if(((moment(this.endTime.nativeElement.value, 'DD/MM/YYYY').valueOf() - moment(this.startTime.nativeElement.value, 'DD/MM/YYYY').valueOf()) / (1000*60*60*24)) > 6){
            swal(this.l('Notification'), this.l('Không được vượt quá 7 ngày kể từ Từ ngày'), 'warning');
            return true;
        }

        return false;
    }

    getDate(startTime: string, endTime: string) {
        var start = moment(startTime, "DD/MM/YYYY").toDate();
        var end = moment(endTime, "DD/MM/YYYY").toDate();

        if(!moment(start).isValid || !moment(end).isValid) return console.log('isvalid');
        
        this._lstWorkingTimes = [];    
        var days = (moment(end).valueOf() - moment(start).valueOf()) / (1000*60*60*24);

        for (let i = 0; i <= days; i++) {
            var date = new Date(start.getFullYear(), start.getMonth(), start.getDate());
            date.setDate(date.getDate() + i);
        
            this._lstWorkingTimes.push({
                index: i,
                dayCol: this.getDayOfWeek(date.getDay()) + moment(date).format("DD/MM/YYYY"),
                date: moment(date).format("DD/MM/YYYY")
            });
        }
    }

    getDayOfWeek(day: number): string{
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
