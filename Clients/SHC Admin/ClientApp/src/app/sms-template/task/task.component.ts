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
import { log } from 'util';


@Component({
    selector: 'app-task',
    templateUrl: './task.component.html',
    styleUrls: ['./task.component.scss']
})
export class TaskComponent extends AppComponentBase implements OnInit, AfterViewInit {

    api: string = 'sms-templates';

    _frm: FormGroup;
    _smstemplates: ISmsTemplate | any = { smsTemplateName: '', messageType: '', messageContent: '', isActive: '', applyAllSystem: '', id: 0 };
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
            messageType: [this._smstemplates.messageType,],
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

    lengthSmsContent = 0;
    inputSmsContent() {
        this.lengthSmsContent = this._frm.value.smsContent.toString().length;
    }

    submit() {
        this._frm.value.smsTemplateName = this._frm.value.smsTemplateName.trim();
        this._frm.value.smsContent = this._frm.value.smsContent.trim();
        this._frm.value.healthFacilitiesId = this.appSession.user.healthFacilitiesId;
        this._frm.value.userId = this.appSession.userId;
        this._frm.value.createUserId = this.appSession.user.id;
        this.appSession.user.healthFacilitiesId ? this._frm.value.applyAllSystem = false : '';

        this._isNew ?
            this._dataService.create(this.api, this._frm.value).subscribe(() => {
                swal({
                    title: this.l('SaveSuccess'),
                    text: '',
                    type: 'success',
                    timer: 3000
                });
                this.dialogRef.close();
            }, err => console.log(err)) :
            this._dataService.update(this.api, Object.assign(this._frm.value, { id: this.smstemplate.id })).subscribe(() => {
                swal({
                    title: this.l('SaveSuccess'),
                    text: '',
                    type: 'success',
                    timer: 3000
                });
                this.dialogRef.close();
            }, err => console.log(err));
    }
    cursorIndex: number;
    strFirts = "";
    strSecond = "";
    mescontent: string = '';
    changeSelected(e) {
        if (this.lengthSmsContent > 500) {
            return;
        }
        switch (e) {
            case 1:
                this._context.mescontent = this._frm.controls['smsContent'].value;
                if (this.cursorIndex) {
                    this.strFirts = this._context.mescontent.substring(0, this.cursorIndex);
                    this.strSecond = this._context.mescontent.substring(this.cursorIndex, this._context.mescontent.length);
                }
                else {
                    this.strFirts = this._context.mescontent;
                    this.strSecond = "";
                }
                if (this._context.mescontent == null) {
                    this._frm.controls['smsContent'].setValue(' <PHONGKHAM>');
                } else {
                    if ((this._context.mescontent + ' <PHONGKHAM>').length > 500) {
                        return;
                    }
                    this._frm.controls['smsContent'].setValue(this.strFirts + ' <PHONGKHAM>' + this.strSecond);
                }
                break;
            case 2:
                this._context.mescontent = this._frm.controls['smsContent'].value;
                if (this.cursorIndex) {
                    this.strFirts = this._context.mescontent.substring(0, this.cursorIndex);
                    this.strSecond = this._context.mescontent.substring(this.cursorIndex, this._context.mescontent.length);
                }
                else {
                    this.strFirts = this._context.mescontent;
                    this.strSecond = "";
                }
                if (this._context.mescontent == null) {
                    this._frm.controls['smsContent'].setValue(' <PHONGKHAM>');
                } else {
                    if ((this._context.mescontent + ' <NGAYSINH>').length > 500) {
                        return;
                    }
                    this._frm.controls['smsContent'].setValue(this.strFirts + ' <NGAYSINH>' + this.strSecond);
                }
                break;
            case 3:
                this._context.mescontent = this._frm.controls['smsContent'].value;
                if (this.cursorIndex) {
                    this.strFirts = this._context.mescontent.substring(0, this.cursorIndex);
                    this.strSecond = this._context.mescontent.substring(this.cursorIndex, this._context.mescontent.length);
                }
                else {
                    this.strFirts = this._context.mescontent;
                    this.strSecond = "";
                }
                if (this._context.mescontent == null) {
                    this._frm.controls['smsContent'].setValue(' <HOTEN>');
                } else {
                    if ((this._context.mescontent + ' <HOTEN>').length > 500) {
                        return;
                    }
                    this._frm.controls['smsContent'].setValue(this.strFirts + ' <HOTEN>' + this.strSecond);
                }
                break;
            case 4:
                this._context.mescontent = this._frm.controls['smsContent'].value;
                if (this.cursorIndex) {
                    this.strFirts = this._context.mescontent.substring(0, this.cursorIndex);
                    this.strSecond = this._context.mescontent.substring(this.cursorIndex, this._context.mescontent.length);
                }
                else {
                    this.strFirts = this._context.mescontent;
                    this.strSecond = "";
                }
                if (this._context.mescontent == null) {
                    this._frm.controls['smsContent'].setValue(' <EMAIL>');
                } else {
                    if ((this._context.mescontent + ' <EMAIL>').length > 500) {
                        return;
                    }
                    this._frm.controls['smsContent'].setValue(this.strFirts + ' <EMAIL>' + this.strSecond);
                }
                break;
            case 5:
                this._context.mescontent = this._frm.controls['smsContent'].value;
                if (this.cursorIndex) {
                    this.strFirts = this._context.mescontent.substring(0, this.cursorIndex);
                    this.strSecond = this._context.mescontent.substring(this.cursorIndex, this._context.mescontent.length);
                }
                else {
                    this.strFirts = this._context.mescontent;
                    this.strSecond = "";
                }
                if (this._context.mescontent == null) {
                    this._frm.controls['smsContent'].setValue(' <GIOITINH>');
                } else {
                    if ((this._context.mescontent + ' <GIOITINH>').length > 500) {
                        return;
                    }
                    this._frm.controls['smsContent'].setValue(this.strFirts + ' <GIOITINH>' + this.strSecond);
                }
                break;
            case 6:
                this._context.mescontent = this._frm.controls['smsContent'].value;
                if (this.cursorIndex) {
                    this.strFirts = this._context.mescontent.substring(0, this.cursorIndex);
                    this.strSecond = this._context.mescontent.substring(this.cursorIndex, this._context.mescontent.length);
                }
                else {
                    this.strFirts = this._context.mescontent;
                    this.strSecond = "";
                }
                if (this._context.mescontent == null) {
                    this._frm.controls['smsContent'].setValue(' <NGAYHIENTAI>');
                } else {
                    if ((this._context.mescontent + ' <NGAYHIENTAI>').length > 500) {
                        return;
                    }
                    this._frm.controls['smsContent'].setValue(this.strFirts + ' <NGAYHIENTAI>' + this.strSecond);
                }
                break;
            case 7:
                this._context.mescontent = this._frm.controls['smsContent'].value;
                if (this.cursorIndex) {
                    this.strFirts = this._context.mescontent.substring(0, this.cursorIndex);
                    this.strSecond = this._context.mescontent.substring(this.cursorIndex, this._context.mescontent.length);
                }
                else {
                    this.strFirts = this._context.mescontent;
                    this.strSecond = "";
                }
                if (this._context.mescontent == null) {
                    this._frm.controls['smsContent'].setValue(' <NGAYTAIKHAM>');
                } else {
                    if ((this._context.mescontent + ' <NGAYTAIKHAM>').length > 500) {
                        return;
                    }
                    this._frm.controls['smsContent'].setValue(this.strFirts + ' <NGAYTAIKHAM>' + this.strSecond);
                }
                break;
            case 8:
                this._context.mescontent = this._frm.controls['smsContent'].value;
                if (this.cursorIndex) {
                    this.strFirts = this._context.mescontent.substring(0, this.cursorIndex);
                    this.strSecond = this._context.mescontent.substring(this.cursorIndex, this._context.mescontent.length);
                }
                else {
                    this.strFirts = this._context.mescontent;
                    this.strSecond = "";
                }
                if (this._context.mescontent == null) {
                    this._frm.controls['smsContent'].setValue(' <PHONGBAN>');
                } else {
                    if ((this._context.mescontent + ' <PHONGBAN>').length > 500) {
                        return;
                    }
                    this._frm.controls['smsContent'].setValue(this.strFirts + ' <PHONGBAN>' + this.strSecond);
                }
                break;
            case 9:
                this._context.mescontent = this._frm.controls['smsContent'].value;
                if (this.cursorIndex) {
                    this.strFirts = this._context.mescontent.substring(0, this.cursorIndex);
                    this.strSecond = this._context.mescontent.substring(this.cursorIndex, this._context.mescontent.length);
                }
                else {
                    this.strFirts = this._context.mescontent;
                    this.strSecond = "";
                }
                if (this._context.mescontent == null) {
                    this._frm.controls['smsContent'].setValue(' <TENDICHVU>');
                } else {
                    if ((this._context.mescontent + ' <TENDICHVU>').length > 500) {
                        return;
                    }
                    this._frm.controls['smsContent'].setValue(this.strFirts + ' <TENDICHVU>' + this.strSecond);
                }
                break;
            case 10:
                this._context.mescontent = this._frm.controls['smsContent'].value;
                if (this.cursorIndex) {
                    this.strFirts = this._context.mescontent.substring(0, this.cursorIndex);
                    this.strSecond = this._context.mescontent.substring(this.cursorIndex, this._context.mescontent.length);
                }
                else {
                    this.strFirts = this._context.mescontent;
                    this.strSecond = "";
                }
                if (this._context.mescontent == null) {
                    this._frm.controls['smsContent'].setValue(' <TENTHUOC>');
                } else {
                    if ((this._context.mescontent + ' <TENTHUOC>').length > 500) {
                        return;
                    }
                    this._frm.controls['smsContent'].setValue(this.strFirts + ' <TENTHUOC>' + this.strSecond);
                }
                break;
        }
    }
    cussorPointer(e, value) {
        // string 
        this.cursorIndex = e;
    }
}
