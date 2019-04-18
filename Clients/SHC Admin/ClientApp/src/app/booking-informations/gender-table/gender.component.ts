import { AfterViewInit, Component, Injector, OnInit, ViewChild, Input  } from '@angular/core';
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

    @Input() childMessage: string;

    arrayGender = [{ position: 1, sex: 'Nam', quantity: 0 }, { position: 2, sex: 'Nữ', quantity: 0 }];
    frmSearch: FormGroup;
    ruleSearch = {};
    displayedColumns = ['orderNumber', 'sex', 'quantity'];
  constructor(injector: Injector, private _dataService: DataService, public dialog: MatDialog, private _formBuilder: FormBuilder) { super(injector); }


    ngOnInit() {

        console.log(this.childMessage);

        this.frmSearch = this._formBuilder.group({
          healthfacilities: [this.appSession.user.healthFacilitiesId],
          doctor : [],      
          status: [4],         
          startTime: new Date(),
          endTime: new Date(),
          time: [0],
        });

        this._dataService.get('bookinginformations', JSON.stringify(standardized(omitBy(this.frmSearch.value, isNil), this.ruleSearch)), '', 0, 1000).subscribe(resp => {
            var count = 0;
            for (var item of resp.items) {
                if (count == 0) {
                    this.arrayGender[0].quantity = item.quantityByGenderMale;
                }
                if (count == 1) {
                    this.arrayGender[1].quantity = item.quantityByGenderFemale;
                }
                count++;
            }
          this.dataSources.data = this.arrayGender;
        });
    

  }


}
