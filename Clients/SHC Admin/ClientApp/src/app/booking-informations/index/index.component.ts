import { AfterViewInit, Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatButton, MatDialog, MatDialogRef, MatTableDataSource } from '@angular/material';
import { Subject, merge, of } from 'rxjs';
import { Observable } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { compact, isEmpty, omitBy, zipObject } from 'lodash';
import { SelectionModel } from '@angular/cdk/collections';
import { DataService } from '@shared/service-proxies/service-data';
import { IBookingInformations, IHealthfacilities, IMedicalHealthcareHistories } from '@shared/Interfaces';
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { TaskComponent } from '../task/task.component';
import * as moment from 'moment';
import swal from 'sweetalert2';
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
})
export class IndexComponent extends PagedListingComponentBase<IBookingInformations> implements OnInit {
  _healthfacilities = [];
  _doctors = [];

  filteredOptions: Observable<IHealthfacilities[]>;
  healthfacilities = new FormControl();
  bookingServiceType = new FormControl();

  displayedColumns = [ 'orderNumber', 'healthFacilitiesName', 'doctorName',  'quantity'];
  @ViewChild("endTime") endTime;
  @ViewChild("startTime") startTime;
  constructor(injector: Injector, private _dataService: DataService, public dialog: MatDialog, private _formBuilder: FormBuilder) { super(injector); }
  _bookingServiceTypes = [{ id: 0, name: 'Mới đăng ký' }, { id: 1, name: 'Chưa khám' }, { id: 2, name: 'Đã khám' }, { id: 3, name: 'Hủy khám' }, { id: 4, name: 'Tất cả' }];
  _bookingInformationsTime = [{ id: 0, name: 'Hôm nay' }, { id: 1, name: 'Hôm qua' }, { id: 2, name: 'Tuần này' }, { id: 3, name: 'Tuần trước' }, { id: 4, name: 'Tháng này'}, { id: 5, name: 'Tháng tước'}, { id: 6, name: 'Quý này'}, { id: 7, name: 'Quý trước'}, { id: 8, name: 'Năm nay'}, { id: 9, name: 'Năm trước'}, { id: 10, name: 'Theo khoảng thời gian'} ];


