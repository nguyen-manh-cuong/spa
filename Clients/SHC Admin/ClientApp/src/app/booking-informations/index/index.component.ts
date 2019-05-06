
import { AfterViewInit, Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatButton, MatDialog, MatDialogRef, MatTableDataSource, MatSort } from '@angular/material';
import { Subject, merge, of } from 'rxjs';
import { Observable } from 'rxjs';
import { catchError, map, startWith, switchMap, filter } from 'rxjs/operators';
import { standardized } from '../../../shared/helpers/Utils';
import { isEmpty, isNil, isNull, omitBy, zipObject } from 'lodash';
import { SelectionModel } from '@angular/cdk/collections';
import { DataService } from '@shared/service-proxies/service-data';
import { IBookingInformations, IHealthfacilities, IMedicalHealthcareHistories } from '@shared/interfaces';
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { TaskComponent } from '../task/task.component';
import { StatusComponent } from '../status-table/status.component';
import { GenderComponent } from '../gender-table/gender.component';
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

})
export class IndexComponent extends PagedListingComponentBase<IBookingInformations> implements OnInit {
  @ViewChild(StatusComponent) statusComponent;
  @ViewChild(GenderComponent) genderComponent;
  _quantityCancel: any;
  _quantityDone: any;
  _quantityPending: any;
  _quantityNew: any;
  _quantityMale: any;
  _quantityFemale: any;
  master = 'Master';
  listBooking: any;
  _healthfacilities = [];
  healthFacilitiesId: any;
  _doctors = [];
  quantityByStatusCancel: any;
  dataSourcesStatus = new MatTableDataSource();
  _status: any;
  totalPatientCount: 0;
  cDate = new Date();
  filteredOptions: Observable<IHealthfacilities[]>;
  healthfacilities = new FormControl();
  bookingServiceType = new FormControl();
  flagDisabled = true;
  arrayStatus = [{ position: 1, status: 'Đã khám', quantitystatus: 0 }, { position: 2, status: 'Chờ khám', quantitystatus: 0 }, { position: 3, status: 'Hủy khám', quantitystatus: 0 }, { position: 4, status: 'Mới đăng ký', quantitystatus: 0 }];

  displayedColumns = ['orderNumber', 'healthFacilitiesName', 'doctorName', 'quantity'];
  @ViewChild("endTime") endTime;
  @ViewChild("startTime") startTime;
  @ViewChild(MatSort) sort: MatSort;
  
  constructor(injector: Injector, private _dataService: DataService, public dialog: MatDialog, private _formBuilder: FormBuilder) { super(injector); }
  _bookingServiceTypes = [{ id: 0, name: 'Mới đăng ký' }, { id: 1, name: 'Chờ khám' }, { id: 2, name: 'Đã khám' }, { id: 3, name: 'Hủy khám' }, { id: 4, name: 'Tất cả' }];
  _bookingInformationsTime = [{ id: 0, name: 'Hôm nay' }, { id: 1, name: 'Hôm qua' }, { id: 2, name: 'Tuần này' }, { id: 3, name: 'Tuần trước' }, { id: 4, name: 'Tháng này' }, { id: 5, name: 'Tháng trước' }, { id: 6, name: 'Quý này' }, { id: 7, name: 'Quý trước' }, { id: 8, name: 'Năm nay' }, { id: 9, name: 'Năm trước' }, { id: 10, name: 'Theo khoảng thời gian' }];

