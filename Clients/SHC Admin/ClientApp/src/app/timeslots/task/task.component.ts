import * as _ from 'lodash';

import { Component, Inject, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { AppComponentBase } from '@shared/app-component-base';
import { DataService } from '@shared/service-proxies/service-data';
import { ILanguage } from '@shared/Interfaces';
import { standardized } from '@shared/helpers/utils';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss']
})
export class TaskComponent extends AppComponentBase implements OnInit {
  api: string = 'languages';

  _frm: FormGroup;
  _obj: ILanguage | any = { key: '', page: '', vi: '', en: '' };
  _context: any;
  _isNew: boolean = true;

  private rules = { key: 'noSpace', page: 'noSpace,capitalize', vi: 'singleSpace', en: 'singleSpace' };

  constructor(injector: Injector, private _dataService: DataService, private _formBuilder: FormBuilder, public dialogRef: MatDialogRef<TaskComponent>, @Inject(MAT_DIALOG_DATA) public obj: ILanguage) {
    super(injector);
  }

  ngOnInit() {
    if (this.obj) {
      this._obj = _.clone(this.obj);
      this._isNew = false;
    }
    this._context = {
      key: [this._obj.key, Validators.required],
      page: [this._isNew ? 'Default' : this._obj.page, Validators.required],
      vi: [this._obj.vi, Validators.required],
      en: [this._obj.en, Validators.required],
    };
    this._frm = this._formBuilder.group(this._context);
  }

  submit() {
    this._isNew ?
      this._dataService.create(this.api, standardized(_.omit(Object.assign(this._frm.value), 'id'), this.rules)).subscribe(() => this.dialogRef.close(), err => console.log(err)) :
      this._dataService.update(this.api, standardized(Object.assign(this._frm.value, { id: this.obj.id }), this.rules)).subscribe(() => this.dialogRef.close(), err => console.log(err));
  }
}
