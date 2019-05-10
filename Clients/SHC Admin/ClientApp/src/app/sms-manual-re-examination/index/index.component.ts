import { AfterViewInit, Component, Injector, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { IMedicalHealthcareHistories, IHealthfacilities, IProvince, IDistrict, IWard } from '@shared/Interfaces';
import { DataService } from '@shared/service-proxies/service-data';
import { FormBuilder, FormControl } from '@angular/forms';
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { startWith, map, ignoreElements, debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { TaskComponent } from '@app/sms-template-task/task/task.component';

import * as moment from 'moment';
import swal from 'sweetalert2';

import { MatDialog, MatInput, MatDatepicker } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { startTimeRange } from '@angular/core/src/profile/wtf_impl';
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

    displayedColumns = ['orderNumber', 'select', 'code', 'name', 'birthday', 'age', 'gender', 'phoneNumber', 'address', 'ReExaminationDate', 'status'];

    _provinces = [];
    _districts = [];
    _wards = [];
    _doctors = [];
    _isRequest = false;
    _healthfacilities = [];
    _status = [{ id: 0, name: 'Tất cả' }, { id: 1, name: 'Đã gửi SMS' }, { id: 2, name: 'Chưa gửi SMS' }];
    _sex = [{ id: 0, name: 'Tất cả' }, { id: 1, name: 'Nam' }, { id: 2, name: 'Nữ' }, { id: 3, name: 'Không xác định' }];
    //_currentYear = new Date().getFullYear();

    isLoading = false;
    selection = new SelectionModel<IMedicalHealthcareHistories>(true, []);
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
    @ViewChild("endTime") endTime;
    @ViewChild("startTime") startTime;

    constructor(injector: Injector, private _dataService: DataService, public dialog: MatDialog, private _formBuilder: FormBuilder) {
        super(injector);
    }

    ngOnInit() {
        this.api = 'smsmanual';
        this.frmSearch = this._formBuilder.group({
            healthfacilities: [],
            doctor: [],
            status: [0],
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
            startTime: new Date(new Date().setDate(new Date().getDate())),
            endTime: new Date(new Date().setDate(new Date().getDate() + 3)),
            about: 3,
            flagReExamination: 0
        });

        this.dialogComponent = TaskComponent;
        this.dataService = this._dataService;
        this.frmSearch.controls['endTime'].setValue(new Date(new Date().setDate(new Date().getDate() + this.frmSearch.controls['about'].value)));
        this.frmSearch.controls['startTime'].setValue(new Date(new Date().setDate(new Date().getDate())));
        this.dataService.getAll('provinces').subscribe(resp => this._provinces = resp.items);



        if (this.appSession.user.healthFacilitiesId) {
            this.dataService.get("healthfacilities", JSON.stringify({ healthfacilitiesId: this.appSession.user.healthFacilitiesId }), '', null, null).subscribe(resp => { this._healthfacilities = resp.items; });
            this.dataService.getAll('doctors', String(this.appSession.user.healthFacilitiesId)).subscribe(resp => this._doctors = resp.items);

            setTimeout(() => {
                this.frmSearch.controls['healthfacilities'].setValue(this.appSession.user.healthFacilitiesId);
            }, 500);
        } else {
            this.filterOptions();
            this.healthfacilities.setValue(null);
        }

        setTimeout(() => {
            this.endTime.nativeElement.value = moment(new Date().setDate(new Date().getDate() + 3)).format("DD/MM/YYYY");
            this.startTime.nativeElement.value = moment(new Date().setDate(new Date().getDate())).format("DD/MM/YYYY");
            this.frmSearch.controls['about'].setValue(new Date().getDate() - new Date().getDate() + 3);
            this.startTime.nativeElement.focus();
            this.endTime.nativeElement.focus();
        });
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

    // onSelectProvince(obj: any) {
    //     this._districts = this._wards = [];
    //     this.frmSearch.patchValue({ districtCode: null, wardCode: null });
    //     const province = this._provinces.find((o: { provinceCode: string, name: string; }) => o.provinceCode === obj);
    //     if (province) { this.dataService.get('districts', JSON.stringify({ ProvinceCode: province.provinceCode }), '', 0, 0).subscribe(resp => this._districts = resp.items); }
    // }





    displayProvinceFn(h?: IProvince): string | undefined {
        return h ? h.name : undefined;
    }


    _filterProvince(name: any): IProvince[] {
        const filterValue = name.toLowerCase();
        var provinces = this._provinces.filter(c => c.name.toLowerCase().indexOf(filterValue) === 0);
        return provinces;
    }

    clickProvinceCbo() {
        !this.provinceCode.value ? this.filterProvinceOptions() : '';
    }



    filterProvinceOptions() {
        this.filteredProvinceOptions = this.provinceCode.valueChanges
            .pipe(
                startWith<string | IProvince>(''),
                map(name => name ? this._filterProvince(name.toString().trim()) : this._provinces.slice()),
                map(data => data.slice())
            );
    }

    @ViewChild('districtInput') districtInput;
    @ViewChild('wardInput') wardInput;

    onInputProvince(obj: any) {
        if (obj.data != " " || obj.inputType == "deleteContentBackward") {
            this._districts = [];
            this._wards = [];
            this.districtInput.nativeElement.value = "";
            this.wardInput.nativeElement.value = "";
            this._provinceCode = null;
            this._districtCode = null;
            this._wardCode = null;
        }
    }

    onSelectProvince(value: any) {
        if (value.provinceCode) {
            this._provinceCode = value.provinceCode;
            this.dataService.get('districts', JSON.stringify({ ProvinceCode: value.provinceCode }), '', 0, 0)
                .subscribe(resp => {
                    this._districts = resp.items;
                    this.districtCode.setValue(null);
                });
        }
    }

    //District

    displayDistrictFn(h?: IDistrict): string | undefined {
        return h ? h.name : undefined;
    }


    _filterDistrict(name: any): IDistrict[] {
        const filterValue = name.toLowerCase();
        var districts = this._districts.filter(c => c.name.toLowerCase().indexOf(filterValue) === 0);
        return districts;
    }

    clickDistrictCbo() {
        !this.districtCode.value ? this.filterDistrictOptions() : '';
    }



    filterDistrictOptions() {
        this.filteredDistrictOptions = this.districtCode.valueChanges
            .pipe(
                startWith<string | IDistrict>(''),
                map(name => name ? this._filterDistrict(name.toString().trim()) : this._districts.slice()),
                map(data => data.slice())
            );
    }

    onInputDistrict(obj: any) {
        if (obj.data != " " || obj.inputType == "deleteContentBackward") {
            this._wards = [];
            this.wardInput.nativeElement.value = "";
            this._districtCode = null;
            this._wardCode = null;
        }
    }

    onSelectDistrict(value: any) {
        if (value.districtCode) {
            this._districtCode = value.districtCode;
            this.dataService.get('wards', JSON.stringify({ DistrictCode: value.districtCode }), '', 0, 0)
                .subscribe(resp => {
                    this._wards = resp.items;
                    this.wardCode.setValue(null);
                });
        }
    }



    // onSelectDistrict(obj: any) {
    //     this._wards = [];
    //     this.frmSearch.patchValue({ wardCode: null });
    //     const district = this._districts.find((o: { districtCode: string, name: string; }) => o.districtCode === obj);
    //     if (district) { this.dataService.get('wards', JSON.stringify({ DistrictCode: district.districtCode }), '', 0, 0).subscribe(resp => this._wards = resp.items); }
    // }

    displayWardFn(h?: IWard): string | undefined {
        return h ? h.name : undefined;
    }


    _filterWard(name: any): IWard[] {
        const filterValue = name.toLowerCase();
        var wards = this._wards.filter(c => c.name.toLowerCase().indexOf(filterValue) === 0);
        return wards;
    }

    clickWardCbo() {
        !this.wardCode.value ? this.filterWardOptions() : '';
    }



    filterWardOptions() {
        this.filteredWardOptions = this.wardCode.valueChanges
            .pipe(
                startWith<string | IWard>(''),
                map(name => name ? this._filterWard(name.toString().trim()) : this._wards.slice()),
                map(data => data.slice())
            );
    }

    onInputWard(obj: any) {
        if (obj.data != " " || obj.inputType == "deleteContentBackward") {
            this._wardCode = null;
        }
    }

    onSelectWard(value: any) {
        if (value.wardCode) {
            this._wardCode = value.wardCode;
        }
    }


    changeDate(value: any, type: number) {
        if (this.startTime.nativeElement.value && moment(this.startTime.nativeElement.value, 'DD/MM/YYYY').isValid() && this.endTime.nativeElement.value && moment(this.endTime.nativeElement.value, 'DD/MM/YYYY').isValid()) {
            if (type == 2) {
                return this.endTime.nativeElement.value = moment(
                    new Date(
                        moment(this.startTime.nativeElement.value, 'DD/MM/YYYY').toDate().setDate(
                            moment(this.startTime.nativeElement.value, 'DD/MM/YYYY').toDate().getDate() + Number(value)))).format("DD/MM/YYYY");
            }

            var days = (moment(this.endTime.nativeElement.value, 'DD/MM/YYYY').valueOf() - moment(this.startTime.nativeElement.value, 'DD/MM/YYYY').valueOf()) / (1000 * 60 * 60 * 24);
        }

        this.frmSearch.controls['about'].setValue(days >= 0 ? days : 0);
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


    customSearch() {
        if (!this.endTime.nativeElement.value) {
            return swal({
                title: 'Thông báo',
                text: 'Đến ngày không được để trống',
                type: 'warning',
                timer: 3000
            });
        }

        if (moment(this.endTime.nativeElement.value, "DD/MM/YYYY") < moment(this.startTime.nativeElement.value, "DD/MM/YYYY")) {
            return swal({
                title: 'Thông báo',
                text: 'Ngày kết thúc không được nhỏ hơn ngày bắt đầu',
                type: 'warning',
                timer: 3000
            });
        }

        if (!moment(this.endTime.nativeElement.value, 'DD/MM/YYYY').isValid()) {
            return swal({
                title: 'Thông báo',
                text: 'Đến ngày không đúng định dạng',
                type: 'warning',
                timer: 3000
            });
        }

        if (!moment(this.startTime.nativeElement.value, 'DD/MM/YYYY').isValid()) {
            return swal({
                title: 'Thông báo',
                text: 'Từ ngày không đúng định dạng',
                type: 'warning',
                timer: 3000
            });
        }

        if (this.birthday.nativeElement.value && !moment(this.birthday.nativeElement.value, 'DD/MM/YYYY').isValid()) {
            return swal({
                title: 'Thông báo',
                text: 'Ngày sinh không đúng định dạng',
                type: 'warning',
                timer: 3000
            });
        }

        this.frmSearch.controls['provinceCode'].setValue(this._provinceCode);
        this.frmSearch.controls['districtCode'].setValue(this._districtCode);
        this.frmSearch.controls['wardCode'].setValue(this._wardCode);


        if (((moment(this.endTime.nativeElement.value, 'DD/MM/YYYY').valueOf() - moment(this.startTime.nativeElement.value, 'DD/MM/YYYY').valueOf()) / (1000 * 60 * 60 * 24)) < 0) {
            swal(this.l('Notification'), this.l('FromDateMustBeGreaterThanOrEqualToDate'), 'warning');
            return true;
        }

        var startTime = moment(this.startTime.nativeElement.value, 'DD/MM/YYYY').toDate(); //this.frmSearch.controls['startTime'].value, 'DD/MM/YYYY'
        var endTime = moment(this.endTime.nativeElement.value, 'DD/MM/YYYY').toDate();

        if (endTime.getFullYear() - startTime.getFullYear() > 1) {
            return swal({
                title: 'Thông báo',
                text: 'Dữ liệu không được lấy quá 1 năm',
                type: 'warning',
                timer: 3000
            });
        }
        if (endTime.getFullYear() - startTime.getFullYear() == 1) {
            var monthStartTime = startTime.getMonth() + 1;
            var monthEndTime = endTime.getMonth() + 1;
            if (12 - monthStartTime + monthEndTime > 12) {
                return swal({
                    title: 'Thông báo',
                    text: 'Dữ liệu không được lấy quá 1 năm',
                    type: 'warning',
                    timer: 3000
                });
            }
            if (12 - monthStartTime + monthEndTime == 12) {
                if (endTime.getDate() > startTime.getDate()) {
                    return swal({
                        title: 'Thông báo',
                        text: 'Dữ liệu không được lấy quá 1 năm',
                        type: 'warning',
                        timer: 3000
                    });
                }
            }
        }

        this.healthfacilities.value ? this.frmSearch.controls['healthfacilities'].setValue(this.healthfacilities.value.healthFacilitiesId) : (this.appSession.user.healthFacilitiesId == null ? this.frmSearch.controls['healthfacilities'].setValue(null) : '');

        this.birthday.nativeElement.value ? this.frmSearch.controls['birthdayDate'].setValue(moment(this.birthday.nativeElement.value, 'DD/MM/YYYY').toDate().getDate()) : this.frmSearch.controls['birthdayDate'].setValue('');

        this.birthday.nativeElement.value ? this.frmSearch.controls['birthdayMonth'].setValue(moment(this.birthday.nativeElement.value, 'DD/MM/YYYY').toDate().getMonth() + 1) : this.frmSearch.controls['birthdayMonth'].setValue('');

        this.startTime.nativeElement.value ? this.frmSearch.controls['startTime'].setValue(startTime) : '';
        this.endTime.nativeElement.value ? this.frmSearch.controls['endTime'].setValue(endTime) : '';

        this.btnSearchClicks$.next();
    }

    setValueBD() {
        this.frmSearch.controls['birthday'].setValue(moment(this.birthday.nativeElement.value, 'DD/MM/YYYY').toDate());
    }

    showMess(type: number) {
        if (type == 1) swal({
            title: 'Thông báo',
            text: 'Chưa chọn bệnh nhân',
            type: 'warning',
            timer: 3000
        });
    }

    openCustomDialog(): void {
        const dialogRef = this.dialog.open(this.dialogComponent, { minWidth: 'calc(100vw/2)', maxWidth: 'calc(100vw - 300px)', disableClose: true, data: { selection: this.selection, type: 1 } });

        dialogRef.afterClosed().subscribe(() => {
            this.paginator.pageIndex = 0;
            this.paginator._changePageSize(this.paginator.pageSize);
            this.selection = new SelectionModel<IMedicalHealthcareHistories>(true, []);
        });
    }

    sendSms() {

        this._isRequest = true;
        setTimeout(() => this._isRequest = false, 3000)

        if (this.appSession.user.healthFacilitiesId) {
            return this.openCustomDialog();
        }

        this._dataService.get('healthfacilitiesconfigs', JSON.stringify({
            code: "A01.SMSTAIKHAM",
            healthFacilitiesId: this.appSession.user.healthFacilitiesId
        }), '', 0, 0).subscribe(resp => {
            if (!resp || !resp.items) {
                return this.openCustomDialog();
            }

            abp.ui.setBusy('#main-container');
            this._dataService.create('infosms', {
                lstMedicalHealthcareHistories: this.selection.selected,
                healthFacilitiesId: this.appSession.user.healthFacilitiesId,
                smsTemplateId: resp.items.values,
                type: 1,
                content: ''
            })
                .subscribe(resp => {
                    swal({
                        title: 'Thông báo',
                        text: resp,
                        type: 'error',
                        timer: 3000
                    });
                    this.selection = new SelectionModel<IMedicalHealthcareHistories>(true, []);
                    abp.ui.clearBusy('#main-container');
                }, err => { });
        });
    }
}
