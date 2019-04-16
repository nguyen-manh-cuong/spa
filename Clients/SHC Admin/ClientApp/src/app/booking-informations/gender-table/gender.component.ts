import { AfterViewInit, Component, Injector, OnInit, ViewChild } from '@angular/core';
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
  selector: 'app-gender',
  templateUrl: './gender.component.html',
  styleUrls: ['./gender.component.scss'],
})
export class GenderComponent extends AppComponentBase implements OnInit {
    dataSources = new MatTableDataSource();

    arrayGender = [];
    frmSearch: FormGroup;
    ruleSearch = {};

    displayedColumns = ['orderNumber', 'quantity', 'quantityByGederMale'];
  constructor(injector: Injector, private _dataService: DataService, public dialog: MatDialog, private _formBuilder: FormBuilder) { super(injector); }


    ngOnInit() {
        this.frmSearch = this._formBuilder.group({
            keyFilter: [],
            healthfacilities: [this.appSession.user.healthFacilitiesId],
            bookingServiceType: [],
            bookingInformationsTime: [],
            doctor: [],
            startTime: new Date(),
            endTime: new Date(),
        });
        this._dataService.get('bookinginformations', JSON.stringify(standardized(omitBy(this.frmSearch.value, isNil), this.ruleSearch)), '', 0, 1000).subscribe(resp => {
            for (var item of resp.items) {
                if (this.arrayGender.length < 2) {
                  this.arrayGender.push(item);
                }
            }
          this.dataSources.data = this.arrayGender;
        });
    

  }


}
