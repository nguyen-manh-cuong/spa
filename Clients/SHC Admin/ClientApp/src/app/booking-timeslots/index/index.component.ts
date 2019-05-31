import { AfterViewInit, Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatButton, MatDialog, MatDialogRef } from '@angular/material';
import { Subject, merge, of } from 'rxjs';
import { Observable } from 'rxjs';
import { catchError, map, startWith, switchMap, debounceTime, tap, finalize } from 'rxjs/operators';
import { compact, isEmpty, omitBy, zipObject } from 'lodash';
import { SelectionModel } from '@angular/cdk/collections';
import { DataService } from '@shared/service-proxies/service-data';
import { ILanguage, IBookingTimeslots, IHealthfacilities, IMedicalHealthcareHistories } from '@shared/Interfaces';
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { TaskComponent } from '../task/task.component';
import swal from 'sweetalert2';
import { getPermission } from '@shared/helpers/utils';
import { Router } from '@angular/router';


export class EntityDto {
  id: number;
  isActive: boolean;
}

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent extends PagedListingComponentBase<IBookingTimeslots> implements OnInit {
  _healthfacilities = [];

  filteredOptions: Observable<IHealthfacilities[]>;
  healthfacilities = new FormControl();
  isLoading = false;
  permission: any;
  displayedColumns = this.appSession.user.accountType != 0 ? ['orderNumber', 'code', 'name', 'time', 'status', 'task'] : ['orderNumber', 'healthFacilitiesName', 'code', 'name', 'time', 'status', 'task'];

  constructor(injector: Injector, private _dataService: DataService, public dialog: MatDialog, private _formBuilder: FormBuilder, private router: Router) { super(injector); }

  ngOnInit() {
    this.api = 'bookingtimeslots';
    this.dataService = this._dataService;
    this.dialogComponent = TaskComponent;
    this.permission = getPermission(abp.nav.menus['mainMenu'].items, this.router.url);
    this.frmSearch = this._formBuilder.group({
      keyFilter: [],
      healthfacilities: [this.appSession.user.healthFacilitiesId],
    });

    if (this.appSession.user.healthFacilities) {
      this.frmSearch.controls['healthfacilities'].setValue(this.appSession.user.healthFacilitiesId);
    }
    else {
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

  showMess(obj: EntityDto, key: string, id?: number | string) {
    swal({
      title: this.l('AreYouSure'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonClass: 'mat-raised-button mat-primary bg-danger',
      cancelButtonClass: 'mat-button',
      confirmButtonText: this.l('YesDelete'),
      cancelButtonText: this.l('Cancel'),
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {
        swal({
          title: this.l('Xóa không thành công'),
          text: 'Không thể xóa khung giờ khám đang hoạt động!',
          type: 'error',
          timer: 3000
        });
      }
    });
  }

  customSearch() {
    if (this.appSession.user.healthFacilitiesId != null) {
      this.healthfacilities.value
        ? this.frmSearch.controls['healthfacilities'].setValue(this.healthfacilities.value.healthFacilitiesId)
        : '';
    }
    else {
      this.healthfacilities.value
        ? this.frmSearch.controls['healthfacilities'].setValue(this.healthfacilities.value.healthFacilitiesId)
        : this.frmSearch.controls['healthfacilities'].setValue('');
    }
    this.btnSearchClicks$.next();
  }

  showNotify(obj: EntityDto, key: string, id?: number | string) {
    swal({
      title: this.l('Không thể xóa khung giờ khám đang hoạt động'),
      text: '',
      type: 'error',
      timer: 3000
    });
  }

  adminConfirm(check?){
    if(check==1){
      swal({
        title: "Không có quyền xóa khung giờ khám",
        text: "",
        type: "warning",
        timer:3000
      });
    }
    else{
      swal({
        title: "Không có quyền sửa khung giờ khám",
        text: "",
        type: "warning",
        timer:3000
      });
    }
  }

  checkPermission(isEdit: boolean, isDelete: boolean): boolean{
    if(isEdit || isDelete){
        return true;
    } else{
        this.displayedColumns = this.appSession.user.accountType != 0 ? ['orderNumber', 'code', 'name', 'time', 'status'] : ['orderNumber', 'healthFacilitiesName', 'code', 'name', 'time', 'status'];
        return false;
    }
  }
}
