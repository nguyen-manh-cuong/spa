import * as _ from 'lodash';

import { Component, Inject, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { AppComponentBase } from '@shared/app-component-base';
import { DataService } from '@shared/service-proxies/service-data';
import { IPachkageDistribute } from '@shared/Interfaces';
import { standardized } from '@shared/helpers/utils';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import swal from 'sweetalert2';

@Component({
  selector: 'app-packagedistributetask',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss']
})

export class packagedistributeTaskComponent extends AppComponentBase implements OnInit {
  api: string = 'smspackagedistribute';

  _frmpackagedistribute: FormGroup;
    _obj: IPachkageDistribute | any = { smsBrandsId: '', healthFacilitiesId: '', monthStart: '', monthEnd: '', yearStart: '', yearEnd: '', smsPackageId: '', isActive: false };
  _context: any;
  _isNew: boolean = true;
  _month = [{ id: 1, name: 'Tháng 1' }, { id: 2, name: 'Tháng 2' }, { id: 3, name: 'Tháng 3' }, { id: 4, name: 'Tháng 4' }, { id: 5, name: 'Tháng 5' }, { id: 6, name: 'Tháng 6' },
            { id: 7, name: 'Tháng 7' }, { id: 8, name: 'Tháng 8' }, { id: 9, name: 'Tháng 9' }, { id: 10, name: 'Tháng 10' }, { id: 11, name: 'Tháng 11' }, { id: 12, name: 'Tháng 12' },];
  _medicalFacility = [];
  _package: any = [];
  _brands = [];
  _currentYear = moment().year();
  _currentMonth = moment().month() + 1;

  private rules = { month: 'noSpace,capitalize', year: 'singleSpace' };

  constructor(injector: Injector, private _dataService: DataService, private datePipe: DatePipe, private _formBuilder: FormBuilder, public dialogRef: MatDialogRef<packagedistributeTaskComponent>, @Inject(MAT_DIALOG_DATA) public obj: IPachkageDistribute) {
    super(injector);
  }

  ngOnInit() {
    if (this.obj) {
      this._obj = _.clone(this.obj);
      this._obj.monthStart = this.obj.monthStart;
      this._obj.monthEnd = this.obj.monthEnd;
        this._obj.yearStart = this.obj.yearStart;
        this._obj.yearEnd = this.obj.yearEnd;
      this._isNew = false;
    }
    else{
      this._obj.healthFacilitiesId = [];
      this._obj.monthStart = Number(this.datePipe.transform(Date.now(), "M"));
      this._obj.monthEnd = Number(this.datePipe.transform(Date.now(), "M"));
        this._obj.yearStart = Number(this.datePipe.transform(Date.now(), "yyyy"));
        this._obj.yearEnd = Number(this.datePipe.transform(Date.now(), "yyyy"));
      this._obj.isActive = true;
    }

    this._dataService.getAll('smsbrands-all').subscribe(resp => this._brands = resp.items);
    this._dataService.getAll('healthfacilities').subscribe(resp => this._medicalFacility = resp.items);
    this._dataService.getAll('smspackages-cbo').subscribe(resp => this._package = resp.items);
    this._context = {
      healthFacilitiesId: [this._obj.healthFacilitiesId, Validators.required],
      smsBrandsId: [this._obj.smsBrandsId, Validators.required],
      monthStart: [this._obj.monthStart, ],
      monthEnd: [this._obj.monthEnd, ],
        yearStart: [this._obj.yearStart, [Validators.maxLength(4), Validators.pattern('[0-9]*')]],
        yearEnd: [this._obj.yearEnd, [Validators.maxLength(4), Validators.pattern('[0-9]*')]],
      smsPackageId: [this._obj.smsPackageId, Validators.required],
      isActive: [this._obj.isActive],
      userId: []
    };
    // this._context = {
    //   healthFacilitiesId: [this._obj.healthFacilitiesId, Validators.required],
    //   smsBrandsId: [this._obj.smsBrandsId, Validators.required],
    //   monthStart: [this._obj.monthStart, ],
    //   monthEnd: [this._obj.monthEnd, validationRule.compare('monthStart', 'monthEnd')],
    //   yearFrom: [this._obj.year, []],
    //   yearTo: [this._obj.year, []],
    //   smsPackageId: [this._obj.smsPackageId, Validators.required],
    //   isActive: [this._obj.isActive],
    //   userId: []
    // };
    this._frmpackagedistribute = this._formBuilder.group(this._context);
  }

  submit() {
    this._frmpackagedistribute.value.userId = this.appSession.userId;

    if (this._isNew) {
      this._dataService.create(this.api, standardized(_.omit(Object.assign(this._frmpackagedistribute.value), 'id'), this.rules)).subscribe(() => {
        swal(this.l('SaveSuccess'), '', 'success');
        this.dialogRef.close();
      }, err => console.log(err));
    } else {
      this._dataService.update(this.api, standardized(Object.assign(this._frmpackagedistribute.value, { id: this.obj.id }), this.rules)).subscribe(() =>  {
        swal(this.l('SaveSuccess'), '', 'success');
        this.dialogRef.close();
      }, err => console.log(err));
    }
  }
}
