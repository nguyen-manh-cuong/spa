import { AfterViewInit, Component, Injector, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { IPatient, IHealthfacilities, IMedicalHealthcareHistories, IProvince, IDistrict, IWard } from '@shared/Interfaces';
import { DataService } from '@shared/service-proxies/service-data';
import { FormBuilder, FormControl } from '@angular/forms';
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { MatDialog } from '@angular/material/dialog';
import { TaskComponent } from '@app/sms-template-task/task/task.component';
import { DetailComponent } from './../detail/detail.component';
import { Observable } from 'rxjs';
import { MatPaginator, MatSort } from '@angular/material';
import { startWith, map, finalize, switchMap, debounceTime, tap } from 'rxjs/operators';

import * as moment from 'moment';
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
    encapsulation: ViewEncapsulation.None
})
export class IndexComponent extends PagedListingComponentBase<IMedicalHealthcareHistories> implements OnInit, AfterViewInit {

    displayedColumns = ['orderNumber', 'select', 'code', 'fullName', 'birthday', 'age', 'gender', 'phoneNumber', 'address', 'smsCount'];

    _provinces = [];
    _districts = [];
    _wards = [];
    _doctors = [];
    _healthfacilities = [];
    _currentYear = new Date().getFullYear();
    _sex = [{ id: 0, name: 'Tất cả' }, { id: 1, name: 'Nam' }, { id: 2, name: 'Nữ' }, { id: 3, name: 'Không xác định' }];
    selection = new SelectionModel<IMedicalHealthcareHistories>(true, []);

    isLoading = false;
    filteredOptions: Observable<IHealthfacilities[]>;
    healthfacilities = new FormControl();
    cDate = new Date();

    filteredProvinceOptions: Observable<IProvince[]>;
    provinceCode = new FormControl();
    _provinceCode: string;
  
    filteredDistrictOptions: Observable<IDistrict[]>;
    districtCode = new FormControl();
    _districtCode: string;
  
    filteredWardOptions: Observable<IWard[]>;
    wardCode = new FormControl();
    _wardCode: string;

    @ViewChild("birthday") birthday;

    dialogDetail: any;

    constructor(injector: Injector, private _dataService: DataService, public dialog: MatDialog, private _formBuilder: FormBuilder) {
        super(injector);
    }

