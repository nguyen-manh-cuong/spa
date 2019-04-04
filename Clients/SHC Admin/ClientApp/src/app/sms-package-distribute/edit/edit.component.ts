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
  selector: 'app-packagedistributeedit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class packagedistributeEditComponent extends AppComponentBase implements OnInit {
  api: string = 'smspackagedistribute';

  _frmpackagedistributeedit: FormGroup;
  _obj: IPachkageDistribute | any = { smsBrandsId: '', healthFacilitiesId: '', monthStart: '', monthEnd: '', year: '', smsPackageId: '', status: false };
  _context: any;
  _isNew: boolean = true;
  _month = [{ id: 1, name: 'Tháng 1' }, { id: 2, name: 'Tháng 2' }, { id: 3, name: 'Tháng 3' }, { id: 4, name: 'Tháng 4' }, { id: 5, name: 'Tháng 5' }, { id: 6, name: 'Tháng 6' },
            { id: 7, name: 'Tháng 7' }, { id: 8, name: 'Tháng 8' }, { id: 9, name: 'Tháng 9' }, { id: 10, name: 'Tháng 10' }, { id: 11, name: 'Tháng 11' }, { id: 12, name: 'Tháng 12' },];
  _currentYear = moment().year();
  _currentMonth = moment().month() + 1;
  _medicalFacility = [];
  _brands = [];
  _package: any = [];

  private rules = { month: 'noSpace,capitalize', year: 'singleSpace' };

  constructor(injector: Injector, private _dataService: DataService, private datePipe: DatePipe, private _formBuilder: FormBuilder, public dialogRef: MatDialogRef<packagedistributeEditComponent>, @Inject(MAT_DIALOG_DATA) public obj: IPachkageDistribute) {
    super(injector);
  }

  ngOnInit() {
    this._dataService.getAll('smspackages').subscribe(resp => this._package = resp.items);
    if (this.obj) {
      this._obj = _.clone(this.obj);
      this._obj.monthStart = this.obj.monthStart;
      this._obj.monthEnd = this.obj.monthEnd;
      this._obj.year = this.obj.year;
    }

    this._dataService.getAll('smsbrands-all').subscribe(resp => this._brands = resp.items);
    this._dataService.getAll('healthfacilities').subscribe(resp => this._medicalFacility = resp.items);
    this._dataService.getAll('smspackages-all').subscribe(resp => this._package = resp.items);
    this._context = {
      healthFacilitiesId: [this._obj.healthFacilitiesId, Validators.required],
      smsBrandsId: [this._obj.smsBrandsId, Validators.required],
      monthStart: [this._obj.monthStart, ],
      monthEnd: [this._obj.monthEnd, ],
      year: [this._obj.year, [Validators.maxLength(4), Validators.pattern('[0-9]*')]],
      smsPackageId: [this._obj.smsPackageId, Validators.required],
      status: [this._obj.status],
    };
    this._frmpackagedistributeedit = this._formBuilder.group(this._context);
  }

  submit() {
    this._frmpackagedistributeedit.value.status = this._frmpackagedistributeedit.value.status == true ? 1 : 0;
    this._frmpackagedistributeedit.value.month = this._frmpackagedistributeedit.value.month == null || this._frmpackagedistributeedit.value.month == "" ? 1 : this._frmpackagedistributeedit.value.month;
    this._dataService.update(this.api, standardized(Object.assign(this._frmpackagedistributeedit.value, { id: this.obj.id }), this.rules)).subscribe(() => {
      swal(this.l('SaveSuccess'), '', 'success');
      this.dialogRef.close();
    }, err => console.log(err));
  }
}
