import { AfterViewInit, Component, Injector, OnInit, ViewChild, Input} from '@angular/core';
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
    dataSourcesGender = new MatTableDataSource();
    @Input('master') masterName: string;
    //@Input('quantityBooking') quantityBookingName: any;
    arrayGender = [{ position: 1, sex: 'Nam', quantityGender: 0 }, { position: 2, sex: 'Nữ', quantityGender: 0 }];
    frmSearch: FormGroup;
    ruleSearch = {};
    time: [0];
    displayedColumns = ['orderNumber', 'sex', 'quantity'];
  constructor(injector: Injector, private _dataService: DataService, public dialog: MatDialog, private _formBuilder: FormBuilder) { super(injector); }


    ngOnInit() {
        this.frmSearch = this._formBuilder.group({
          healthfacilities: [this.appSession.user.healthFacilitiesId],
          doctor : [],      
          status: [4],         
          startTime: new Date(),
          endTime: new Date(),          
        });
        this._dataService.get('bookinginformations', JSON.stringify(standardized(omitBy(this.frmSearch.value, isNil), this.ruleSearch)), '', 0, 1000).subscribe(resp => {
            var count = 0;
            for (var item of resp.items) {
                if (count == 0) {
                    this.arrayGender[0].quantityGender = item.quantityByGenderMale;
                }
                if (count == 1) {
                    this.arrayGender[1].quantityGender = item.quantityByGenderFemale;
                }
                count++;
            }
          this.dataSourcesGender.data = this.arrayGender;
        });
  
  }
  reloadGender(_quantityByGenderFemale: any, _quantityByGenderMale: any){
    this.arrayGender[0].quantityGender = _quantityByGenderMale;
    this.arrayGender[1].quantityGender = _quantityByGenderFemale;
    this.dataSourcesGender.data = this.arrayGender;       
  }

}
