import { IHealthfacilities } from './../../../../../../SHC Outside/ClientApp/src/shared/Interfaces';
import { IDoctor } from './../../../../../../SHC Client/ClientApp/src/shared/Interfaces';
import { ICategoryCommon } from './../../../shared/Interfaces';
import { AfterViewInit, Component, Injector, OnInit, ViewChild, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatButton, MatDialog, MatDialogRef, MatSort, MatCheckbox, MatInput, AUTOCOMPLETE_OPTION_HEIGHT } from '@angular/material';
import { Subject, merge, of, Observable } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { compact, isEmpty, omitBy, zipObject } from 'lodash';
import * as _ from 'lodash';
import { DataService } from '@shared/service-proxies/service-data';
import { ILanguage, IBookingTimeslots } from '@shared/Interfaces';
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { TaskComponent } from '../task/task.component';
import swal from 'sweetalert2';
import { start } from 'repl';



export class DoctorEntityDto {
  doctorId: number;
}

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent extends PagedListingComponentBase<ICategoryCommon> implements OnInit {

  provinces= [];
  districts= [];
  checkProvince = false;
  healthFacilities=[];
  specialist=[];

  displayedColumns = ['orderNumber', 'fullName', 'specialistName', 'phoneNumber', 'address', 'priceFrom', 'allowBooking', 'allowFilter', 'allowSearch', 'task'];

  constructor(injector: Injector, private _dataService: DataService, public dialog: MatDialog, private _formBuilder: FormBuilder) { super(injector); }

  ngOnInit() {
    this.api = 'doctor';
    this.dataService = this._dataService;
    this.dialogComponent = TaskComponent;
    this.frmSearch = this._formBuilder.group({ provinceCode: [], districtCode: [], info: [], healthFacilitiesId: [], specialistCode: [] });
    this.getProvinces();
    this.getSpecialist();
  }
  showErrorDeleteMessage() {
    swal(this.l('ErrorDelete'), this.l('DoctorErrorDeleted', ''), 'error');
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
          swal(this.l('SuccessfullyDeleted'), this.l('DeletedInSystem', obj[key]), 'success');
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
      this.healthFacilities=null;
    }
  }

  districtChange(province,$event){
    this.getHealthfacilities(province.value,$event.value);
  }

  resetSearch(){
    this.provinces=null;
    this.specialist=null;
    this.specialist=null;
    this.healthFacilities=null;
  }

  doctorUpdateAllowBooking(obj?: IDoctor): void {
    swal({
      title: this.l('AreYouSure'),
      html: this.l('DoctorUpdateAllowBookingWarningMessage', obj.fullName),
      type: 'warning',
      showCancelButton: true,
      confirmButtonClass: 'mat-raised-button mat-primary bg-danger',
      cancelButtonClass: 'mat-button',
      confirmButtonText: this.l('YesUpdate'),
      cancelButtonText: this.l('Cancel'),
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {
        obj.allowBooking=!obj.allowBooking;
        this.dataService.update(this.api+"?allow=1", obj).subscribe(() => {
          swal(this.l('DoctorUpdateAllowBooking'), this.l('DoctorUpdateAllowBookingSuccessfully', obj.fullName), 'success');
          this.paginator.pageIndex = 0;
          this.paginator._changePageSize(this.paginator.pageSize);
        });
        this.resetSearch();
        this.ngOnInit();
      }
    });
  }

  doctorUpdateAllowFilter(obj?: IDoctor): void {
    swal({
      title: this.l('AreYouSure'),
      html: this.l('DoctorUpdateAllowFilterWarningMessage', obj.fullName),
      type: 'warning',
      showCancelButton: true,
      confirmButtonClass: 'mat-raised-button mat-primary bg-danger',
      cancelButtonClass: 'mat-button',
      confirmButtonText: this.l('YesUpdate'),
      cancelButtonText: this.l('Cancel'),
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {
        obj.allowFilter=!obj.allowFilter;
        this.dataService.update(this.api+"?allow=1", obj).subscribe(() => {
          swal(this.l('DoctorUpdateAllowFilter'), this.l('DoctorUpdateAllowFilterSuccessfully', obj.fullName), 'success');
          this.paginator.pageIndex = 0;
          this.paginator._changePageSize(this.paginator.pageSize);
        });
        this.resetSearch();
        this.ngOnInit();
      }
    });
  }

  doctorUpdateAllowSearch(obj?: IDoctor): void {
    swal({
      title: this.l('AreYouSure'),
      html: this.l('DoctorUpdateAllowSearchWarningMessage', obj.fullName),
      type: 'warning',
      showCancelButton: true,
      confirmButtonClass: 'mat-raised-button mat-primary bg-danger',
      cancelButtonClass: 'mat-button',
      confirmButtonText: this.l('YesUpdate'),
      cancelButtonText: this.l('Cancel'),
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {
        obj.allowSearch=!obj.allowSearch;
        this.dataService.update(this.api+"?allow=1", obj).subscribe(() => {
          swal(this.l('DoctorUpdateAllowSearch'), this.l('DoctorUpdateAllowSearchSuccessfully', obj.fullName), 'success');
          this.paginator.pageIndex = 0;
          this.paginator._changePageSize(this.paginator.pageSize);
        });
        this.resetSearch();
        this.ngOnInit();
      }
    });
  }

  getHealthfacilities(provinceCode,districtCode?){
    if(districtCode==null){
      this.dataService.getAll("healthfacilities?filter={provinceCode:"+provinceCode+"}").subscribe(resp=>this.healthFacilities=resp.items);
    }
    else
    {
      this.dataService.getAll("healthfacilities?filter={provinceCode:"+provinceCode+",districtCode:"+ districtCode+"}").subscribe(resp=>this.healthFacilities=resp.items)
    }
  }


  getSpecialist(){
    this.dataService.getAll("catcommon?maxResultCount=1000").subscribe(resp=>this.specialist=resp.items);
  }
}
