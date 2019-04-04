import { AfterViewInit, Component, Injector, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { IHealthfacilities, IMedicalHealthcareHistories } from '@shared/Interfaces';
import { DataService } from '@shared/service-proxies/service-data';
import { FormBuilder, FormControl } from '@angular/forms';
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { startWith, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material';
import { TaskComponent } from '@app/sms-template-task/task/task.component';

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
export class IndexComponent extends PagedListingComponentBase<IMedicalHealthcareHistories> implements OnInit, AfterViewInit {

    displayedColumns = ['orderNumber', 'select', 'code', 'name', 'birthday', 'age', 'gender', 'phoneNumber', 'address', 'ReExaminationDate', 'status'];

    _provinces = [];
    _districts = [];
    _wards = [];
    _doctors = [];
    _healthfacilities = [];
    _status = [{ id: 0, name: 'Tất cả' }, { id: 1, name: 'Đã gửi SMS' }, { id: 2, name: 'Chưa gửi SMS' }];
    _currentYear = new Date().getFullYear();
    selection = new SelectionModel<IMedicalHealthcareHistories>(true, []);

    filteredOptions: Observable<IHealthfacilities[]>;
    healthfacilities = new FormControl();
    cDate = new Date();

    @ViewChild("birthdayFrom") birthdayFrom : ElementRef;
    @ViewChild("birthdayTo") birthdayTo : ElementRef;

    constructor(injector: Injector, private _dataService: DataService , public dialog: MatDialog, private _formBuilder: FormBuilder) {
        super(injector);
    }

    ngOnInit() {
        this.api = 'smsmanual';
        this.frmSearch = this._formBuilder.group({
            healthfacilities: [],
            doctor: [],
            statusB: [0],
            patientCode: [],
            patientName: [],
            insurrance: [],
            identification: [],
            phoneNumber: [],
            provinceCode: [],
            districtCode: [],
            wardCode: [],
            birthdayFrom: new Date(),
            birthdayTo: new Date(new Date().setDate(new Date().getDate() + 3)),
            male: [],
            female: [],
            about: 3
        });
        this.dataService = this._dataService;
        this.dialogComponent = TaskComponent;
        this.frmSearch.controls['birthdayTo'].setValue(new Date(new Date().setDate(new Date().getDate() + this.frmSearch.controls['about'].value)));
        this.dataService.getAll('provinces').subscribe(resp => this._provinces = resp.items);
        this.dataService.getAll('healthfacilities', (this.appSession.user.healthFacilitiesId ? String(this.appSession.user.healthFacilitiesId) : '')).subscribe(resp => this._healthfacilities = resp.items);
        if(this.appSession.user.healthFacilitiesId) this.dataService.getAll('doctors', String(this.appSession.user.healthFacilitiesId)).subscribe(resp => this._doctors = resp.items);

        setTimeout(() => {
            this.birthdayFrom.nativeElement.value = moment(new Date()).format("DD/MM/YYYY");
            this.birthdayTo.nativeElement.value = moment(new Date().setDate(new Date().getDate() + 3)).format("DD/MM/YYYY");
            this.birthdayTo.nativeElement.focus();
            this.birthdayFrom.nativeElement.focus();
        }, 500);
        this.appSession.user.healthFacilitiesId ? this.frmSearch.controls['healthfacilities'].setValue(this.appSession.user.healthFacilitiesId) : this.filterOptions();
    }

    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSources.data.length;
        return numSelected === numRows;
    }

    masterToggle() {
        this.isAllSelected() ?
            this.selection.clear() :
            this.dataSources.data.forEach((row: IMedicalHealthcareHistories) => {
                this.selection.select(row)
            });
    }

    onSelectHealthFacilities(obj: any) {
        this._doctors = [];
        this.dataService.getAll('doctors', obj.healthFacilitiesId).subscribe(resp => this._doctors = resp.items);
    }

    onSelectProvince(obj: any) {
        this._districts = this._wards = [];
        this.frmSearch.patchValue({ districtCode: null, wardCode: null });
        const province = this._provinces.find((o: { provinceCode: string, name: string; }) => o.provinceCode === obj);
        if (province) { this.dataService.get('districts', JSON.stringify({ ProvinceCode: province.provinceCode }), '', 0, 0).subscribe(resp => this._districts = resp.items); }
    }

    onSelectDistrict(obj: any) {
        this._wards = [];
        this.frmSearch.patchValue({ wardCode: null });
        const district = this._districts.find((o: { districtCode: string, name: string; }) => o.districtCode === obj);
        if (district) { this.dataService.get('wards', JSON.stringify({ DistrictCode: district.districtCode }), '', 0, 0).subscribe(resp => this._wards = resp.items); }
    }
  
    changeEndDate(value: any, type: number) {
        if(this.birthdayFrom.nativeElement.value && moment(this.birthdayFrom.nativeElement.value, 'DD/MM/YYYY').isValid() && this.birthdayTo.nativeElement.value && moment(this.birthdayTo.nativeElement.value, 'DD/MM/YYYY').isValid()){
            if(type == 2){     
                return this.birthdayTo.nativeElement.value = moment(
                    new Date(
                        moment(this.birthdayFrom.nativeElement.value, 'DD/MM/YYYY').toDate().setDate(
                            new Date().getDate() + Number(value)))).format("DD/MM/YYYY");
            }
    
            var days = (moment(this.birthdayTo.nativeElement.value, 'DD/MM/YYYY').valueOf() - moment(this.birthdayFrom.nativeElement.value, 'DD/MM/YYYY').valueOf()) / (1000*60*60*24);
        }
       
        this.frmSearch.controls['about'].setValue(days >= 0 ? days : 0); 
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
        if(!this.birthdayTo.nativeElement.value){
            return swal('Thông báo', 'Đến ngày không được để trống', 'warning');
        }

        if( !moment(this.birthdayTo.nativeElement.value, 'DD/MM/YYYY').isValid()){
            return swal('Thông báo', 'Đến ngày không đúng định dạng', 'warning');
        }

        if(!this.birthdayFrom.nativeElement.value){
            return swal('Thông báo', 'Từ ngày không được để trống', 'warning');
        }

        if( !moment(this.birthdayFrom.nativeElement.value, 'DD/MM/YYYY').isValid()){
            return swal('Thông báo', 'Từ ngày không đúng định dạng', 'warning');
        }

        this.healthfacilities.value ? this.frmSearch.controls['healthfacilities'].setValue(this.healthfacilities.value.healthFacilitiesId) : '';
        this.birthdayFrom.nativeElement.value ? this.frmSearch.controls['birthdayFrom'].setValue(moment(this.birthdayFrom.nativeElement.value + '00:00:00', 'DD/MM/YYYY hh:mm:ss').toDate()) : '';
        this.birthdayTo.nativeElement.value ? this.frmSearch.controls['birthdayTo'].setValue(moment(this.birthdayTo.nativeElement.value + '23:59:59', 'DD/MM/YYYY hh:mm:ss').toDate()) : '';
        this.btnSearchClicks$.next();
    }

    showMess(type: number) {
        if(type == 1 ) swal('Thông báo', 'Chưa chọn bệnh nhân', 'warning');
    }

    openCustomDialog(): void {
        const dialogRef = this.dialog.open(this.dialogComponent, { minWidth: 'calc(100vw/2)', maxWidth: 'calc(100vw - 300px)', disableClose: true, data: this.selection });
        
        dialogRef.afterClosed().subscribe(() => {
            this.paginator.pageIndex = 0;
            this.paginator._changePageSize(this.paginator.pageSize);
            this.selection = new SelectionModel<IMedicalHealthcareHistories>(true, []);
        });
    }

    sendSms(){
        if(!this.appSession.user.healthFacilitiesId){
            return this.openCustomDialog();
        }
        this._dataService.get('healthfacilitiesconfigs', JSON.stringify({ 
            code: "A02.SMSSINHNHAT",
            healthFacilitiesId: this.appSession.user.healthFacilitiesId
        }), '', 0, 0).subscribe(resp => {
            if(!resp || !resp.items){    
                return this.openCustomDialog();
            } 

            var lstPatient = [];
            this.selection.selected.forEach(el => {
                lstPatient.push(el.patient);
            })

            this._dataService.create('infosms', {
                lstPatient: lstPatient, 
                lstMedicalHealthcareHistories: this.selection.selected, 
                type: 2, 
                healthFacilitiesId: this.appSession.user.healthFacilitiesId, 
                content: '',
                smsTemplateId: resp.items.values 
            })
            .subscribe(resp => {
                swal('Thông báo', resp, 'error');
                this.selection = new SelectionModel<IMedicalHealthcareHistories>(true, []);
            }, err => {});
        });   
    }
}