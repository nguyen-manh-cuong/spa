import * as _ from 'lodash';

import { Component, Inject, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ISmsTemplate } from '@shared/Interfaces';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { AppComponentBase } from '@shared/app-component-base';
import { DataService } from '@shared/service-proxies/service-data';
import swal from 'sweetalert2';

@Component({
    selector: 'app-task',
    templateUrl: './task.component.html',
    styleUrls: ['./task.component.scss']
})
export class TaskComponent extends AppComponentBase implements OnInit {
    _frm: FormGroup;
    _smstemplates: ISmsTemplate | any = { smsTemplate: '', smsContent: '' };
    _templates: Array<ISmsTemplate> = [];
    _template: ISmsTemplate;
    _context: any;
    _data: { selection: any, type: number };
    dataService: DataService;

    constructor(injector: Injector, private _dataService: DataService, private _formBuilder: FormBuilder, public dialogRef: MatDialogRef<TaskComponent>, @Inject(MAT_DIALOG_DATA) public data) { super(injector); }

    ngOnInit() {
        this.dataService = this._dataService;
        this._data = _.clone(this.data);
        this._context = {
            smsTemplate: [this._smstemplates.smsTemplateName, Validators.required],
            smsContent: [this._smstemplates.smsContent],
        };
        this._frm = this._formBuilder.group(this._context);
        this.dataService.getAll('smstemplates', (this.appSession.user.healthFacilitiesId ? String(this.appSession.user.healthFacilitiesId) : '')).subscribe(resp => this._templates = resp.items);
        this._frm.controls['smsContent'].disable();
    }

    onSelectTemplate(value: any) {
        this._template = this._templates.find(t => t.id == value);
        this._frm.controls['smsContent'].setValue(this._template ? this._template.smsContent : "");
    }

    sendSms() {
        if (this.data && this.data.selection && this.data.selection.selected.length) {
            if (this.data.selection.selected[0].bookingId != undefined) {
                this._dataService.create('infoSendsms', {
                    lstMedicalHealthcareHistories: this.data.selection.selected,
                    healthFacilitiesId: this.appSession.user.healthFacilitiesId,
                    smsTemplateId: this._template.id,
                    smsTemplateCode: this._template.smsTemplateCode,
                    content: this._frm.controls['smsContent'].value,
                    type: this.data.type,
                    objectType: this.data.objectType
                }).subscribe(resp => {
                    this.dialogRef.close()
                    swal({
                        title: 'Thông báo',
                        text: resp,
                        type: 'error',
                        timer: 3000
                    });
                }, err => { this.dialogRef.close() });
            } else {
                this._dataService.create('infosms', {
                    lstMedicalHealthcareHistories: this.data.selection.selected,
                    healthFacilitiesId: this.appSession.user.healthFacilitiesId,
                    smsTemplateId: this._template.id,
                    content: this._frm.controls['smsContent'].value,
                    type: this.data.type,
                    objectType: this.data.objectType
                }).subscribe(resp => {
                    this.dialogRef.close()
                    swal({
                        title: 'Thông báo',
                        html: resp,
                        type: 'error',
                        timer: 3000
                    });
                }, err => { this.dialogRef.close() });
            }
        } else {
            swal({
                title: 'Thông báo',
                text: 'Chưa chọn bệnh nhân',
                type: 'warning',
                timer: 3000
            });
        }
    }
}
