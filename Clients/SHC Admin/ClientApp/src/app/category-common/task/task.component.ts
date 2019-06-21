import * as _ from 'lodash';

import { Component, Inject, Injector, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ICategoryCommon } from '@shared/Interfaces';
import { MAT_DIALOG_DATA, MatDialogRef, MatInput } from '@angular/material';

import { AppComponentBase } from '@shared/app-component-base';
import { DataService } from '@shared/service-proxies/service-data';
import { ValidationRule } from '@shared/common/common';
import swal from 'sweetalert2';
import { publishBehavior } from 'rxjs/operators';
import { notifyToastr } from '@shared/helpers/utils';


@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss']
})
export class TaskComponent extends AppComponentBase implements OnInit, AfterViewInit {
  api: string = 'catcommon';
  
  _frm: FormGroup;
  _obj: ICategoryCommon | any = {  name: '', code: '', isActive:'' };
  _context: any;
  _isNew: boolean = true;

  constructor(
    injector: Injector,
    private _dataService: DataService,
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<TaskComponent>,
    @Inject(MAT_DIALOG_DATA)
    public obj: ICategoryCommon) {
    super(injector);
  }

  ngOnInit() {

    const validationRule = new ValidationRule();
    if (this.obj) {
      this._obj = _.clone(this.obj);
      this._isNew = false;
    }
    
    this._context = {
      name: [this._obj.name, [Validators.required, validationRule.hasValue]],
      code: [this._obj.code, [Validators.required, validationRule.hasValue]],
      isActive: [this._obj.isActive ? this._obj.isActive:true]
    };

    this._frm = this._formBuilder.group(this._context);
    if(this.obj)
      //(this._obj.distribute != 0 && this._isNew == false) ? this._frm.controls['code'].disable() : '';
      this._frm.controls['isActive'].setValue(this._obj.isActive);
      
  }

  ngAfterViewInit(): void {
  }

  submit() {
    var params = _.pick(this._frm.value, ['id','name', 'code', 'isActive','createUserId','updateUserId']);

    params.name = _.trim(params.name);
    params.code = _.trim(params.code);

    if(this.obj){
      params.id=this.obj.id;
    }

    if(this.appSession.userId && this._isNew==true){
      params.createUserId=this.appSession.userId;
      params.updateUserId=this.appSession.userId;
    }

    if(this.appSession.userId && this._isNew==false){
      params.updateUserId=this.appSession.userId;
    }

    this._isNew ?
      this._dataService.create(this.api, params).subscribe(() => {
        notifyToastr(this.l('SaveSuccess'),'','success');
        // swal({
        //   title:this.l('SaveSuccess'),
        //   text:'',
        //   type:'success',
        //   timer:3000
        // })
        this.dialogRef.close();
      }, err => { }) :
      this._dataService.update(this.api, params).subscribe(() => {
        notifyToastr(this.l('SaveSuccess'), '', 'success');
        // swal({
        //   title:this.l('SaveSuccess'),
        //   text:'',
        //   type:'success',
        //   timer:3000
        // })
        this.dialogRef.close();
      }, err => { });
  }
}
