import { AfterViewInit, Component, Injector, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { IHealthfacilities, ISmsLogs } from '@shared/Interfaces';
import { DataService } from '@shared/service-proxies/service-data';
import { FormBuilder, FormControl } from '@angular/forms';
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
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

    displayedColumns = ['orderNumber', 'healthfacilitiesName', 'phoneNumber', 'type', 'content', 'sentDate', 'status', 'telco'];

    _healthfacilities: IHealthfacilities[] = [];
    _status = [{ id: 0, name: 'Tất cả' }, { id: 1, name: 'Thành công' }, { id: 2, name: 'Lỗi' }];
    _type = [{ id: 0, name: 'Tất cả' }, { id: 1, name: 'Gửi chủ động' }, { id: 2, name: 'Gửi tự động' }];
    _telco = [{ id: 0, name: 'Tất cả', code: 'all' }, { id: 1, name: 'Viettel', code: 'viettel' }, { id: 2, name: 'Vinaphone', code: 'vinaphone' }, { id: 3, name: 'Mobifone', code: 'mobifone' }, { id: 4, name: 'Vietnamobile', code: 'vietnamobile' }, { id: 5, name: 'Gmobile', code: 'gmobile' }];

    filteredOptions: Observable<IHealthfacilities[]>;
    healthfacilities = new FormControl();

    @ViewChild("startTime") startTime;
    @ViewChild("endTime") endTime;
    
    
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
            telco: []
        });
        this.dataService = this._dataService;
        this.dataService.getAll('healthfacilities', (this.appSession.user.healthFacilitiesId ? String(this.appSession.user.healthFacilitiesId) : '')).subscribe(resp => this._healthfacilities = resp.items);
        this.appSession.user.healthFacilitiesId ? this.frmSearch.controls['healthfacilities'].setValue(this.appSession.user.healthFacilitiesId) : this.filterOptions();
    }

    displayFn(h?: IHealthfacilities): string | undefined {
        return h ? h.name : undefined;
    }

    _filter(name: string): IHealthfacilities[] {
        const filterValue = name.toLowerCase();
        return this._healthfacilities.filter(h => h.name.toLowerCase().indexOf(filterValue) === 0);
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
                map(data => data.slice(0, 30))
            );
    }

    customSearch() {
        if(!this.endTime.nativeElement.value || !this.startTime.nativeElement.value){
            return swal('Thông báo', 'Ngày gửi từ và đến ngày không được để trống', 'warning');
        }
        
        if(!moment(this.startTime.nativeElement.value, 'DD/MM/YYYY').isValid()){
            return swal('Thông báo', 'Ngày gửi không đúng định dạng', 'warning');
        }

        if( !moment(this.endTime.nativeElement.value, 'DD/MM/YYYY').isValid()){
            return swal('Thông báo', 'Đến ngày không đúng định dạng', 'warning');
        }

        this.healthfacilities.value ? this.frmSearch.controls['healthfacilities'].setValue(this.healthfacilities.value.healthFacilitiesId) : '';
        this.startTime.nativeElement.value ? this.frmSearch.controls['startTime'].setValue(moment(this.startTime.nativeElement.value, 'DD/MM/YYYY hh:mm:ss').add(7, 'hours').toDate()) : '';
        this.endTime.nativeElement.value ? this.frmSearch.controls['endTime'].setValue(moment(this.endTime.nativeElement.value + '23:59:59:', 'DD/MM/YYYY hh:mm:ss').add(7, 'hours').toDate()) : '';
        this.btnSearchClicks$.next();
    }
}
