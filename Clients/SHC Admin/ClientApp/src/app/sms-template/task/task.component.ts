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
  _smstemplates: ISmsTemplate | any = { smsTemplateName: '', messageType: '',messageContent:'',isActive:'',applyAllSystem:'', id: 0 };
    _users: Array<IUser> = [];
  _selection = new SelectionModel<IUser>(true, []);
  _context: any;
    _isNew: boolean = true;
    _isUsedSuccess: boolean = false;
  _messageType: Array<ICategoryCommon> = [];
  dataService: DataService;

  @ViewChild("txtName") txtName: MatInput;

  constructor(injector: Injector, private _dataService: DataService, private _formBuilder: FormBuilder, public dialogRef: MatDialogRef<TaskComponent>, @Inject(MAT_DIALOG_DATA) public smstemplate: ISmsTemplate) { super(injector); }

  ngOnInit() {
    const validationRule = new ValidationRule();

    this.dataService = this._dataService;
      this.dataService.getAll('categorycommon', 'LOAITINNHAN').subscribe(resp => this._messageType = resp.items);
    this._smstemplates.isActive = true;
      this._smstemplates.applyAllSystem = true;

    if (this.smstemplate) {
        this._smstemplates = _.clone(this.smstemplate);
        console.log(this._smstemplates);
        this.dataService.getAll('smslog', JSON.stringify({ smsTemplateId: this._smstemplates.id, status: '1' })).subscribe(resp => resp.items.length > 0 ? this._isUsedSuccess = true : this._isUsedSuccess = false);
      this._isNew = false;
    }

    this._context = {
      smsTemplateName: [this._smstemplates.smsTemplateName, [Validators.required, validationRule.hasValue]],
      messageType: [this._smstemplates.messageType, ],
      smsContent: [this._smstemplates.smsContent, [Validators.required, validationRule.hasValue]],
      isActive: [this._smstemplates.isActive],
      applyAllSystem: [this._smstemplates.applyAllSystem],
      organizationName: [this._smstemplates.organizationName],
      healthFacilitiesId: [],
      userId: []
    };
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
      this._frm.value.createUserId = this.appSession.user.id;
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
        switch (e) {
            case 1:
                this._context.mescontent = this._frm.controls['smsContent'].value;
                if (this._context.mescontent == null) {
                    this._frm.controls['smsContent'].setValue(' <PHONGKHAM>');
                } else {
                    this._frm.controls['smsContent'].setValue(this._context.mescontent + ' <PHONGKHAM>');
                }
                break;
            case 2:
                this._context.mescontent = this._frm.controls['smsContent'].value;
                if (this._context.mescontent == null) {
                    this._frm.controls['smsContent'].setValue(' <PHONGKHAM>');
                } else {
                    this._frm.controls['smsContent'].setValue(this._context.mescontent + ' <NGAYSINH>');
                }
                break;
            case 3:
                this._context.mescontent = this._frm.controls['smsContent'].value;
                if (this._context.mescontent == null) {
                    this._frm.controls['smsContent'].setValue(' <HOTEN>');
                } else {
                    this._frm.controls['smsContent'].setValue(this._context.mescontent + ' <HOTEN>');
                }
                break;
            case 4:
                this._context.mescontent = this._frm.controls['smsContent'].value;
                if (this._context.mescontent == null) {
                    this._frm.controls['smsContent'].setValue(' <EMAIL>');
                } else {
                    this._frm.controls['smsContent'].setValue(this._context.mescontent + ' <EMAIL>');
                }
                break;
            case 5:
                this._context.mescontent = this._frm.controls['smsContent'].value;
                if (this._context.mescontent == null) {
                    this._frm.controls['smsContent'].setValue(' <GIOITINH>');
                } else {
                    this._frm.controls['smsContent'].setValue(this._context.mescontent + ' <GIOITINH>');
                }
                break;
            case 6:
                this._context.mescontent = this._frm.controls['smsContent'].value;
                if (this._context.mescontent == null) {
                    this._frm.controls['smsContent'].setValue(' <NGAYHIENTAI>');
                } else {
                    this._frm.controls['smsContent'].setValue(this._context.mescontent + ' <NGAYHIENTAI>');
                }
                break;
            case 7:
                this._context.mescontent = this._frm.controls['smsContent'].value;
                if (this._context.mescontent == null) {
                    this._frm.controls['smsContent'].setValue(' <NGAYTAIKHAM>');
                } else {
                    this._frm.controls['smsContent'].setValue(this._context.mescontent + ' <NGAYTAIKHAM>');
                }
                break;
            case 8:
                this._context.mescontent = this._frm.controls['smsContent'].value;
                if (this._context.mescontent == null) {
                    this._frm.controls['smsContent'].setValue(' <PHONGBAN>');
                } else {
                    this._frm.controls['smsContent'].setValue(this._context.mescontent + ' <PHONGBAN>');
                }
                break;
            case 9:
                this._context.mescontent = this._frm.controls['smsContent'].value;
                if (this._context.mescontent == null) {
                    this._frm.controls['smsContent'].setValue(' <TENDICHVU>');
                } else {
                    this._frm.controls['smsContent'].setValue(this._context.mescontent + ' <TENDICHVU>');
                }
                break;
            case 10:
                this._context.mescontent = this._frm.controls['smsContent'].value;
                if (this._context.mescontent == null) {
                    this._frm.controls['smsContent'].setValue(' <TENTHUOC>');
                } else {
                    this._frm.controls['smsContent'].setValue(this._context.mescontent + ' <TENTHUOC>');
                }
                break;
        }
  }}
