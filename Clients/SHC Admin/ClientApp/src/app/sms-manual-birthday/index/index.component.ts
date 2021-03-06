import { AfterViewInit, Component, Injector, OnInit, ViewEncapsulation, ViewChild, ElementRef, Type } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { IHealthfacilities, IMedicalHealthcareHistories } from '@shared/Interfaces';
import { DataService } from '@shared/service-proxies/service-data';
import { FormBuilder, FormControl } from '@angular/forms';
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { startWith, map, finalize, debounceTime, tap, switchMap, catchError } from 'rxjs/operators';
import { Observable, merge, of } from 'rxjs';
import { MatAutocompleteTrigger } from '@angular/material';
import { MatDialog, throwMatDialogContentAlreadyAttachedError } from '@angular/material';
import { TaskComponent } from '@app/sms-template-task/task/task.component';

import swal from 'sweetalert2';
import * as moment from 'moment';

import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { zipObject, isNil, omitBy } from 'lodash';
import { standardized, notifyToastr } from '@shared/helpers/utils';

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
export interface IProvince {
    provinceCode: string;
    name: string;
}

export interface IDistrict {
    districtCode: string;
    name: string;
}

export interface IWard {
    wardCode: string;
    name: string;
}

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

    displayedColumns = ['orderNumber', 'select', 'code', 'fullName', 'birthday', 'age', 'gender', 'phoneNumber', 'address', 'ReExaminationDate', 'status'];

    _provinces = [];
    _districts = [];
    _wards = [];
    _doctors = [];
    _isRequest = false;
    _healthfacilities = [];
    _status = [{ id: 0, name: 'Tất cả' }, { id: 1, name: 'Đã gửi SMS' }, { id: 2, name: 'Chưa gửi SMS' }];
    _sex = [{ id: 0, name: 'Tất cả' }, { id: 1, name: 'Nam' }, { id: 2, name: 'Nữ' }, { id: 3, name: 'Không xác định' }];
    _currentYear = new Date().getFullYear();
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


    _months = [{ id: 13, name: 'Tất cả' }, { id: 1, name: 'Tháng 1' }, { id: 2, name: 'Tháng 2' }, { id: 3, name: 'Tháng 3' }, { id: 4, name: 'Tháng 4' }, { id: 5, name: 'Tháng 5' }, { id: 6, name: 'Tháng 6' }, { id: 7, name: 'Tháng 7' }, { id: 8, name: 'Tháng 8' }, { id: 9, name: 'Tháng 9' }, { id: 10, name: 'Tháng 10' }, { id: 11, name: 'Tháng 11' }, { id: 12, name: 'Tháng 12' },];
    _days = [{ id: 32, name: 'Tất cả' }];

    _checkboxSelected: number[] = [];

    
    @ViewChild('inputUnit', { read: MatAutocompleteTrigger }) inputUnitTrigger: MatAutocompleteTrigger;

    constructor(injector: Injector, private _dataService: DataService, public dialog: MatDialog, private _formBuilder: FormBuilder) {
        super(injector);
    }

    ngOnInit() {
        this.api = 'smsmanualbirthday';
        this.frmSearch = this._formBuilder.group({
            healthfacilities: [],
            doctor: [],
            statusBirthday: [0],
            patientCode: [],
            patientName: [],
            insurrance: [],
            identification: [],
            phoneNumber: [],
            provinceCode: [],
            districtCode: [],
            wardCode: [],
            toDay: [32],
            toMonth: [13],
            fromDay: [32],
            fromMonth: [13],
            sex: [],
            about: 3,
            type: 'cmsn'
        });

        for (var i = 1; i < 32; i++) {
            if (i < 10) {
                var obj = { id: i, name: '0' + i };
            } else {
                var obj = { id: i, name: '' + i };
            }
            this._days.push(obj);
        }

        this.dataService = this._dataService;
        this.dialogComponent = TaskComponent;
        this.dataService.getAll('provinces').subscribe(resp => this._provinces = resp.items);

        if (this.appSession.user.healthFacilitiesId) {
            this.dataService.getAll('doctors', String(this.appSession.user.healthFacilitiesId)).subscribe(resp => this._doctors = resp.items);
            this.frmSearch.controls['healthfacilities'].setValue(this.appSession.user.healthFacilitiesId);
        } else {
            this.filterOptions();
            this.healthfacilities.setValue(null);
        }

        this.selection.onChange.subscribe(se => {
            se.added.forEach(e => {
                this._checkboxSelected.push(e.patientHistoriesId);
            });
            se.removed.forEach(e => {
                this._checkboxSelected = this._checkboxSelected.filter(ef => ef !== e.patientHistoriesId);
            });
        });
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
                this.selection.select(row);
            });
        
    }

    inputUnitClick(){
        this.inputUnitTrigger.openPanel();
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

    ngAfterViewInit(): void {
        const self = this;
        //this.dataSources.sort = this.sort;
        if (this.sort) {
            this.sort.sortChange.subscribe(() => {
                this.paginator.pageIndex = 0
            });
        }

        this.btnSearchClicks$.subscribe(() => this.paginator.pageIndex = 0);

        merge(this.sort.sortChange, this.paginator.page, this.btnSearchClicks$)
            .pipe(
                startWith({}),
                switchMap(() => {
                    setTimeout(() => this.isTableLoading = true, 0);
                    const sort = this.sort.active ? zipObject([this.sort.active], [this.sort.direction]) : {};
                    return this.dataService.get(this.api, JSON.stringify(standardized(omitBy(this.frmSearch.value, isNil), this.ruleSearch)), JSON.stringify(sort), this.paginator.pageIndex, this.paginator.pageSize);
                }),
                map((data: any) => {
                    setTimeout(() => this.isTableLoading = false, 500);
                    this.totalItems = data.totalCount;
                    return data.items;
                }),
                catchError(() => {
                    setTimeout(() => this.isTableLoading = false, 500);
                    return of([]);
                })
            ).subscribe(data => {
                this.dataSources.data = data;
                this.dataSources.data.forEach((e: IMedicalHealthcareHistories) => {
                    if (self._checkboxSelected.indexOf(e.patientHistoriesId) >= 0) {
                        self.selection.select(e);
                    }
                })
            });
        this.setTableHeight();
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



    // onSelectDistrict(obj: any) {
    //     this._wards = [];
    //     this.frmSearch.patchValue({ wardCode: null });
    //     const district = this._districts.find((o: { districtCode: string, name: string; }) => o.districtCode === obj);
    //     if (district) { this.dataService.get('wards', JSON.stringify({ DistrictCode: district.districtCode }), '', 0, 0).subscribe(resp => this._wards = resp.items); }
    // }

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
        this.healthfacilities.value ? this.frmSearch.controls['healthfacilities'].setValue(this.healthfacilities.value.healthFacilitiesId) : (this.appSession.user.healthFacilitiesId == null ? this.frmSearch.controls['healthfacilities'].setValue(null) : '');
        if (
            (this.frmSearch.controls['fromMonth'].value == 2 && this.frmSearch.controls['fromDay'].value > 29 && this.frmSearch.controls['fromDay'].value < 32) ||
            (this.frmSearch.controls['fromMonth'].value == 4 && this.frmSearch.controls['fromDay'].value > 30 && this.frmSearch.controls['fromDay'].value < 32) ||
            (this.frmSearch.controls['fromMonth'].value == 6 && this.frmSearch.controls['fromDay'].value > 30 && this.frmSearch.controls['fromDay'].value < 32) ||
            (this.frmSearch.controls['fromMonth'].value == 9 && this.frmSearch.controls['fromDay'].value > 30 && this.frmSearch.controls['fromDay'].value < 32) ||
            (this.frmSearch.controls['fromMonth'].value == 11 && this.frmSearch.controls['fromDay'].value > 30 && this.frmSearch.controls['fromDay'].value < 32)
        ) {
            return notifyToastr('Thông báo', "Ngày sinh từ không đúng định dạng", 'warning');
            //  swal({
            //     title: "Thông báo",
            //     text: "Ngày sinh từ không đúng định dạng",
            //     type: "warning",
            //     timer: 3000
            // });
        }

        if (
            (this.frmSearch.controls['toMonth'].value == 2 && this.frmSearch.controls['toDay'].value > 29 && this.frmSearch.controls['toDay'].value < 32) ||
            (this.frmSearch.controls['toMonth'].value == 4 && this.frmSearch.controls['toDay'].value > 30 && this.frmSearch.controls['toDay'].value < 32) ||
            (this.frmSearch.controls['toMonth'].value == 6 && this.frmSearch.controls['toDay'].value > 30 && this.frmSearch.controls['toDay'].value < 32) ||
            (this.frmSearch.controls['toMonth'].value == 9 && this.frmSearch.controls['toDay'].value > 30 && this.frmSearch.controls['toDay'].value < 32) ||
            (this.frmSearch.controls['toMonth'].value == 11 && this.frmSearch.controls['toDay'].value > 30 && this.frmSearch.controls['toDay'].value < 32)
        ) {
            return notifyToastr('Thông báo', "Ngày sinh đến không đúng định dạng", 'warning');
            //  swal({
            //     title: "Thông báo",
            //     text: "Ngày sinh đến không đúng định dạng",
            //     type: "warning",
            //     timer: 3000
            // });
        }
        // this.frmSearch.controls['provinceCode'].setValue(this._provinceCode);
        // this.frmSearch.controls['districtCode'].setValue(this._districtCode);
        // this.frmSearch.controls['wardCode'].setValue(this._wardCode);
        this.btnSearchClicks$.next();
    }

    showMess(type: number) {
        if (type == 1) notifyToastr('Thông báo', 'Chưa chọn bệnh nhân', 'warning');
        //  swal({
        //     title: 'Thông báo',
        //     text: 'Chưa chọn bệnh nhân',
        //     type: 'warning',
        //     timer: 3000
        // });
    }

    openCustomDialog(): void {
        const dialogRef = this.dialog.open(this.dialogComponent, { minWidth: 'calc(100vw/2)', maxWidth: 'calc(100vw - 300px)', disableClose: true, data: { selection: this.selection, type: 2, objectType: 1 } });

        dialogRef.afterClosed().subscribe(() => {
            this.paginator.pageIndex = 0;
            this.paginator._changePageSize(this.paginator.pageSize);
            this.selection.clear();
        });
    }

    sendSms() {
        this._isRequest = true;
        setTimeout(() => this._isRequest = false, 3000)

        if (!this.appSession.user.healthFacilitiesId) {
            return this.openCustomDialog();
        }
        this._dataService.get('healthfacilitiesconfigs', JSON.stringify({
            code: "A02.SMSSINHNHAT",
            healthFacilitiesId: this.appSession.user.healthFacilitiesId
        }), '', 0, 0).subscribe(resp => {
            if (!resp || !resp.items) {
                return this.openCustomDialog();
            }

            this._dataService.create('infosms', {
                lstMedicalHealthcareHistories: this.selection.selected,
                healthFacilitiesId: this.appSession.user.healthFacilitiesId,
                //smsTemplateId: resp.items.values,
                smsTemplateCode:resp.items.values,
                type: 2,
                content: '',
                objectType: 1
            }).subscribe(resp => {
                    notifyToastr('Thông báo', resp, 'error');
                    // swal({
                    //     title: 'Thông báo',
                    //     html: resp,
                    //     type: 'error',
                    //     timer: 3000
                    // });
                    this.selection = new SelectionModel<IMedicalHealthcareHistories>(true, []);
                    abp.ui.clearBusy('#main-container');
                }, err => { });
        });
    }
}
