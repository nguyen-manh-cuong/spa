import * as _ from 'lodash';

import { Component, Inject, Injector, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { AppComponentBase } from '@shared/app-component-base';
import { DataService } from '@shared/service-proxies/service-data';
import { IPachkageDistribute } from '@shared/Interfaces';
import { standardized } from '@shared/helpers/utils';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';

@Component({
  selector: 'app-packagedistributeview',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class packagedistributeViewComponent extends AppComponentBase implements OnInit {
  api: string = 'smspackagedistribute';

  _frmpackagedistributeview: FormGroup;
    _obj: IPachkageDistribute | any = { smsBrandsId: '', healthFacilitiesId: '', monthStart: '', monthEnd: '', yearStart: '', yearEnd: '', smsPackageId: '', isActive: false };
  _context: any;
  _isNew: boolean = true;
  _month = [{ id: 1, name: 'tháng 1' }, { id: 2, name: 'tháng 2' }, { id: 3, name: 'tháng 3' }, { id: 4, name: 'tháng 4' }, { id: 5, name: 'tháng 5' }, { id: 6, name: 'tháng 6' },
            { id: 7, name: 'tháng 7' }, { id: 8, name: 'tháng 8' }, { id: 9, name: 'tháng 9' }, { id: 10, name: 'tháng 10' }, { id: 11, name: 'tháng 11' }, { id: 12, name: 'tháng 12' },];
  _medicalFacility = [];
  _package: any = [];
  _brands: any [];

  constructor(injector: Injector, private _dataService: DataService, private datePipe: DatePipe, private _formBuilder: FormBuilder, public dialogRef: MatDialogRef<packagedistributeViewComponent>, @Inject(MAT_DIALOG_DATA) public obj: IPachkageDistribute) {
    super(injector);
  }

  ngOnInit() {
    this._dataService.getAll('smsbrands-all').subscribe(resp => this._brands = resp.items);
    this._dataService.getAll('healthfacilities').subscribe(resp => this._medicalFacility = resp.items);
    this._dataService.getAll('smspackages-all').subscribe(resp => this._package = resp.items);
      if (this.obj) {
          this._obj = _.clone(this.obj);
          console.log(this._obj);
      this._obj.monthStart = this.obj.monthStart;
        this._obj.monthEnd = this.obj.monthEnd;
        this._obj.yearStart = this.obj.yearStart;
        this._obj.yearEnd = this.obj.yearEnd;
    }

    this._context = {
      healthFacilitiesId: [this._obj.healthFacilitiesId, Validators.required],
      smsBrandsId: [this._obj.smsBrandsId, Validators.required],
      monthStart: [this._obj.monthStart, ],
      monthEnd: [this._obj.monthEnd, ],
        toYear: [this._obj.yearStart, [Validators.maxLength(4), Validators.min(0), Validators.max(9999), Validators.pattern('[0-9]*')]],
        fromYear: [this._obj.yearEnd, [Validators.maxLength(4), Validators.min(0), Validators.max(9999), Validators.pattern('[0-9]*')]],
      smsPackageId: [this._obj.smsPackageId, Validators.required],
      isActive: [this._obj.isActive],
      quantity: [this._obj.quantity]
    };
    this._frmpackagedistributeview = this._formBuilder.group(this._context);
  }
}
