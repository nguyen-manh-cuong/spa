import swal from 'sweetalert2';
import * as moment from 'moment';
import * as _ from 'lodash';

import { Component, Injector, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { IBookingDoctorsApprove, IHealthfacilities } from '@shared/Interfaces';
import { MatDialog } from '@angular/material';
import { DataService } from '@shared/service-proxies/service-data';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AppComponentBase } from '@shared/app-component-base';
import { TaskComponent } from '../task/task.component';

import { FullCalendarComponent } from '@fullcalendar/angular';
import { EventInput } from '@fullcalendar/core';
import viLocale from '@fullcalendar/core/locales/vi';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGrigPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Observable } from 'rxjs';
import { startWith, map, debounceTime, tap, switchMap, finalize } from 'rxjs/operators';



@Component({
    selector: 'app-index',
    templateUrl: './index.component.html',
    styleUrls: ['./index.component.scss'],
    encapsulation: ViewEncapsulation.None
})
  export class IndexComponent extends AppComponentBase implements OnInit {   
    _healthfacilities = [];
    _doctors = [];
    _months = _.range(1, 13);
    _status = [{ id: 3, name: 'Tất cả'}, { id: 0, name: 'Chờ duyêt'}, { id: 1, name: 'Đã duyệt'}, { id: 2, name: 'Đã hủy'}];

    healthfacilities = new FormControl();
    filteredOptions: Observable<IHealthfacilities[]>;
    dataService: DataService;
    frmSearch: FormGroup;

    isLoading = false;
    showFilter: boolean = true;
    dialogTask: any;
    calendarWeekends = true;
    calendarPlugins = [listPlugin, dayGridPlugin, timeGrigPlugin, interactionPlugin];
    calendarEvents: EventInput[] = [];

    @ViewChild('calendar') calendarComponent: FullCalendarComponent; 
 
    constructor(injector: Injector, private _dataService: DataService, public dialog: MatDialog, private _formBuilder: FormBuilder) {
      super(injector);
    }

    ngOnInit() {
      this.frmSearch = this._formBuilder.group({ 
          healthfacilities: [], 
          doctor: [], 
          month: [new Date().getMonth() + 1],
          status: [3] });

      this.dataService = this._dataService;
      this.dialogTask = TaskComponent;

      this.calendarComponent.locale = viLocale;

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
    }

    search(){
      if(((!this.appSession.user.healthFacilitiesId && this.healthfacilities.value) || (this.appSession.user.healthFacilitiesId))  && this.frmSearch.controls['doctor'].value){
        !this.appSession.user.healthFacilitiesId ? this.frmSearch.controls['healthfacilities'].setValue(this.healthfacilities.value.healthFacilitiesId) : "";
        
        this.dataService
        .get("bookingdoctor", JSON.stringify(_.omitBy(this.frmSearch.value, _.isNil)), '', null, null)
        .subscribe(resp => {
          this.calendarEvents = resp.items;
        });
      } else{
        this.appSession.user.healthFacilitiesId == null ? this.frmSearch.controls['healthfacilities'].setValue(null) : '';
        swal(this.l('Notification'), this.l('HealthfacilitiesAndDoctorNotNull'), 'warning');
      }    
    }

    //dialog detail 
    openDialog(obj): void{
      this.dialog.open(this.dialogTask, { minWidth: 'calc(100vw/2)', maxWidth: 'calc(100vw - 300px)', data: obj ? obj : null });
      //dialogRef.afterClosed().subscribe(() => this.paginator._changePageSize(this.paginator.pageSize));
    }

    //filter autocomplete
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

    closed(): void {
      if(this.healthfacilities.value && typeof this.healthfacilities.value == 'string' && !this.healthfacilities.value.trim()) this.healthfacilities.setErrors({required: true})
    }

    onSelectHealthFacilities(obj: any) {
      this._doctors = [];
      this.dataService.getAll('doctors', obj.healthFacilitiesId).subscribe(resp => this._doctors = resp.items);
    }

    //calendar
    handleEvent (obj: any) {
      if(obj.view.type == "listWeek"){
        var des = obj.event.extendedProps.description ? obj.event.extendedProps.description : "";
        obj.el.innerHTML = obj.el.innerHTML.split("<a>")[0] + des + "</a></td>";
      }
    }

    //filter
    toggedFilter() {
      const _filter = $('form.form-filter');
      if (_filter.length <= 0) { return; }
      this.showFilter = !this.showFilter;
      _filter.css({ 'height': this.showFilter ? 'auto' : 0, 'overflow': this.showFilter ? 'auto' : 'hidden' });
      //this.setTableHeight();


  }
}
