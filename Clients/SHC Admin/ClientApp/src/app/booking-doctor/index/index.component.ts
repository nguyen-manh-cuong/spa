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
import { startWith, map } from 'rxjs/operators';



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

      this.dataService.getAll('healthfacilities', (this.appSession.user.healthFacilitiesId ? String(this.appSession.user.healthFacilitiesId) : '')).subscribe(resp => this._healthfacilities = resp.items);
      this.appSession.user.healthFacilitiesId ? this.frmSearch.controls['healthfacilities'].setValue(this.appSession.user.healthFacilitiesId) : this.filterOptions();
      if(this.appSession.user.healthFacilitiesId) this.dataService.getAll('doctors', String(this.appSession.user.healthFacilitiesId)).subscribe(resp => this._doctors = resp.items);
      this.calendarComponent.locale = viLocale;
    }

    search(){
      if(this.healthfacilities.value && this.frmSearch.controls['doctor'].value){
        this.frmSearch.controls['healthfacilities'].setValue(this.healthfacilities.value.healthFacilitiesId);
        this.dataService
        .get("bookingdoctor", JSON.stringify(_.omitBy(this.frmSearch.value, _.isNil)), '', null, null)
        .subscribe(resp => {
          this.calendarEvents = resp.items;
        });
      } else{
        this.appSession.user.healthFacilitiesId == null ? this.frmSearch.controls['healthfacilities'].setValue(null) : '';
        console.log(79, this.frmSearch.controls['healthfacilities'].value);
        swal(this.l('Notification'), this.l('Đơn vị và Bác sĩ không được để trống'), 'warning');
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

    _filter(name: any): IHealthfacilities[] {
      const filterValue = name.toLowerCase();
      var healthfacilities = isNaN(filterValue) ?         
      this._healthfacilities.filter(h => h.name.toLowerCase().indexOf(filterValue) === 0) : 
      this._healthfacilities.filter(h => h.code.toLowerCase().indexOf(filterValue) === 0);
      //if(healthfacilities.length == 0 && filterValue.length) this.frmSearch.controls['healthfacilities'].setValue(0);
      
      return healthfacilities
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
}