  ngOnInit() {  
    this.api = 'bookinginformations';
    this.dataService = this._dataService;
    this.dialogComponent = TaskComponent;
    this.frmSearch = this._formBuilder.group({
       keyFilter: [],     
       healthfacilities: [this.appSession.user.healthFacilitiesId],
       bookingServiceType: [],
       bookingInformationsTime: [],
       doctor : [],       
       startTime: new Date(),
       endTime: new Date(),
      });
     
    this.dataService.getAll('healthfacilities', (this.appSession.user.healthFacilitiesId ? String(this.appSession.user.healthFacilitiesId) : '')).subscribe(resp => 
    {
      this._healthfacilities = resp.items;      
    });


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

showMess(){
  swal(this.l('Xóa khung giờ khám không thành công. Không thể xóa khung giờ khám đang hoạt động'), '', 'error');
}

  clickCbo() { 
    console.log('vao ham clickCbo')   
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
onselectBookingInformationsTime(obj: any){
  //  console.log(obj);
   if(obj == 0){;    
    this.startTime.nativeElement.value = moment(new Date().setDate(new Date().getDate())).format("DD/MM/YYYY");
    this.endTime.nativeElement.value = moment(new Date().setDate(new Date().getDate())).format("DD/MM/YYYY");
   }
   // Hôm qua
   if(obj == 1){
    this.startTime.nativeElement.value = moment(new Date().setDate(new Date().getDate() -1)).format("DD/MM/YYYY");
    this.endTime.nativeElement.value = moment(new Date().setDate(new Date().getDate())).format("DD/MM/YYYY");
   }
   // Tuần này
   if(obj == 2){    
    this.startTime.nativeElement.value = moment(moment().startOf("isoWeek").toDate()).format("DD/MM/YYYY");
    this.endTime.nativeElement.value = moment(moment().endOf("isoWeek").toDate()).format("DD/MM/YYYY");
   }
   // Tuần trước
   if(obj == 3){
    this.startTime.nativeElement.value = moment(moment().subtract(1, 'weeks').startOf('isoWeek')).format("DD/MM/YYYY");    
    this.endTime.nativeElement.value = moment(moment().subtract(1, 'weeks').endOf('isoWeek')).format("DD/MM/YYYY");    
   }
   // Tháng này
   if(obj == 4){
    this.startTime.nativeElement.value = moment(moment().startOf("month").toDate()).format("DD/MM/YYYY");
    this.endTime.nativeElement.value = moment(moment().endOf("month").toDate()).format("DD/MM/YYYY");
   }
   // Tháng trước
   if(obj == 5){
    this.startTime.nativeElement.value = moment(moment().subtract(1, 'months').startOf('month')).format("DD/MM/YYYY");
    this.endTime.nativeElement.value = moment(moment().subtract(1, 'months').endOf('month')).format("DD/MM/YYYY");
   }
   // Qúy này
   if(obj == 6){
    this.startTime.nativeElement.value = moment(moment().quarter(moment().quarter()).startOf('quarter')).format("DD/MM/YYYY");
    this.endTime.nativeElement.value = moment(moment().quarter(moment().quarter()).endOf('quarter')).format("DD/MM/YYYY");
   }
   // Quý trước
   if(obj == 7){
    this.startTime.nativeElement.value = moment(moment().subtract(1, 'quarter').startOf('quarter')).format("DD/MM/YYYY");
    this.endTime.nativeElement.value = moment(moment().subtract(1, 'quarter').endOf('quarter')).format("DD/MM/YYYY");    
   }
   // Năm nay
   if(obj == 8){
    this.startTime.nativeElement.value = moment(moment().startOf('year')).format("DD/MM/YYYY");    
    this.endTime.nativeElement.value = moment(moment().endOf('year')).format("DD/MM/YYYY");    
   }
  
   // Năm trước
   if(obj == 9){
    this.startTime.nativeElement.value =  moment(moment().subtract(1, 'year').startOf('year')).format("DD/MM/YYYY");
    this.endTime.nativeElement.value =  moment(moment().subtract(1, 'year').endOf('year')).format("DD/MM/YYYY");
   }
   if(obj == 10){
    document.getElementById("cbo-startTime").classList.remove("disabled");
    document.getElementById("cbo-endTime").classList.remove("disabled");
   }
}
customSearch() {  
  if(this.appSession.user.healthFacilitiesId != null){
    this.healthfacilities.value 
      ? this.frmSearch.controls['healthfacilities'].setValue(this.healthfacilities.value.healthFacilitiesId) 
      : '';  
  }
  else{
    this.healthfacilities.value 
      ? this.frmSearch.controls['healthfacilities'].setValue(this.healthfacilities.value.healthFacilitiesId) 
      : this.frmSearch.controls['healthfacilities'].setValue('');  
  }
  this.startTime.nativeElement.value ? this.frmSearch.controls['startTime'].setValue(moment(this.startTime.nativeElement.value, 'DD/MM/YYYY').toDate()) : '';
  this.endTime.nativeElement.value ? this.frmSearch.controls['endTime'].setValue(moment(this.endTime.nativeElement.value, 'DD/MM/YYYY').toDate()) : '';
  console.log(173, this.startTime.nativeElement.value);
  console.log(174, this.endTime.nativeElement.value);
  this.btnSearchClicks$.next();
}
changeEndDate(value: any, type: number) {
  // if(type == 2){
  //   console.log(value);
  //   return this.endTime.nativeElement.value = moment(new Date(new Date().setDate(new Date().getDate() + Number(value)))).format("DD/MM/YYYY");
  // }  
  // var days = moment(value, 'DD/MM/YYYY').dayOfYear() - moment(new Date()).dayOfYear() > 0 ? moment(value, 'DD/MM/YYYY').dayOfYear() - moment(new Date()).dayOfYear() : 0;
 
}

onSelectHealthFacilities(obj: any){
   this._doctors = [];
  this.dataService.getAll('doctors', obj.healthFacilitiesId).subscribe(resp => 
    {
      this._doctors = resp.items
    });    
}
onChangeHealthfacilities() {
  console.log(92)
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
  // this._doctor = [];
  // this.dataService.getAll('doctors', obj.healthFacilitiesId).subscribe(resp => this._doctor = resp.items);
  // console.log(this._doctor);
}


}