    ngOnInit() {
        this.api = 'smsmanual';
        this.frmSearch = this._formBuilder.group({
            healthfacilities: [],
            doctor: [],
            patientCode: [],
            patientName: [],
            insurrance: [],
            identification: [],
            phoneNumber: [],
            provinceCode: [],
            districtCode: [],
            wardCode: [],
            birthdayDate: [],
            birthdayMonth: [],
            birthday: [],
            sex: [],
        });

        this.dialogComponent = TaskComponent;
        this.dataService = this._dataService;
        this.dataService.getAll('provinces').subscribe(resp => this._provinces = resp.items);

        if(this.appSession.user.healthFacilitiesId){
            this.dataService.get("healthfacilities", JSON.stringify({healthfacilitiesId : this.appSession.user.healthFacilitiesId}), '', null, null).subscribe(resp => {this._healthfacilities = resp.items;});
            this.dataService.getAll('doctors', String(this.appSession.user.healthFacilitiesId)).subscribe(resp => this._doctors = resp.items);
    
            setTimeout(() => {
              this.frmSearch.controls['healthfacilities'].setValue(this.appSession.user.healthFacilitiesId);
            }, 500);
        } else{
            this.filterOptions();
            this.healthfacilities.setValue(null);
        }

        this.dialogDetail = DetailComponent;
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
                console.log(row);
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

    // onSelectDistrict(obj: any) {
    //     this._wards = [];
    //     this.frmSearch.patchValue({ wardCode: null });
    //     const district = this._districts.find((o: { districtCode: string, name: string; }) => o.districtCode === obj);
    //     if (district) { this.dataService.get('wards', JSON.stringify({ DistrictCode: district.districtCode }), '', 0, 0).subscribe(resp => this._wards = resp.items); }
    // }

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

    // displayProvinceFn(h?: IProvince): string | undefined {
    //     return h ? h.name : undefined;
    // }


    // _filterProvince(name: any): IProvince[] {
    //     const filterValue = name.toLowerCase();
    //     var provinces = this._provinces.filter(c => c.name.toLowerCase().indexOf(filterValue) === 0);
    //     return provinces;
    // }

    // clickProvinceCbo() {
    //     !this.provinceCode.value ? this.filterProvinceOptions() : '';
    // }



    // filterProvinceOptions() {
    //     this.filteredProvinceOptions = this.provinceCode.valueChanges
    //         .pipe(
    //             startWith<string | IProvince>(''),
    //             map(name => name ? this._filterProvince(name.toString().trim()) : this._provinces.slice()),
    //             map(data => data.slice())
    //         );
    // }

    // @ViewChild('districtInput') districtInput;
    // @ViewChild('wardInput') wardInput;

    // onInputProvince(obj: any) {
    //     if (obj.data != " " || obj.inputType == "deleteContentBackward") {
    //         this._districts = [];
    //         this._wards = [];
    //         this.districtInput.nativeElement.value = "";
    //         this.wardInput.nativeElement.value = "";
    //         this._provinceCode = null;
    //         this._districtCode = null;
    //         this._wardCode = null;
    //     }
    // }

    // onSelectProvince(value: any) {
    //     if (value.provinceCode) {
    //         this._provinceCode = value.provinceCode;
    //         this.dataService.get('districts', JSON.stringify({ ProvinceCode: value.provinceCode }), '', 0, 0)
    //             .subscribe(resp => {
    //                 this._districts = resp.items;
    //                 this.districtCode.setValue(null);
    //             });
    //     }
    // }

    //District

    // displayDistrictFn(h?: IDistrict): string | undefined {
    //     return h ? h.name : undefined;
    // }


    // _filterDistrict(name: any): IDistrict[] {
    //     const filterValue = name.toLowerCase();
    //     var districts = this._districts.filter(c => c.name.toLowerCase().indexOf(filterValue) === 0);
    //     return districts;
    // }

    // clickDistrictCbo() {
    //     !this.districtCode.value ? this.filterDistrictOptions() : '';
    // }



    // filterDistrictOptions() {
    //     this.filteredDistrictOptions = this.districtCode.valueChanges
    //         .pipe(
    //             startWith<string | IDistrict>(''),
    //             map(name => name ? this._filterDistrict(name.toString().trim()) : this._districts.slice()),
    //             map(data => data.slice())
    //         );
    // }

    // onInputDistrict(obj: any) {
    //     if (obj.data != " " || obj.inputType == "deleteContentBackward") {
    //         this._wards = [];
    //         this.wardInput.nativeElement.value = "";
    //         this._districtCode = null;
    //         this._wardCode = null;
    //     }
    // }

    // onSelectDistrict(value: any) {
    //     if (value.districtCode) {
    //         this._districtCode = value.districtCode;
    //         this.dataService.get('wards', JSON.stringify({ DistrictCode: value.districtCode }), '', 0, 0)
    //             .subscribe(resp => {
    //                 this._wards = resp.items;
    //                 this.wardCode.setValue(null);
    //             });
    //     }
    // }



    onSelectDistrict(obj: any) {
        this._wards = [];
        this.frmSearch.patchValue({ wardCode: null });
        const district = this._districts.find((o: { districtCode: string, name: string; }) => o.districtCode === obj);
        if (district) { this.dataService.get('wards', JSON.stringify({ DistrictCode: district.districtCode }), '', 0, 0).subscribe(resp => this._wards = resp.items); }
    }

    // displayWardFn(h?: IWard): string | undefined {
    //     return h ? h.name : undefined;
    // }


    // _filterWard(name: any): IWard[] {
    //     const filterValue = name.toLowerCase();
    //     var wards = this._wards.filter(c => c.name.toLowerCase().indexOf(filterValue) === 0);
    //     return wards;
    // }

    // clickWardCbo() {
    //     !this.wardCode.value ? this.filterWardOptions() : '';
    // }



    // filterWardOptions() {
    //     this.filteredWardOptions = this.wardCode.valueChanges
    //         .pipe(
    //             startWith<string | IWard>(''),
    //             map(name => name ? this._filterWard(name.toString().trim()) : this._wards.slice()),
    //             map(data => data.slice())
    //         );
    // }

    // onInputWard(obj: any) {
    //     if (obj.data != " " || obj.inputType == "deleteContentBackward") {
    //         this._wardCode = null;
    //     }
    // }

    // onSelectWard(value: any) {
    //     if (value.wardCode) {
    //         this._wardCode = value.wardCode;
    //     }
    // }

    customSearch() {
        if (this.birthday.nativeElement.value && !moment(this.birthday.nativeElement.value, 'DD/MM/YYYY').isValid()) {
            return swal({
                title: 'Thông báo',
                text: 'Ngày sinh không đúng định dạng',
                type: 'warning',
                timer: 3000
            });
        }

        // this.frmSearch.controls['provinceCode'].setValue(this._provinceCode);
        // this.frmSearch.controls['districtCode'].setValue(this._districtCode);
        // this.frmSearch.controls['wardCode'].setValue(this._wardCode);

        this.healthfacilities.value ? this.frmSearch.controls['healthfacilities'].setValue(this.healthfacilities.value.healthFacilitiesId) : (this.appSession.user.healthFacilitiesId == null ? this.frmSearch.controls['healthfacilities'].setValue(null) : '');

        this.birthday.nativeElement.value ? this.frmSearch.controls['birthdayDate'].setValue(moment(this.birthday.nativeElement.value, 'DD/MM/YYYY').toDate().getDate()) : this.frmSearch.controls['birthdayDate'].setValue('');

        this.birthday.nativeElement.value ? this.frmSearch.controls['birthdayMonth'].setValue(moment(this.birthday.nativeElement.value, 'DD/MM/YYYY').toDate().getMonth() + 1) : this.frmSearch.controls['birthdayMonth'].setValue('');

        this.btnSearchClicks$.next();
    }

    showMess() {
        swal({
            title: 'Thông báo',
            text: 'Chưa chọn bệnh nhân',
            type: 'warning',
            timer: 3000
        });
    }

    openCustomDialog(): void {
        console.log(this.selection);
        const dialogRef = this.dialog.open(this.dialogComponent, { minWidth: 'calc(100vw/2)', maxWidth: 'calc(100vw - 300px)', disableClose: true, data: { selection: this.selection, type: 3, objectType: 1} });

        dialogRef.afterClosed().subscribe(() => {
            this.paginator.pageIndex = 0;
            this.paginator._changePageSize(this.paginator.pageSize);

            this.selection = new SelectionModel<IMedicalHealthcareHistories>(true, []);
        });
    }

    detail(obj): void {
        const dialogRef = this.dialog.open(this.dialogDetail, { minWidth: 'calc(100vw/2)', maxWidth: 'calc(100vw - 300px)', data: obj});
        dialogRef.afterClosed().subscribe(() => this.paginator._changePageSize(this.paginator.pageSize));
    }
}
