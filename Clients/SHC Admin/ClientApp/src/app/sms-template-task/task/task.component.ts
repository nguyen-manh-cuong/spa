import * as _ from 'lodash';

import { Component, Inject, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ISmsTemplate, IMedicalHealthcareHistories } from '@shared/Interfaces';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { AppComponentBase } from '@shared/app-component-base';
import { DataService } from '@shared/service-proxies/service-data';
import swal from 'sweetalert2';
import { SelectionModel } from '@angular/cdk/collections';


@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss']
})
export class TaskComponent extends AppComponentBase implements OnInit {
  _frm: FormGroup;
  _smstemplates: ISmsTemplate | any = { smsTemplate: '', smsContent:'' };
  _templates: Array<ISmsTemplate> = [];
  _template: ISmsTemplate;
  _context: any;

  selection = new SelectionModel<IMedicalHealthcareHistories>(true, []);
  dataService: DataService;

  constructor(injector: Injector, private _dataService: DataService, private _formBuilder: FormBuilder, public dialogRef: MatDialogRef<TaskComponent>, @Inject(MAT_DIALOG_DATA) public _selection) { super(injector); }

  ngOnInit() {
    this.dataService = this._dataService;
    this.selection =  _.clone(this._selection);
    this._context = {
      smsTemplate: [this._smstemplates.smsTemplateName, Validators.required],
      smsContent:[this._smstemplates.smsContent],
    };
    this._frm = this._formBuilder.group(this._context);
    this.dataService.getAll('smstemplates', (this.appSession.user.healthFacilitiesId ? String(this.appSession.user.healthFacilitiesId) : '')).subscribe(resp => this._templates = resp.items);
  }

  onSelectTemplate(value: any){
    this._template = this._templates.find(t => t.id == value);
    this._frm.controls['smsContent'].setValue(this._template ? this._template.smsContent : "");
  }
 
  sendSms(){
    var lstPatient = [];
    if(this.selection.selected.length){
        this.selection.selected.forEach(el => {
            lstPatient.push(el.patient);
        })

        this._dataService.create('infosms', {
          lstPatient: lstPatient, 
          lstMedicalHealthcareHistories: this.selection.selected, 
          type: 3, 
          healthFacilitiesId: this.appSession.user.healthFacilitiesId, 
          content: this._frm.controls['smsContent'].value,
          smsTemplateId: this._template.id
        }).subscribe(resp => {
          this.dialogRef.close()  
          swal('Thông báo', resp, 'error');
        }, err => {this.dialogRef.close()});
    } else{
      swal('Thông báo', 'Chưa chọn bệnh nhân', 'warning');
    }
  }
}
