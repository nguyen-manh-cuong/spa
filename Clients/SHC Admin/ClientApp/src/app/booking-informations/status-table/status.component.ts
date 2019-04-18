import { AfterViewInit, Component, Injector, OnInit, ViewChild, Output, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatButton, MatDialog, MatPaginator, MatTableDataSource } from '@angular/material';
import { Subject, merge, of } from 'rxjs';
import { standardized } from '../../../shared/helpers/Utils';
import { isEmpty, isNil, isNull, omitBy, zipObject } from 'lodash';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { SelectionModel } from '@angular/cdk/collections';
import { AppComponentBase } from 'shared/app-component-base';
import { DataService } from '@shared/service-proxies/service-data';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss'],
})
export class StatusComponent extends AppComponentBase implements OnInit {
    dataSourcesStatus = new MatTableDataSource();
    arrayStatus = [{ position: 1, status: 'Đã khám', quantitystatus: 0 }, { position: 2, status: 'Chờ khám', quantitystatus: 0 }, { position: 3, status: 'Hủy khám', quantitystatus: 0 }, { position: 4, status: 'Mới đăng ký', quantitystatus: 0 }];
    frmSearch: FormGroup;
    ruleSearch = {};

    @Input() childMessage2: string;

    displayedColumns = ['orderNumber', 'status', 'quantitystatus'];
  constructor(injector: Injector, private _dataService: DataService, public dialog: MatDialog, private _formBuilder: FormBuilder) { super(injector); }


    ngOnInit() {
        this.frmSearch = this._formBuilder.group({
          healthfacilities: [this.appSession.user.healthFacilitiesId],
          doctor : [],      
          status: [4],         
          startTime: new Date(),
          endTime: new Date(),
          time: [0],
        });
        this.reloadStatus()
  }

  reloadStatus(){
    console.log('reloadStatus')
    this._dataService.get('bookinginformations', JSON.stringify(standardized(omitBy(this.frmSearch.value, isNil), this.ruleSearch)), '', 0, 1000).subscribe(resp => {      
      for (var item of resp.items) {                
          this.arrayStatus[0].quantitystatus = item.quantityByStatusDone;
          this.arrayStatus[1].quantitystatus = item.quantityByStatusPending;
          this.arrayStatus[2].quantitystatus = item.quantityByStatusCancel;
          this.arrayStatus[3].quantitystatus = item.quantityByStatusNew;       
      }
    this.dataSourcesStatus.data = this.arrayStatus;
  });
  }
  
}