import { AfterViewInit, Component, Injector, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { IHealthfacilities, ISmsLogs, ISmsTemplate } from '@shared/Interfaces';
import { DataService } from '@shared/service-proxies/service-data';
import { FormBuilder, FormControl } from '@angular/forms';
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { Observable } from 'rxjs';
import { map, startWith, finalize, switchMap, tap, debounceTime } from 'rxjs/operators';
import swal from 'sweetalert2';
import * as moment from 'moment';

import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';

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
        {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
        {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
    ],
    encapsulation: ViewEncapsulation.None
})


export class IndexComponent extends PagedListingComponentBase<ISmsLogs> implements OnInit, AfterViewInit {
    settings = {
        bigBanner: true,
        timePicker: true,
        format: 'dd/MM/yyyy HH:mm',
        defaultOpen: false
    }

    displayedColumns = ['orderNumber', 'healthfacilitiesName', 'phoneNumber', 'type', 'content', 'sentDate', 'status', 'messageError', 'telco', '_smsTemplateContent'];

    _smsTemplate: ISmsTemplate[] = [];
    _healthfacilities: IHealthfacilities[] = [];
    _status = [{ id: 0, name: 'Tất cả' }, { id: 1, name: 'Thành công' }, { id: 2, name: 'Lỗi' }];
    _type = [{ id: 0, name: 'Tất cả' }, { id: 1, name: 'Gửi chủ động' }, { id: 2, name: 'Gửi tự động' }];
    _telco = [{ id: 0, name: 'Tất cả', code: 'all' }, { id: 1, name: 'Viettel', code: 'viettel' }, { id: 2, name: 'Vinaphone', code: 'vinaphone' }, { id: 3, name: 'Mobifone', code: 'mobifone' }, { id: 4, name: 'Vietnamobile', code: 'vietnamobile' }, { id: 5, name: 'Gmobile', code: 'gmobile' }];

    isLoading = false;
    filteredOptions: Observable<IHealthfacilities[]>;
    healthfacilities = new FormControl();
    smsTemplate = new FormControl();

    //@ViewChild("startTime") startTime;
    //@ViewChild("endTime") endTime;
    startDate = new Date();
    endDate = new Date();

    _checkSession = false;

    _startDate = moment(new Date()).format('DD/MM/YYYY HH:mm');
    _endDate = moment(new Date()).format('DD/MM/YYYY HH:mm');

    constructor(injector: Injector, private _dataService: DataService /*, public dialog: MatDialog*/, private _formBuilder: FormBuilder) {
        super(injector);
    }

    ngOnInit() {
        this.api = 'smslog';
        this.frmSearch = this._formBuilder.group({
            healthfacilities: [],
            phoneNumber: [],
            status: [],
            startTime: [],
            endTime: [],
            type: [],
            telco: [],
            smsTemplate: []
        });
        
        setTimeout(() => {
            //this.startTime.nativeElement.value = moment(new Date()).format("DD/MM/YYYY");
            //this.endTime.nativeElement.value = moment(new Date()).format("DD/MM/YYYY");
            //this.startTime.nativeElement.focus();
            //this.endTime.nativeElement.focus();
            this.customSearch();
        });

        this.dataService = this._dataService;

        this.dataService.getAll('sms-templates', JSON.stringify({'checkGetList' : '1'}), '').subscribe(resp => {
            console.log(resp.items);
            this._smsTemplate = resp.items;
        });

        if (this.appSession.user.healthFacilitiesId) {
            this._checkSession = true;

            this.dataService.get("healthfacilities", JSON.stringify({ healthfacilitiesId: this.appSession.user.healthFacilitiesId }), '', null, null).subscribe(resp => {
                this._healthfacilities = resp.items;
                this.frmSearch.controls['healthfacilities'].setValue(this._healthfacilities[0].healthFacilitiesId);
            });
          } else{
            this.filterOptions();
            this.healthfacilities.setValue(null);
          }
    }

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

