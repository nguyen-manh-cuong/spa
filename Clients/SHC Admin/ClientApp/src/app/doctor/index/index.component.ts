import { IHealthfacilities } from './../../../../../../SHC Outside/ClientApp/src/shared/Interfaces';
import { IDoctor } from './../../../../../../SHC Client/ClientApp/src/shared/Interfaces';
import { ICategoryCommon } from './../../../shared/Interfaces';
import { AfterViewInit, Component, Injector, OnInit, ViewChild, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatButton, MatDialog, MatDialogRef, MatSort, MatCheckbox, MatInput, AUTOCOMPLETE_OPTION_HEIGHT, MatSelect } from '@angular/material';
import { Subject, merge, of, Observable } from 'rxjs';
import { catchError, map, startWith, switchMap, debounceTime, finalize, tap } from 'rxjs/operators';
import { compact, isEmpty, omitBy, zipObject } from 'lodash';
import * as _ from 'lodash';
import { DataService } from '@shared/service-proxies/service-data';
import { ILanguage, IBookingTimeslots } from '@shared/Interfaces';
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { TaskComponent, Specialist } from '../task/task.component';
import swal from 'sweetalert2';
import { start } from 'repl';
import { DetailComponent } from '../detail/detail.component';
import { HttpHeaders, HttpClient } from '@angular/common/http';



export class DoctorEntityDto {
  doctorId: number;
}

