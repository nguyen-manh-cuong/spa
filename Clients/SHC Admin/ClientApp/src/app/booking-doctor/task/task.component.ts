import * as _ from 'lodash';
import * as moment from 'moment';
import swal from 'sweetalert2';

import { Component, Inject, Injector, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { IBookingDoctorsCalendars, IHealthfacilities } from '@shared/Interfaces';
import { MAT_DIALOG_DATA, MatDialogRef, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, getMatIconFailedToSanitizeLiteralError, MatChipInputEvent, MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material';

import { AppComponentBase } from '@shared/app-component-base';
import { Observable } from 'rxjs';
import { startWith, map, debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { DataService } from '@shared/service-proxies/service-data';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { ValidationRule } from '@shared/common/common';
import {COMMA, ENTER} from '@angular/cdk/keycodes';


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
    _doctors = [];
    _timeSlot = [];
    _lstWorkingTimes = [];
    _lstTimeSlot: any[] = [];

    // //chips
    // _healthfacilitiesChip = [];
    // visible = true;
    // selectable = true;
    // removable = true;
    // addOnBlur = true;
    // separatorKeysCodes: number[] = [ENTER, COMMA];

    _healthfacilities: IHealthfacilities[] = [];
    filteredOptions: Observable<IHealthfacilities[]>;
    healthfacilities = new FormControl();
    dataService: DataService;
    isLoading = false;

    @ViewChild("startTime") startTime;
    @ViewChild("endTime") endTime;
    //chips
    // @ViewChild('healthfacilitiesInput') healthfacilitiesInput: ElementRef<HTMLInputElement>;
    // @ViewChild('auto') matAutocomplete: MatAutocomplete;

    constructor(injector: Injector, private _dataService: DataService, private _formBuilder: FormBuilder, public dialogRef: MatDialogRef<TaskComponent>, @Inject(MAT_DIALOG_DATA) public bookingDoctorsCalendars: IBookingDoctorsCalendars) { super(injector); }

    ngOnInit() {
        const validationRule = new ValidationRule();

        this._context = {
            startTime: [moment(new Date().setHours(7, 0, 0, 0)).toDate()],
            endTime: [moment(new Date()).add(6, 'days').toDate],
            healthfacilities: [this.appSession.user.healthFacilitiesId,Validators.required],
            doctor: [,Validators.required],
            address: [,[Validators.required, validationRule.hasValue]]
        };
        this._frm = this._formBuilder.group(this._context);
        this.dataService = this._dataService;

        if(this.appSession.user.healthFacilitiesId){
            this.dataService
            .get("healthfacilities", JSON.stringify({healthfacilitiesId : this.appSession.user.healthFacilitiesId}), '', null, null)
            .subscribe(resp => {
                this._healthfacilities = resp.items;
            });
            
            setTimeout(() => {
                this._frm.controls['healthfacilities'].setValue(this.appSession.user.healthFacilitiesId);
                this._frm.controls['address'].setValue(this._healthfacilities[0].address);
                this.onSelectHealthFacilities(this._healthfacilities[0]);
            }, 1000);
        } else{
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

    onSelectHealthFacilities(obj: any) {
        this._doctors = this._timeSlot = [];
        this._frm.controls['doctor'].setValue(null);
        this.healthfacilities.value ? this._frm.controls['healthfacilities'].setValue(this.healthfacilities.value.healthFacilitiesId) : (this.appSession.user.healthFacilitiesId == null ? this._frm.controls['healthfacilities'].setValue(null) : '');

        setTimeout(() => {
            this.dataService.getAll('doctors', obj.healthFacilitiesId).subscribe(resp => this._doctors = resp.items);
        }, 500);
    }

    onSelectDoctor(obj: any){
        this.dataService.getAll('bookingtimeslot', JSON.stringify({
            healthfacilities : this._frm.controls['healthfacilities'].value,
            doctorId : obj
        })).subscribe(resp => this._timeSlot = _.orderBy(resp.items, ['hoursStart'], ['asc']));
    }

    closed(): void {
        if(this.healthfacilities.value && typeof this.healthfacilities.value == 'string' && !this.healthfacilities.value.trim()) this.healthfacilities.setErrors({required: true})
    }

    // //chips
    // add(event: MatChipInputEvent): void {
    //     if (!this.matAutocomplete.isOpen) {
    //         const input = event.input;

    //         if (input) {
    //             input.value = '';
    //         }

    //         this.healthfacilities.setValue(null);
    //     }
    // }

    // remove(code: string): void {
    //     for (let i = 0; i < this._healthfacilitiesChip.length; i++) {
    //         if (this._healthfacilitiesChip[i].code == code) this._healthfacilitiesChip.splice(i, 1);
    //     }
    // }

    // selected(event: MatAutocompleteSelectedEvent): void {
    //     this._healthfacilitiesChip.push(event.option.value);
    //     this.healthfacilitiesInput.nativeElement.value = '';
    //     this.healthfacilities.setValue(null);
    // }

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
        if(!this._lstTimeSlot.length) return swal({title: this.l('Notification'), text: this.l('ExamScheduleNotNull'), type: 'warning', timer: 3000});
        
        var params = this._frm.value;
        params.lstTimeSlot = this._lstTimeSlot;
        params.status = status;
        params.userId = this.appSession.userId;

        this._dataService.create("bookingdoctor", params).subscribe(() => {
            swal({title: this.l('SaveSuccess'), text: '', type: 'success', timer: 3000});
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

    private greaterThanCurrentDate = false;
    private fromDateMustBeGreaterThanOrEqualToDate = false;
    private withinSevenDay = false;

    checkDate(): boolean{
        var toDay = new Date();

        if(!this.startTime.nativeElement.value || !this.endTime.nativeElement.value){
            //swal({title: this.l('Notification'), text: this.l('FromDateToDateCannotBlank'), type: 'warning', timer: 3000});
            return true;
        }

        if(!moment(this.startTime.nativeElement.value, 'DD/MM/YYYY').isValid()){
            //swal({title: this.l('Notification'), text: this.l('FromDateIncorrectFormat'), type: 'warning', timer: 3000});
            return true;
        }

        if(!moment(this.endTime.nativeElement.value, 'DD/MM/YYYY').isValid()){
            //swal({title: this.l('Notification'), text: this.l('ToDateIncorrectFormat'), type: 'warning', timer: 3000});
            return true;
        }
        
        if (moment(this.startTime.nativeElement.value, 'DD/MM/YYYY').toDate() < new Date(toDay.getFullYear(), toDay.getMonth(), toDay.getDate())) {
            //swal({title: this.l('Notification'), text: this.l('GreaterThanCurrentDate'), type: 'warning', timer: 3000});
            this.greaterThanCurrentDate = true;
        }
        else {
            this.greaterThanCurrentDate = false;
        }

        if (((moment(this.endTime.nativeElement.value, 'DD/MM/YYYY').valueOf() - moment(this.startTime.nativeElement.value, 'DD/MM/YYYY').valueOf()) / (1000 * 60 * 60 * 24)) < 0) {
            //swal({title: this.l('Notification'), text: this.l('FromDateMustBeGreaterThanOrEqualToDate'), type: 'warning', timer: 3000});
            this.fromDateMustBeGreaterThanOrEqualToDate = true;
        }
        else {
            this.fromDateMustBeGreaterThanOrEqualToDate = false;
        }

        if (((moment(this.endTime.nativeElement.value, 'DD/MM/YYYY').valueOf() - moment(this.startTime.nativeElement.value, 'DD/MM/YYYY').valueOf()) / (1000 * 60 * 60 * 24)) > 6) {
            //swal({title: this.l('Notification'), text: this.l('Within7Day'), type: 'warning', timer: 3000});
            this.withinSevenDay = true;
        }
        else {
            this.withinSevenDay = false;
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