    customSearch() {
        //if(!this.endTime.nativeElement.value || !this.startTime.nativeElement.value){
        //    return swal({
        //        title:'Thông báo', 
        //        text:'Ngày gửi từ và Đến ngày không được để trống', 
        //        type:'warning',
        //        timer:3000});
        //}
        
        //if(!moment(this.startTime.nativeElement.value, 'DD/MM/YYYY').isValid()){
        //    return swal({
        //        title:'Thông báo', 
        //        text:'Ngày gửi không đúng định dạng', 
        //        type:'warning',
        //        timer:3000});
        //}

        //if( !moment(this.endTime.nativeElement.value, 'DD/MM/YYYY').isValid()){
        //    return swal({
        //        title:'Thông báo', 
        //        text:'Đến ngày không đúng định dạng', 
        //        type:'warning',
        //        timer:3000});
        //}

        //if(((moment(this.endTime.nativeElement.value, 'DD/MM/YYYY').valueOf() - moment(this.startTime.nativeElement.value, 'DD/MM/YYYY').valueOf()) / (1000*60*60*24)) < 0){
        //    swal(this.l('Notification'), this.l('FromDateMustBeGreaterThanOrEqualToDate'), 'warning');
        //    return true;
        //}

        //var startTime = moment(this.startTime.nativeElement.value + '00:00:00', 'DD/MM/YYYY hh:mm:ss').add(7, 'hours').toDate();
        //var endTime = moment(this.endTime.nativeElement.value + '23:59:59:', 'DD/MM/YYYY hh:mm:ss').add(7, 'hours').toDate();
        console.log(1, this.startDate);
        console.log(2, this.endDate);

        this._startDate = moment(this.startDate).format('DD/MM/YYYY HH:mm');
        this._endDate = moment(this.endDate).format('DD/MM/YYYY HH:mm');

        console.log(1, this._startDate);
        console.log(2, this._endDate);

        if (this._endDate < this._startDate) {
            return swal(this.l('Notification'), this.l('FromDateMustBeGreaterThanOrEqualToDate'), 'warning');
        }

        let yearStart = parseInt(this._startDate.slice(6, 10));
        let yearEnd = parseInt(this._endDate.slice(6, 10));

        if (yearEnd - yearStart > 1 ) {
            return swal({
                title:'Thông báo', 
                text:'Dữ liệu không được lấy quá 1 năm',
                type: 'warning',
                timer:3000});
        }
        if (yearEnd - yearStart == 1) {
            let monthStartTime = parseInt(this._startDate.slice(4, 6));
            let monthEndTime = parseInt(this._endDate.slice(4, 6));
            if (monthEndTime > monthStartTime) {
                return swal({
                    title:'Thông báo', 
                    text:'Dữ liệu không được lấy quá 1 năm', 
                    type:'warning',
                    timer:3000});
            }
            if (monthStartTime == monthEndTime) {
                let dateStartTime = parseInt(this._startDate.slice(1, 3));
                let dateEndTime = parseInt(this._endDate.slice(1, 3));
                if (dateStartTime < dateEndTime) {
                    return swal({
                        title:'Thông báo', 
                        text:'Dữ liệu không được lấy quá 1 năm', 
                        type:'warning',
                        timer:3000});
                }
            }
        }

        if (this._checkSession) {
            this.frmSearch.controls['healthfacilities'].setValue(this.appSession.user.healthFacilitiesId);
        }
        else {
            this.healthfacilities.value ? this.frmSearch.controls['healthfacilities'].setValue(this.healthfacilities.value.healthFacilitiesId) : '';
        }
        
        this.smsTemplate.value ? this.frmSearch.controls['smsTemplate'].setValue(this.smsTemplate.value) : '';
        this.frmSearch.controls['startTime'].setValue(this._startDate);
        this.frmSearch.controls['endTime'].setValue(this._endDate);
        this.btnSearchClicks$.next();
    }
}