  ngOnInit() {
    this.api = 'bookinginformationsgroupby';
    this.dataService = this._dataService;
    this.dialogComponent = TaskComponent;
    this.totalPatientCount = 0;
    this.frmSearch = this._formBuilder.group({
      healthfacilities: [this.appSession.user.healthFacilitiesId],
      doctor: [],
      status: [4],
      startTime: [moment(new Date().setHours(7, 0, 0, 0)).toDate()],
      endTime: new Date(),
      time: [0],
    });
    //old
    // this.dataService.getAll('healthfacilities', (this.appSession.user.healthFacilitiesId ? String(this.appSession.user.healthFacilitiesId) : '')).subscribe(resp => {
    //   this._healthfacilities = resp.items;
    // });
    // if (this.appSession.user.healthFacilitiesId != null) {
    //   this.healthFacilitiesId = this.appSession.user.healthFacilitiesId;
    //   this.dataService.getAll('doctors', this.healthFacilitiesId).subscribe(resp => {
    //     this._doctors = resp.items;
    //   });
    // }
    //new
    if(this.appSession.user.healthFacilitiesId) {
      this.dataService.getAll('healthfacilities', "{healthfacilitiesId:"+String(this.appSession.user.healthFacilitiesId)+"}").subscribe(resp => this._healthfacilities = resp.items);
      this.frmSearch.controls['healthfacilities'].setValue(this.appSession.user.healthFacilitiesId);
      this.dataService.getAll('doctors', String(this.appSession.user.healthFacilitiesId)).subscribe(resp => this._doctors = resp.items);
    }
    else{
        this.dataService.getAll('healthfacilities').subscribe(resp => this._healthfacilities = resp.items);
        this.filterOptions();
    }

    setTimeout(() => {
      this.startTime.nativeElement.value = moment(new Date().setDate(new Date().getDate())).format("DD/MM/YYYY");
      this.endTime.nativeElement.value = moment(new Date().setDate(new Date().getDate())).format("DD/MM/YYYY");
    });
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
  onselectBookingInformationsTime(obj: any) {
    this.flagDisabled = true;
    if (obj == 0) {    
      this.startTime.nativeElement.value = moment(new Date().setDate(new Date().getDate())).format("DD/MM/YYYY");
      this.endTime.nativeElement.value = moment(new Date().setDate(new Date().getDate())).format("DD/MM/YYYY");
    }
    // Hôm qua
    if (obj == 1) {
      this.startTime.nativeElement.value = moment(new Date().setDate(new Date().getDate() - 1)).format("DD/MM/YYYY");
      this.endTime.nativeElement.value = moment(new Date().setDate(new Date().getDate())).format("DD/MM/YYYY");
    }
    // Tuần này
    if (obj == 2) {
      this.startTime.nativeElement.value = moment(moment().startOf("isoWeek").toDate()).format("DD/MM/YYYY");
      this.endTime.nativeElement.value = moment(moment().endOf("isoWeek").toDate()).format("DD/MM/YYYY");
    }
    // Tuần trước
    if (obj == 3) {
      this.startTime.nativeElement.value = moment(moment().subtract(1, 'weeks').startOf('isoWeek')).format("DD/MM/YYYY");
      this.endTime.nativeElement.value = moment(moment().subtract(1, 'weeks').endOf('isoWeek')).format("DD/MM/YYYY");
    }
    // Tháng này
    if (obj == 4) {
      this.startTime.nativeElement.value = moment(moment().startOf("month").toDate()).format("DD/MM/YYYY");
      this.endTime.nativeElement.value = moment(moment().endOf("month").toDate()).format("DD/MM/YYYY");
    }
    // Tháng trước
    if (obj == 5) {
      this.startTime.nativeElement.value = moment(moment().subtract(1, 'months').startOf('month')).format("DD/MM/YYYY");
      this.endTime.nativeElement.value = moment(moment().subtract(1, 'months').endOf('month')).format("DD/MM/YYYY");
    }
    // Qúy này
    if (obj == 6) {
      this.startTime.nativeElement.value = moment(moment().quarter(moment().quarter()).startOf('quarter')).format("DD/MM/YYYY");
      this.endTime.nativeElement.value = moment(moment().quarter(moment().quarter()).endOf('quarter')).format("DD/MM/YYYY");
    }
    // Quý trước
    if (obj == 7) {
      this.startTime.nativeElement.value = moment(moment().subtract(1, 'quarter').startOf('quarter')).format("DD/MM/YYYY");
      this.endTime.nativeElement.value = moment(moment().subtract(1, 'quarter').endOf('quarter')).format("DD/MM/YYYY");
    }
    // Năm nay
    if (obj == 8) {
      this.startTime.nativeElement.value = moment(moment().startOf('year')).format("DD/MM/YYYY");
      this.endTime.nativeElement.value = moment(moment().endOf('year')).format("DD/MM/YYYY");
    }

    // Năm trước
    if (obj == 9) {
      this.startTime.nativeElement.value = moment(moment().subtract(1, 'year').startOf('year')).format("DD/MM/YYYY");
      this.endTime.nativeElement.value = moment(moment().subtract(1, 'year').endOf('year')).format("DD/MM/YYYY");
    }
    if (obj == 10) {
      this.flagDisabled = false;
    }
  }
  search() {
    // if (!this.endTime.nativeElement.value && !this.startTime.nativeElement.value) {
    //   this.startTime.nativeElement.focus();
    //   this.endTime.nativeElement.focus();
    //   return swal({
    //     title:'Thông báo', 
    //     text:'Từ ngày và Đến ngày không được để trống', 
    //     type:'warning',
    //     timer:3000});       
    // }   
    if (!this.startTime.nativeElement.value) {
      this.startTime.nativeElement.focus();
      return swal({
        title:'Thông báo', 
        text:'Từ ngày không được để trống', 
        type:'warning',
        timer:3000});
    }
    if (!this.endTime.nativeElement.value) {
      this.endTime.nativeElement.focus();
      return swal({
        title:'Thông báo', 
        text:'Đến ngày không được để trống', 
        type:'warning',
        timer:3000});       
    }
    if (!moment(this.startTime.nativeElement.value, 'DD/MM/YYYY').isValid()) {
      this.startTime.nativeElement.focus();
      return swal({
        title:'Thông báo', 
        text:'Từ ngày không đúng định dạng', 
        type:'warning',
        timer:3000});
    }
    if (!moment(this.endTime.nativeElement.value, 'DD/MM/YYYY').isValid()) {
      this.endTime.nativeElement.focus();
      return swal({
        title:'Thông báo', 
        text:'Đến ngày không đúng định dạng',
        type: 'warning',
        timer:3000});        
    }
    if (((moment(this.endTime.nativeElement.value, 'DD/MM/YYYY').valueOf() - moment(this.startTime.nativeElement.value, 'DD/MM/YYYY').valueOf()) / (1000 * 60 * 60 * 24)) < 0) {
      this.endTime.nativeElement.focus();
      return swal({
        title:'Thông báo', 
        text:'Đến ngày phải lớn hơn hoặc bằng Từ ngày',
        type: 'warning',
        timer:3000});
    }
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
    this.startTime.nativeElement.value ? this.frmSearch.controls['startTime'].setValue(moment(this.startTime.nativeElement.value + '00:00:00', 'DD/MM/YYYY hh:mm:ss').add(7, 'hours').toDate()) : '';
    this.endTime.nativeElement.value ? this.frmSearch.controls['endTime'].setValue(moment(this.endTime.nativeElement.value + '23:59:59', 'DD/MM/YYYY hh:mm:ss').add(7, 'hours').toDate()) : '';
    var req = omitBy(this.frmSearch.value, isNil);
    //req.healthfacilities = req && req.healthfacilities ? req.healthfacilities.healthFacilitiesId : "";

    this.paginator.pageIndex = 0;
    this.dataService
      .get(this.api, JSON.stringify(req), '', this.paginator.pageIndex, this.paginator.pageSize)
      .subscribe(resp => {
        setTimeout(() => this.isTableLoading = true, 0);
        this.totalItems = resp.totalCount;
        this.totalPatientCount = resp.totalPatientCount;
        this.dataSources.data = resp.items;
        setTimeout(() => {
          this.listBooking = this.dataSources.data;
          if (this.listBooking.length == 0) {
            this._quantityCancel = 0;
            this._quantityDone = 0;
            this._quantityPending = 0;
            this._quantityNew = 0;
            this._quantityMale = 0;
            this._quantityFemale = 0;
          }
          else {
            for (var item of this.listBooking) {
              this._quantityCancel = item.quantityByStatusCancel;
              this._quantityDone = item.quantityByStatusDone;
              this._quantityPending = item.quantityByStatusPending;
              this._quantityNew = item.quantityByStatusNew;
              this._quantityMale = item.quantityByGenderMale;
              this._quantityFemale = item.quantityByGenderFemale;
            }
          }
          this.statusComponent.reloadStatus(this._quantityDone, this._quantityPending, this._quantityCancel, this._quantityNew);
          this.genderComponent.reloadGender(this._quantityFemale, this._quantityMale);
        }, 500);
      });

  }

  onSelectHealthFacilities(obj: any) {
    this._doctors = [];
    this.dataService.getAll('doctors', obj.healthFacilitiesId).subscribe(resp => {
      this._doctors = resp.items
    });
  }
  onChangeHealthfacilities() {
    var val = this.healthfacilities.value;

    if (val && val.trim()) {
      var rs = this._filter(val.trim());
      //TODO:lọc lấy Id
      if (rs.length > 0) {
        this.healthfacilities.setValue(rs[0]);
      } else {
        this.healthfacilities.setValue('');
      }
    } else {
      this.healthfacilities.setValue('');
    }
  }


}