export class EntityDto {
  id: number;
}

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent extends PagedListingComponentBase<ICategoryCommon> implements OnInit {
  dialogDetail: any;

  provinces = [];
  districts = [];
  checkProvince = false;
  _healthfacilities = [];
  _specialist = [];
  _healthFacilitiesId: number;
  _specialistCode: number;

  isLoading: boolean;
  filteredHealthFacilitiesOptions: Observable<IHealthfacilities[]>;
  filteredSpecialistOptions: Observable<ICategoryCommon[]>;
  healthfacilities = new FormControl();
  specialistCode = new FormControl();

  displayedColumns = ['orderNumber', 'fullName', 'specialist', 'phoneNumber', 'address', 'priceFrom', 'allowBooking', 'allowFilter', 'allowSearch', 'task'];

  constructor(injector: Injector, private _dataService: DataService, public dialog: MatDialog, private _formBuilder: FormBuilder) { super(injector); }


  ngOnInit() {
    this.api = 'doctor';
    this.dataService = this._dataService;
    this.dialogComponent = TaskComponent;
    this.dialogDetail = DetailComponent;

    this.frmSearch = this._formBuilder.group({ provinceCode: [], districtCode: [], info: [], healthfacilitiesId: [], specialistCode: [] });

    this.getProvinces();
    this.getSpecialist();

    if (this.appSession.user.healthFacilitiesId) {
      this.dataService.getAll('healthfacilities', "{healthfacilitiesId:" + String(this.appSession.user.healthFacilitiesId) + "}").subscribe(resp => this._healthfacilities = resp.items);
      this.frmSearch.controls['healthfacilitiesId'].setValue(this.appSession.user.healthFacilitiesId);
    }
  }
  showErrorDeleteMessage() {
    swal({
      title: this.l('ErrorDelete'),
      text: this.l('DoctorErrorDeleted', ''),
      type: 'error',
      timer: 3000
    });
  }

  deleteDialogDoctor(obj: DoctorEntityDto, key: string, doctorId?: number | string) {
    swal({
      title: this.l('AreYouSure'),
      html: this.l('DeleteWarningMessage', obj[key]),
      type: 'warning',
      showCancelButton: true,
      confirmButtonClass: 'mat-raised-button mat-primary bg-danger',
      cancelButtonClass: 'mat-button',
      confirmButtonText: this.l('YesDelete'),
      cancelButtonText: this.l('Cancel'),
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {
        this.dataService.delete(this.api, obj[doctorId ? doctorId : 'doctorId']).subscribe(() => {
          swal({
            title: this.l('SuccessfullyDeleted'),
            html: this.l('DeletedInSystem', obj[key]),
            type: 'success',
            timer: 3000
          });
          this.paginator.pageIndex = 0;
          this.paginator._changePageSize(this.paginator.pageSize);
        });
      }
    })
  }

  getProvinces() {
    this._dataService.getAll("provinces").subscribe(resp => this.provinces = resp.items);
  }

  getDistricts(provinceCode) {
    this._dataService.getAll("districts", "{ProvinceCode:" + provinceCode + "}").subscribe(resp => this.districts = resp.items);
  }

  provinceChange($event) {
    this.frmSearch.patchValue({ districtCode: null });
    if ($event.value != undefined) {
      this.getDistricts($event.value);
      this.checkProvince = true;
      this.getHealthfacilities($event.value);
    }
    else {
      this.checkProvince = false;
      this.districts = null;
      if (!this.appSession.user.healthFacilitiesId)
        this._healthfacilities = null;
    }
  }

  districtChange(province, $event) {
    this.getHealthfacilities(province.value, $event.value);
  }

  resetSearch() {
    this.provinces = null;
    this._specialist = null;

    if (!this.appSession.user.healthFacilitiesId) {
      this._healthfacilities = null;
    }
  }

  doctorUpdateAllowBooking(obj?: IDoctor): void {
    if (obj.allowBooking == false) {
      swal({
        title: this.l('AreYouSure'),
        html: this.l('DoctorTitle') + ' ' + obj.fullName + ' ' + this.ll('DoctorUpdateAllowBookingWarningMessage'),
        type: 'warning',
        showCancelButton: true,
        confirmButtonClass: 'mat-raised-button mat-primary bg-danger',
        cancelButtonClass: 'mat-button',
        confirmButtonText: this.l('YesUpdate'),
        cancelButtonText: this.l('Cancel'),
        buttonsStyling: false
      }).then((result) => {
        if (result.value) {
          obj.allowBooking = !obj.allowBooking;
          obj.updateUserId = this.appSession.userId;
          this.dataService.updateMini(this.api + "?allow=1", obj).subscribe(() => {
            swal({
              title: this.l('DoctorUpdateAllowCompleteTitle'),
              text: this.l('DoctorTitle') + ' ' + obj.fullName + ' ' + this.ll('DoctorUpdateAllowBookingSuccessfully', obj.fullName),
              type: 'success',
              timer: 3000
            });
            this.paginator.pageIndex = 0;
            this.paginator._changePageSize(this.paginator.pageSize);
          });
          this.resetSearch();
          this.ngOnInit();
        }
      });
    }
    else {
      swal({
        title: this.l('AreYouSure'),
        html: this.l('DoctorTitle') + ' ' + obj.fullName + ' ' + this.ll('DoctorCancelAllowBookingWarningMessage'),
        type: 'warning',
        showCancelButton: true,
        confirmButtonClass: 'mat-raised-button mat-primary bg-danger',
        cancelButtonClass: 'mat-button',
        confirmButtonText: this.l('YesUpdate'),
        cancelButtonText: this.l('Cancel'),
        buttonsStyling: false
      }).then((result) => {
        if (result.value) {
          obj.allowBooking = !obj.allowBooking;
          obj.updateUserId = this.appSession.userId;
          this.dataService.updateMini(this.api + "?allow=1", obj).subscribe(() => {
            swal({
              title: this.l('DoctorUpdateAllowCompleteTitle'),
              text: this.l('DoctorTitle') + ' ' + obj.fullName + ' ' + this.ll('DoctorCancelAllowBookingSuccessfully', obj.fullName),
              type: 'success',
              timer: 3000
            });
            this.paginator.pageIndex = 0;
            this.paginator._changePageSize(this.paginator.pageSize);
          });
          this.resetSearch();
          this.ngOnInit();
        }
      });
    }
  }

  doctorUpdateAllowFilter(obj?: IDoctor): void {
    if (obj.allowFilter == false) {
      swal({
        title: this.l('AreYouSure'),
        html: this.l('DoctorTitle') + ' ' + obj.fullName + ' ' + this.ll('DoctorUpdateAllowFilterWarningMessage'),
        type: 'warning',
        showCancelButton: true,
        confirmButtonClass: 'mat-raised-button mat-primary bg-danger',
        cancelButtonClass: 'mat-button',
        confirmButtonText: this.l('YesUpdate'),
        cancelButtonText: this.l('Cancel'),
        buttonsStyling: false
      }).then((result) => {
        if (result.value) {
          obj.allowFilter = !obj.allowFilter;
          obj.updateUserId = this.appSession.userId;
          this.dataService.updateMini(this.api + "?allow=1", obj).subscribe(() => {
            swal({
              title: this.l('DoctorUpdateAllowCompleteTitle'),
              text: this.l('DoctorTitle') + ' ' + obj.fullName + ' ' + this.ll('DoctorUpdateAllowFilterSuccessfully', obj.fullName),
              type: 'success',
              timer: 3000
            });
            this.paginator.pageIndex = 0;
            this.paginator._changePageSize(this.paginator.pageSize);
          });
          this.resetSearch();
          this.ngOnInit();
        }
      });
    }
    else {
      swal({
        title: this.l('AreYouSure'),
        html: this.l('DoctorTitle') + ' ' + obj.fullName + ' ' + this.ll('DoctorCancelAllowFilterWarningMessage'),
        type: 'warning',
        showCancelButton: true,
        confirmButtonClass: 'mat-raised-button mat-primary bg-danger',
        cancelButtonClass: 'mat-button',
        confirmButtonText: this.l('YesUpdate'),
        cancelButtonText: this.l('Cancel'),
        buttonsStyling: false
      }).then((result) => {
        if (result.value) {
          obj.allowFilter = !obj.allowFilter;
          obj.updateUserId = this.appSession.userId;
          this.dataService.updateMini(this.api + "?allow=1", obj).subscribe(() => {
            swal({
              title: this.l('DoctorUpdateAllowCompleteTitle'),
              text: this.l('DoctorTitle') + ' ' + obj.fullName + ' ' + this.ll('DoctorCancelAllowFilterSuccessfully', obj.fullName),
              type: 'success',
              timer: 3000
            });
            this.paginator.pageIndex = 0;
            this.paginator._changePageSize(this.paginator.pageSize);
          });
          this.resetSearch();
          this.ngOnInit();
        }
      });
    }
  }

  doctorUpdateAllowSearch(obj?: IDoctor): void {
    if (obj.allowSearch == false) {
      swal({
        title: this.l('AreYouSure'),
        html: this.l('DoctorTitle') + ' ' + obj.fullName + ' ' + this.l('DoctorUpdateAllowSearchWarningMessage'),
        type: 'warning',
        showCancelButton: true,
        confirmButtonClass: 'mat-raised-button mat-primary bg-danger',
        cancelButtonClass: 'mat-button',
        confirmButtonText: this.l('YesUpdate'),
        cancelButtonText: this.l('Cancel'),
        buttonsStyling: false
      }).then((result) => {
        if (result.value) {
          obj.allowSearch = !obj.allowSearch;
          obj.updateUserId = this.appSession.userId;
          this.dataService.updateMini(this.api + "?allow=1", obj).subscribe(() => {
            swal({
              title: this.l('DoctorUpdateAllowCompleteTitle'),
              text: this.l('DoctorTitle') + ' ' + obj.fullName + ' ' + this.l('DoctorUpdateAllowSearchSuccessfully', obj.fullName),
              type: 'success',
              timer: 3000
            });
            this.paginator.pageIndex = 0;
            this.paginator._changePageSize(this.paginator.pageSize);
          });
          this.resetSearch();
          this.ngOnInit();
        }
      });
    }
    else {
      swal({
        title: this.l('AreYouSure'),
        html: this.l('DoctorTitle') + ' ' + obj.fullName + ' ' + this.l('DoctorCancelAllowSearchWarningMessage'),
        type: 'warning',
        showCancelButton: true,
        confirmButtonClass: 'mat-raised-button mat-primary bg-danger',
        cancelButtonClass: 'mat-button',
        confirmButtonText: this.l('YesUpdate'),
        cancelButtonText: this.l('Cancel'),
        buttonsStyling: false
      }).then((result) => {
        if (result.value) {
          obj.allowSearch = !obj.allowSearch;
          obj.updateUserId = this.appSession.userId;
          this.dataService.updateMini(this.api + "?allow=1", obj).subscribe(() => {
            swal({
              title: this.l('DoctorUpdateAllowCompleteTitle'),
              text: this.l('DoctorTitle') + ' ' + obj.fullName + ' ' + this.l('DoctorCancelAllowSearchSuccessfully', obj.fullName),
              type: 'success',
              timer: 3000
            });
            this.paginator.pageIndex = 0;
            this.paginator._changePageSize(this.paginator.pageSize);
          });
          this.resetSearch();
          this.ngOnInit();
        }
      });
    }
  }


  getHealthfacilities(provinceCode?, districtCode?) {
    if (!this.appSession.user.healthFacilitiesId) {
      if (districtCode == null) {
        this.dataService.getAll("healthfacilities", "{ provinceCode:" + provinceCode + ",max:1}")
          .subscribe(resp => this._healthfacilities = resp.items);
      }
      else {
        this.dataService.getAll("healthfacilities", "{provinceCode:" + provinceCode + ",districtCode:" + districtCode + ",max:1}")
          .subscribe(resp => this._healthfacilities = resp.items)
      }
    }
    this.healthfacilities.setValue('');
  }


  getSpecialist() {
    this.dataService.getAll("catcommon?maxResultCount=1000").subscribe(resp => this._specialist = resp.items);
  }


  //Auto complete health facilities

  displayFn(h?: IHealthfacilities): string | undefined {
    return h ? h.name : undefined;
  }

  _filterHealthfacilities(name: any): IHealthfacilities[] {
    const filterValue = name.toLowerCase();
    var healthfacilities = isNaN(filterValue) ?
      this._healthfacilities.filter(h => h.name.toLowerCase().indexOf(filterValue) === 0) :
      this._healthfacilities.filter(h => h.code.toLowerCase().indexOf(filterValue) === 0);
    return healthfacilities;
  }

  clickCbo() {
    !this.healthfacilities.value ? this.filterOptions() : '';
  }

  filterOptions() {
    this.filteredHealthFacilitiesOptions = this.healthfacilities.valueChanges
      .pipe(
        startWith<string | IHealthfacilities>(''),
        map(value => typeof value === 'string' ? value : value.name),
        map(name => name ? this._filterHealthfacilities(name.trim()) : this._healthfacilities.slice()),
        map(data => data.slice())
      );
  }

  onInputHealthfacilities(obj: any) {
    if (obj != "") {
      this.frmSearch.controls['healthfacilitiesId'].setValue(0);
    } else {
      this.frmSearch.controls['healthfacilitiesId'].setValue('');
    }
  }

  onSelectHealthFacilities(value: any) {
    if (value.healthFacilitiesId) {
      this.frmSearch.controls['healthfacilitiesId'].setValue(value.healthFacilitiesId);
      this._healthFacilitiesId = value.healthFacilitiesId;
    }
  }

  // filterOptions() {
  //   this.healthfacilities.valueChanges
  //     .pipe(
  //       debounceTime(500),
  //       tap(() => this.isLoading = true),
  //       switchMap(value => this.filter(value))
  //     )
  //     .subscribe(data => {
  //       this._healthfacilities = data.items;
  //     });
  // }

  // filter(value: any) {
  //   var fValue = typeof value === 'string' ? value : (value ? value.name : '')
  //   this._healthfacilities = [];

  //   return this.dataService
  //     .get("healthfacilities", JSON.stringify({
  //       name: isNaN(fValue) ? fValue : "",
  //       code: !isNaN(fValue) ? fValue : ""
  //     }), '', null, null)
  //     .pipe(
  //       finalize(() => this.isLoading = false)
  //     )
  // }
  //End auto complete health facilities

  ///////////////////////////////////

  //Auto complete specialist
  displaySpecialistFn(h?: ICategoryCommon): string | undefined {
    return h ? h.name : undefined;
  }


  _filterSpecialist(name: any): ICategoryCommon[] {
    const filterValue = name.toLowerCase();
    var specialist =  this._specialist.filter(c => c.name.toLowerCase().indexOf(filterValue) === 0);
    return specialist;
  }

  clickSpecialistCbo() {
    !this.specialistCode.value ? this.filterSpecialistOptions() : '';
  }

  getSpecialJoin(element: [Specialist]) {
    return element.map((e) => e.name).join(", ");
  }

  filterSpecialistOptions() {
    this.filteredSpecialistOptions = this.specialistCode.valueChanges
      .pipe(
        startWith<string | ICategoryCommon>(''),
        map(name => name ? this._filterSpecialist(name.toString().trim()) : this._specialist.slice()),
        map(data => data.slice())
      );
  }

  onInputSpecialist(obj: any) {
    if (obj != "") {
      this.frmSearch.controls['specialistCode'].setValue(0);
    } else {
      this.frmSearch.controls['specialistCode'].setValue('');
    }
  }

  onSelectSpecialist(value: any) {
    if (value.code) {
      this.frmSearch.controls['specialistCode'].setValue(value.code);
      this._specialistCode = value.code;
    }
  }
  //End auto complete specialist
  customSearch() {
    this.btnSearchClicks$.next();
  }

  openDialogDoctor(obj?: EntityDto): void {
    const dialogRef = this.dialog.open(this.dialogComponent, { minWidth: 'calc(100vw/1.5)', maxWidth: 'calc(100vw - 100px)', disableClose: true, data: obj ? obj : null });
    dialogRef.afterClosed().subscribe(() => {
      this.paginator.pageIndex = 0;
      this.paginator._changePageSize(this.paginator.pageSize);
    });
  }

  detailDialogDoctor(obj?: EntityDto): void {
    const dialogRef = this.dialog.open(this.dialogDetail, { minWidth: 'calc(100vw/1.5)', maxWidth: 'calc(100vw - 100px)', disableClose: true, data: obj ? obj : null });
    dialogRef.afterClosed().subscribe(() => {
      this.paginator.pageIndex = 0;
      this.paginator._changePageSize(this.paginator.pageSize);
    });
  }
}
