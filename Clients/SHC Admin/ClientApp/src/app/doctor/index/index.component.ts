import { ICategoryCommon, IProvince, IDistrict, IWard, IDoctor, IHealthfacilities } from './../../../shared/Interfaces';
import { AfterViewInit, Component, Injector, OnInit, ViewChild, Input, ViewEncapsulation } from '@angular/core';
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
  styleUrls: ['./index.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class IndexComponent extends PagedListingComponentBase<ICategoryCommon> implements OnInit {
  dialogDetail: any;

  _provinces = [];
  _districts = [];
  checkProvince = false;
  _healthfacilities = [];
  _specialist = [];
  _healthFacilitiesId: number;
  _specialistCode: number;

  checkInputHealthFacilities = false;

  isLoading = false;
  filteredHealthFacilitiesOptions: Observable<IHealthfacilities[]>;
  filteredSpecialistOptions: Observable<ICategoryCommon[]>;
  healthfacilities = new FormControl();
  specialistCode = new FormControl();

  filteredProvinceOptions: Observable<IProvince[]>;
  provinceCode = new FormControl();
  _provinceCode: string;

  filteredDistrictOptions: Observable<IDistrict[]>;
  districtCode = new FormControl();
  _districtCode: string;


  healthfacilitiesControl = new FormControl();

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

    var provinceCode;
    var districtCode;

    if (this.appSession.user.healthFacilitiesId) {
      this.dataService.getAll('healthfacilities', "{healthfacilitiesId:" + String(this.appSession.user.healthFacilitiesId) + "}").subscribe(resp => {
        this._healthfacilities = resp.items;
        // provinceCode = resp.items[0].provinceCode;
        // districtCode = resp.items[0].districtCode;
      }, err => { }, () => {
        // this.frmSearch.controls['provinceCode'].setValue(provinceCode);
        // this.getDistricts(provinceCode, districtCode);
      });
      this.frmSearch.controls['healthfacilitiesId'].setValue(this.appSession.user.healthFacilitiesId);
    }
    else {
      this.getHealthfacilities();
      this.filterOptions();
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
    this._dataService.getAll("provinces").subscribe(resp => this._provinces = resp.items);
  }

  getDistricts(provinceCode, districtCode?) {
    // if (districtCode) {
    //   return this._dataService.getAll("districts", "{ProvinceCode:" + provinceCode + "}").subscribe(resp => this._districts = resp.items, err => { }, () => this.frmSearch.controls['districtCode'].setValue(districtCode));
    // }
    return this._dataService.getAll("districts", "{ProvinceCode:" + provinceCode + "}").subscribe(resp => this._districts = resp.items);
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
      this._districts = null;
      if (!this.appSession.user.healthFacilitiesId)
        this._healthfacilities = null;
    }
  }

  districtChange(province, $event) {
    this.getHealthfacilities(province.value, $event.value);
  }

  resetSearch() {
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
    if (provinceCode == null && districtCode == null) {
      return this.dataService.getAll("healthfacilities")
        .subscribe(resp => this._healthfacilities = resp.items);
    }
    if (!this.appSession.user.healthFacilitiesId) {
      if (provinceCode != null && districtCode == null) {
        this.dataService.getAll("healthfacilities", "{ provinceCode:" + provinceCode + "}")
          .subscribe(resp => this._healthfacilities = resp.items);
      }
      else {
        this.dataService.getAll("healthfacilities", "{provinceCode:" + provinceCode + ",districtCode:" + districtCode + "}")
          .subscribe(resp => this._healthfacilities = resp.items)
      }
    }
    this.healthfacilities.setValue('');
  }


  getSpecialist() {
    this.dataService.get("catcommon", '', "{name:'asc'}", null, 300).subscribe(resp => this._specialist = resp.items);
  }


  // displayProvinceFn(h?: IProvince): string | undefined {
  //   return h ? h.name : undefined;
  // }


  // _filterProvince(name: any): IProvince[] {
  //   const filterValue = name.toLowerCase();
  //   var provinces = this._provinces.filter(c => c.name.toLowerCase().indexOf(filterValue) === 0);
  //   return provinces;
  // }

  // clickProvinceCbo() {
  //   !this.provinceCode.value ? this.filterProvinceOptions() : '';
  // }



  // filterProvinceOptions() {
  //   this.filteredProvinceOptions = this.provinceCode.valueChanges
  //     .pipe(
  //       startWith<string | IProvince>(''),
  //       map(name => name ? this._filterProvince(name.toString().trim()) : this._provinces.slice()),
  //       map(data => data.slice())
  //     );
  // }

  // @ViewChild('districtInput') districtInput;

  // onInputProvince(obj: any) {
  //   if (obj.data != " " || obj.inputType == "deleteContentBackward") {
  //     this._districts = [];
  //     this.districtInput.nativeElement.value = "";
  //     this._provinceCode = null;
  //     this._districtCode = null;
  //   }
  // }

  // onSelectProvince(value: any) {
  //   if (value.provinceCode) {
  //     this._provinceCode = value.provinceCode;
  //     this.dataService.get('districts', JSON.stringify({ ProvinceCode: value.provinceCode }), '', 0, 0)
  //       .subscribe(resp => {
  //         this._districts = resp.items;
  //         this.districtCode.setValue(null);
  //       });
  //   }
  // }

  // //District

  // displayDistrictFn(h?: IDistrict): string | undefined {
  //   return h ? h.name : undefined;
  // }


  // _filterDistrict(name: any): IDistrict[] {
  //   const filterValue = name.toLowerCase();
  //   var districts = this._districts.filter(c => c.name.toLowerCase().indexOf(filterValue) === 0);
  //   return districts;
  // }

  // clickDistrictCbo() {
  //   !this.districtCode.value ? this.filterDistrictOptions() : '';
  // }



  // filterDistrictOptions() {
  //   this.filteredDistrictOptions = this.districtCode.valueChanges
  //     .pipe(
  //       startWith<string | IDistrict>(''),
  //       map(name => name ? this._filterDistrict(name.toString().trim()) : this._districts.slice()),
  //       map(data => data.slice())
  //     );
  // }

  // onInputDistrict(obj: any) {
  //   if (obj.data != " " || obj.inputType == "deleteContentBackward") {
  //     this._districtCode = null;
  //   }
  // }

  // onSelectDistrict(value: any) {
  //   if (value.districtCode) {
  //     this._districtCode = value.districtCode;
  //   }
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

  onSelectHealthFacilities(value) {
    if (value.healthFacilitiesId) {
      this.checkInputHealthFacilities = false;
    }
  }
  //End auto complete health facilities

  ///////////////////////////////////
  getSpecialJoin(element: [Specialist]) {
    return element.map((e) => e.name).join(", ");
  }
  //Auto complete specialist
  displaySpecialistFn(h?: ICategoryCommon): string | undefined {
    return h ? h.name : undefined;
  }


  _filterSpecialist(name: any): ICategoryCommon[] {
    const filterValue = name.toLowerCase();
    var specialist = this._specialist.filter(c => this.change_alias(c.name.toLowerCase()).indexOf(this.change_alias(filterValue)) >= 0);
    return specialist;
  }

  change_alias(alias) {
    var str = alias;
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/ + /g, " ");
    str = str.trim();
    return str;
  }

  clickSpecialistCbo() {
    !this.specialistCode.value ? this.filterSpecialistOptions() : '';
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

  inputHealthFacilitest(event) {
    if (event.target.value != "") {
      this.checkInputHealthFacilities = true;
    }
    else {
      this.checkInputHealthFacilities = false;
    }
  }

  cutstring(s: string) {
    if (s != null && s.length > 25) {
      return s.substring(0, 25);
    }
  }

  //End auto complete specialist
  customSearch() {
    // this.frmSearch.controls['provinceCode'].setValue(this._provinceCode);
    // this.frmSearch.controls['districtCode'].setValue(this._districtCode);

    this.healthfacilities.value ?
      this.frmSearch.controls['healthfacilitiesId'].setValue(this.healthfacilities.value.healthFacilitiesId) :
      (this.appSession.user.healthFacilitiesId == null ? this.frmSearch.controls['healthfacilitiesId'].setValue(null) : '');

    if (this.checkInputHealthFacilities) {
      this.frmSearch.controls['healthfacilitiesId'].setValue(0);
    }

    if (this.healthfacilities.value && typeof this.healthfacilities.value==="string"  && this.healthfacilities.value.trim() == "") {
      this.frmSearch.controls['healthfacilitiesId'].setValue(null);
    }

    if (this.specialistCode.value && typeof this.specialistCode.value==="string" && this.specialistCode.value.trim() == "") {
      this.frmSearch.controls['specialistCode'].setValue(null);
    }
    this.btnSearchClicks$.next();
  }

  openDialogDoctor(obj?: EntityDto): void {
    var element = document.getElementById("noscroll");
    element.classList.add("noscroll");
    const dialogRef = this.dialog.open(this.dialogComponent, { minWidth: 'calc(100vw/1.5)', maxWidth: 'calc(100vw - 100px)', disableClose: true, data: obj ? obj : null });
    dialogRef.afterClosed().subscribe(() => {
      var element = document.getElementById("noscroll");
      element.classList.remove("noscroll");
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
