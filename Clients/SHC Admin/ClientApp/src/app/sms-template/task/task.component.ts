import * as _ from 'lodash';

import { Component, Inject, Injector, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IUser, ICategoryCommon, ISmsTemplate } from '@shared/Interfaces';
import { MAT_DIALOG_DATA, MatDialogRef, MatInput } from '@angular/material';

import { AppComponentBase } from '@shared/app-component-base';
import { DataService } from '@shared/service-proxies/service-data';
import { SelectionModel } from '@angular/cdk/collections';
import { ValidationRule } from '@shared/common/common';
import swal from 'sweetalert2';


@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss']
})
export class TaskComponent extends AppComponentBase implements OnInit, AfterViewInit {

  api: string = 'sms-templates';

  _frm: FormGroup;
  _smstemplates: ISmsTemplate | any = { smsTemplateName: '', messageType: '',messageContent:'',status:'',applyAllSystem:'' };
  _users: Array<IUser> = [];
  _selection = new SelectionModel<IUser>(true, []);
  _context: any;
  _isNew: boolean = true;
  _messageType: Array<ICategoryCommon> = [];
  dataService: DataService;

  @ViewChild("txtName") txtName: MatInput;

  constructor(injector: Injector, private _dataService: DataService, private _formBuilder: FormBuilder, public dialogRef: MatDialogRef<TaskComponent>, @Inject(MAT_DIALOG_DATA) public smstemplate: ISmsTemplate) { super(injector); }

  ngOnInit() {
    const validationRule = new ValidationRule();

    this.dataService = this._dataService;
    this.dataService.getAll('categorycommon', 'LOAITINNHAN').subscribe(resp => this._messageType = resp.items);
    this._smstemplates.status = true;
    this._smstemplates.applyAllSystem = true;

    if (this.smstemplate) {
      this._smstemplates = _.clone(this.smstemplate);
      this._isNew = false;
    }

    this._context = {
      smsTemplateName: [this._smstemplates.smsTemplateName, [Validators.required, validationRule.hasValue]],
      messageType: [this._smstemplates.messageType, ],
      smsContent:[this._smstemplates.smsContent, [Validators.required, validationRule.hasValue]],
      status:[this._smstemplates.status],
      applyAllSystem:[this._smstemplates.applyAllSystem],
      organizationName: [this._smstemplates.organizationName],
      healthFacilitiesId: [],
      userId: []
    };
    console.log(this._context);
    this._frm = this._formBuilder.group(this._context);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
        this.txtName.focus();
    }, 500);
  }

  submit() {
    this._frm.value.smsTemplateName = this._frm.value.smsTemplateName.trim();
    this._frm.value.smsContent = this._frm.value.smsContent.trim();
    this._frm.value.healthFacilitiesId = this.appSession.user.healthFacilitiesId;
    this._frm.value.userId = this.appSession.userId;
    this.appSession.user.healthFacilitiesId ? this._frm.value.applyAllSystem = false: '';

    this._isNew ?
      this._dataService.create(this.api, this._frm.value).subscribe(() => {
        swal(this.l('SaveSuccess'), '', 'success');
        this.dialogRef.close();
      }, err => console.log(err)) :
      this._dataService.update(this.api, Object.assign(this._frm.value, { id: this.smstemplate.id})).subscribe(() => {
        swal(this.l('SaveSuccess'), '', 'success');
        this.dialogRef.close();
      }, err => console.log(err));
  }
  
  mescontent : string = '';
  changeSelected(e) { 
    if(e == 1)
    {
      this._context.mescontent = this._frm.controls['smsContent'].value;
      if(this._context.mescontent == null){
        this._frm.controls['smsContent'].setValue(' <PHONGKHAM>');
      }else{
        this._frm.controls['smsContent'].setValue(this._context.mescontent + ' <PHONGKHAM>');
      }
    }
    if(e == 2)
    {
      this._context.mescontent = this._frm.controls['smsContent'].value;
      if(this._context.mescontent == null){
        this._frm.controls['smsContent'].setValue(' <NGAYSINH>');
      }else{
        this._frm.controls['smsContent'].setValue(this._context.mescontent + ' <NGAYSINH>');
      }
    }
    if(e == 3)
    {
      this._context.mescontent = this._frm.controls['smsContent'].value;
      if(this._context.mescontent == null){
        this._frm.controls['smsContent'].setValue(' <HOTEN>');
      }else{
        this._frm.controls['smsContent'].setValue(this._context.mescontent + ' <HOTEN>');
      }
    }
    if(e == 4)
    {
      this._context.mescontent = this._frm.controls['smsContent'].value;
      if(this._context.mescontent == null){
        this._frm.controls['smsContent'].setValue(' <EMAIL>');
      }else{
        this._frm.controls['smsContent'].setValue(this._context.mescontent + ' <EMAIL>');
      }
    }
    if(e == 5)
    {
      this._context.mescontent = this._frm.controls['smsContent'].value;
      if(this._context.mescontent == null){
        this._frm.controls['smsContent'].setValue(' <GIOITINH>');
      }else{
        this._frm.controls['smsContent'].setValue(this._context.mescontent + ' <GIOITINH>');
      }
    }
    if(e == 6)
    {
      this._context.mescontent = this._frm.controls['smsContent'].value;
      if(this._context.mescontent == null){
        this._frm.controls['smsContent'].setValue(' <NGAYHIENTAI>');
      }else{
        this._frm.controls['smsContent'].setValue(this._context.mescontent + ' <NGAYHIENTAI>');
      }
    }
    if(e == 7)
    {
      this._context.mescontent = this._frm.controls['smsContent'].value;
      if(this._context.mescontent == null){
        this._frm.controls['smsContent'].setValue(' <NGAYTAIKHAM>');
      }else{
        this._frm.controls['smsContent'].setValue(this._context.mescontent + ' <NGAYTAIKHAM>');
      }
    }
  }}
