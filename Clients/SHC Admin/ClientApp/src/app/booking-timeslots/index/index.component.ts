import { AfterViewInit, Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatButton, MatDialog, MatDialogRef } from '@angular/material';
import { Subject, merge, of } from 'rxjs';
import { Observable } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { compact, isEmpty, omitBy, zipObject } from 'lodash';
import { SelectionModel } from '@angular/cdk/collections';
import { DataService } from '@shared/service-proxies/service-data';
import { ILanguage, IBookingTimeslots, IHealthfacilities, IMedicalHealthcareHistories } from '@shared/Interfaces';
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { TaskComponent } from '../task/task.component';
import swal from 'sweetalert2';

export class EntityDto {
  id: number;
  isActive:boolean;
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

  displayedColumns = [ 'orderNumber', 'healthFacilitiesName', 'code', 'name', 'time', 'status', 'task'];

  constructor(injector: Injector, private _dataService: DataService, public dialog: MatDialog, private _formBuilder: FormBuilder) { super(injector); }

  ngOnInit() {   
    this.api = 'bookingtimeslots';
    this.dataService = this._dataService;
    this.dialogComponent = TaskComponent;  
    this.frmSearch = this._formBuilder.group({
       keyFilter: [],     
       healthfacilities: [this.appSession.user.healthFacilitiesId],
      });

    this.dataService.getAll('healthfacilities', (this.appSession.user.healthFacilitiesId ? String(this.appSession.user.healthFacilitiesId) : '')).subscribe(resp => 
    {
      this._healthfacilities = resp.items;      
    });
  }
  displayFn(h?: IHealthfacilities): string | undefined {
    return h ? h.name : undefined;
}

  _filter(name: string): IHealthfacilities[] {
    const filterValue = name.toLowerCase();
    return this._healthfacilities.filter(h => h.name.toLowerCase().indexOf(filterValue) === 0);
}

showMess(obj: EntityDto, key: string, id?: number | string){
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
        title:this.l('Xóa không thành công'), 
        text:'Không thể xóa khung giờ khám đang hoạt động!',
        type: 'error',
        timer:3000});
  }
});  
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
  this.btnSearchClicks$.next();
}

showNotify(obj: EntityDto, key: string, id?: number | string) {
  swal({
    title:this.l('Không thể xóa khung giờ khám đang hoạt động'), 
    text:'', 
    type:'error',
    timer:3000});
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
