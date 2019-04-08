import { ICategoryCommon } from './../../../shared/Interfaces';
import { AfterViewInit, Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatButton, MatDialog, MatDialogRef, MatSort } from '@angular/material';
import { Subject, merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { compact, isEmpty, omitBy, zipObject } from 'lodash';

import { DataService } from '@shared/service-proxies/service-data';
import { ILanguage, IBookingTimeslots } from '@shared/Interfaces';
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { TaskComponent } from '../task/task.component';
import swal from 'sweetalert2';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent extends PagedListingComponentBase<ICategoryCommon> implements OnInit {

  displayedColumns = [ 'orderNumber', 'code', 'name', 'isActive', 'task'];

  constructor(injector: Injector, private _dataService: DataService, public dialog: MatDialog, private _formBuilder: FormBuilder) { super(injector); }

  ngOnInit() {
    this.api = 'catcommon';
    this.dataService = this._dataService;
    this.dialogComponent = TaskComponent;
    this.frmSearch = this._formBuilder.group({ name: []});
  }
  Test($event){
    console.log($event.value);
  }
}
