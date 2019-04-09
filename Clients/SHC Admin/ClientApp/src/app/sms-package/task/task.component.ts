import * as _ from 'lodash';

import { Component, Inject, Injector, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { IPackage, IPackageDetail } from '@shared/Interfaces';
import { MAT_DIALOG_DATA, MatDialogRef, MatInput } from '@angular/material';

import { AppComponentBase } from '@shared/app-component-base';
import { DataService } from '@shared/service-proxies/service-data';
import { ValidationRule } from '@shared/common/common';
import swal from 'sweetalert2';


@Component({
    selector: 'app-task',
    templateUrl: './task.component.html',
    styleUrls: ['./task.component.scss']
})
export class TaskComponent extends AppComponentBase implements OnInit, AfterViewInit {
    api: string = 'smspackages';
    ValidationRule = new ValidationRule();

    _smsFrom: string = 'smsFrom';
    _smsTo: string = 'smsTo';
    _detailCost: string = 'cost';

    _frm: FormGroup;
    _package: IPackage | any = { name: '', description: '', cost: '', quantity: '', status: '', smsFrom: '', smsTo: '', detailCost: '' };
    _context: any;
    _isNew: boolean = true;
    _details: Array<IPackageDetail> = [];

    @ViewChild("txtName") txtName: MatInput;

    constructor(
        injector: Injector, 
        private _dataService: DataService, 
        private _formBuilder: FormBuilder, 
        public dialogRef: MatDialogRef<TaskComponent>, 
        @Inject(MAT_DIALOG_DATA) 
        public packageData: IPackage) { 
            super(injector); 
        }

    ngOnInit() {
        const validationRule = new ValidationRule();

        if (this.packageData) {
            this._package = _.clone(this.packageData);
            this._isNew = false;
            this._details = _.orderBy(this.packageData.details, ['smsFrom'], ['asc']);
        }

        this._context = {
            // name: [this._package.name, [Validators.required, validation.compare('name', 'description')]],
            name: [this._package.name, [Validators.required, validationRule.hasValue]],
            description: [this._package.description, [Validators.required, validationRule.hasValue]],
            cost: [this._package.cost],
            quantity: [this._package.quantity],
            status: true,
            smsFrom: 1,
            smsTo: [this._package.smsTo, [Validators.required, validationRule.hasValue, validationRule.hasSpecialCharacter, validationRule.compare('smsFrom', 'smsTo')]],
            detailCost: [this._package.detailCost, [Validators.required, validationRule.hasValue, validationRule.hasSpecialCharacter]]
        };

        this._frm = this._formBuilder.group(this._context);

        if (this.packageData) {
            this._frm.controls['smsFrom'].patchValue(this._details[0].smsFrom);
            this._frm.controls['smsTo'].patchValue(this._details[0].smsTo);
            this._frm.controls['detailCost'].patchValue(this._details[0].cost);
            this.packageData.status == 0 ? this._frm.controls['status'].setValue(false) : "";

            this._details.splice(0, 1)
            this._details.forEach((el, i) => {
                this._details[i].index = i;
                this._frm.addControl(this._smsFrom + i, new FormControl(el.smsFrom));
                this._frm.addControl(this._smsTo + i, new FormControl(el.smsTo, [Validators.required, this.ValidationRule.hasValue, validationRule.hasSpecialCharacter, this.ValidationRule.compare(this._smsFrom + i, this._smsTo + i)]));
                this._frm.addControl(this._detailCost + i, new FormControl(el.cost, [Validators.required, this.ValidationRule.hasValue, validationRule.hasSpecialCharacter]));
            })
        }
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this._package.distribute == 0 || this._isNew == true ? this.txtName.focus() : '';
        }, 1000);
    }

    deleteDetail(index: number, indexControl: number) {
        this._frm.removeControl(this._smsFrom + indexControl);
        this._frm.removeControl(this._smsTo + indexControl);
        this._frm.removeControl(this._detailCost + indexControl);
        this._details.splice(index, 1);
        var length = this._details.length;

        if (length) {
            //gan lai gia tri so luong tin nhan va thanh tien
            var totalCost = 0;
            this._frm.controls['quantity'].setValue(this._details[length - 1].smsTo);
            this._details.forEach(el => {
                if (el.cost) {
                    totalCost += Number(el.cost);
                }
            })
            this._frm.controls['cost'].setValue(totalCost + Number(this._frm.controls['detailCost'].value));

            //gian lai gia tri sms tu
            if (indexControl == 0 || index == 0) {
                this._frm.controls[this._smsFrom + this._details[index].index].setValue(Number(this._frm.value.smsTo) + 1);
                this._details[index].smsFrom = Number(this._frm.value.smsTo) + 1;
                this.compare(this._smsFrom + this._details[index].index, this._smsTo + this._details[index].index);
            } else {
                if (index == length) {
                    var value = index == 1 ? Number(this._frm.value.smsTo) + 1 : Number(this._details[index - 2].smsTo) + 1
                    this._frm.controls[this._smsFrom + this._details[index - 1].index].setValue(value);
                } else {
                    this._frm.controls[this._smsFrom + this._details[index].index].setValue(Number(this._details[index - 1].smsTo) + 1);
                    this._details[index].smsFrom = Number(this._details[index - 1].smsTo) + 1;
                    this.compare(this._smsFrom + this._details[index].index, this._smsTo + this._details[index].index);
                }
            }
        } else {
            this._frm.controls['quantity'].setValue(this._frm.controls['smsTo'].value);
            this._frm.controls['cost'].setValue(this._frm.controls['detailCost'].value);
        }
    }

    addDetail() {
        if( (this._frm.controls['cost'].value && this._frm.controls['cost'].value > 2000000000) || (this._frm.controls['quantity'].value && this._frm.controls['quantity'].value > 2000000000) ) return swal('Thông báo', 'Thành tiền hoặc số tin nhắn tối đa là 2000000000', 'warning');

        var length: number = this._details.length;
        var smsTo: number = length == 0 ? Number(this._frm.value.smsTo) + 1 : Number(this._details[length - 1].smsTo) + 1;

        while(this._frm.get(this._smsFrom + length) != null){
            length++;
        }

        this._frm.addControl(this._smsFrom + length, new FormControl(''));
        this._frm.addControl(this._smsTo + length, new FormControl('', [Validators.required, this.ValidationRule.hasValue, this.ValidationRule.hasSpecialCharacter, this.ValidationRule.compare(this._smsFrom + length, this._smsTo + length)]));
        this._frm.addControl(this._detailCost + length, new FormControl('', [Validators.required, this.ValidationRule.hasValue, this.ValidationRule.hasSpecialCharacter]));

        this._frm.controls[this._smsFrom + length].setValue(smsTo);
        this._details.push({ smsFrom: smsTo, smsTo: undefined, cost: undefined, index: length });

        setTimeout(() => {
            $("#smsTo" + length).focus();
        }, 500);
    }

    checkPackageDetail() {
        var result: boolean = false;
        this._details.forEach(value => {
            if (!value.cost || !value.smsFrom || !value.smsTo) {
                result = true;
            }
        })
        return result;
    }

    getValue(values: string, index: number, type: number) {
        var value = this.getNumber(values);

        if (type == 1) {
            var valueSmsTo = Number(this._frm.controls['smsTo'].value);
            var length = this._details.length;
            var totalQuantity = !length ? valueSmsTo : (length ? this._frm.controls['quantity'].value : valueSmsTo);
            index > -1 ? this._details[index].smsTo = value : "";

            //lay gia tri so luong tin nhan
            if (index == (length - 1) && index != -1) {
                totalQuantity = value;
            }
            this._frm.controls['quantity'].setValue(totalQuantity);

            //gan lai gia tri sms tu
            if (length) {
                if (length == 1 || index == -1) {
                    this._frm.controls[this._smsFrom + this._details[0].index].setValue(valueSmsTo + 1);
                    this._details[0].smsFrom = valueSmsTo + 1;
                    this.compare(this._smsFrom + this._details[0].index, this._smsTo + this._details[0].index);
                } else {
                    if (this._details[index + 1]) {
                        this._frm.controls[this._smsFrom + this._details[index + 1].index].setValue(Number(this._details[index].smsTo) + 1);
                        this._details[index + 1].smsFrom = Number(this._details[index].smsTo) + 1;
                        this.compare(this._smsFrom + this._details[index + 1].index, this._smsTo + this._details[index + 1].index);
                    }
                }
            }
        } else {
            var totalCost: number = type == 1 ? Number(this._frm.controls['detailCost'].value) + Number(value) : Number(this._frm.controls['detailCost'].value);
            index > -1 ? this._details[index].cost = value : "";

            this._details.forEach(el => {
                if (el.cost) {
                    totalCost += Number(el.cost);
                }
            })

            this._frm.controls['cost'].setValue(totalCost);
        }
    }

    submit() {
        if( (this._frm.controls['cost'].value && this._frm.controls['cost'].value > 2000000000) || (this._frm.controls['quantity'].value && this._frm.controls['quantity'].value > 2000000000) ) return swal('Thông báo', 'Thành tiền hoặc số tin nhắn tối đa là 2000000000', 'warning');

        var params = _.pick(this._frm.value, ['id', 'name', 'description', 'cost', 'quantity', 'status', 'details', 'userId']);
        var detail: Array<IPackageDetail> = [{
            smsFrom: this._frm.value.smsFrom,
            smsTo: Number(this._frm.value.smsTo),
            cost: Number(this._frm.value.detailCost),
            index: this._details.length
        }];
        params.name = _.trim(params.name);//temp
        params.details = this._details.concat(detail);
        params.status = params.status == true ? 1 : 0;
        params.userId = this.appSession.userId;
        
        if (this.packageData) {
            params.id = this.packageData.id;
        }

        this._isNew ?
            this._dataService.create(this.api, params).subscribe(() => {
                swal(this.l('SaveSuccess'), '', 'success');
                this.dialogRef.close();
            }, err => {}) :
            this._dataService.update(this.api, params).subscribe(() => {
                swal(this.l('SaveSuccess'), '', 'success');
                this.dialogRef.close()
            }, err => {});
    }

    compare(from: string, to: string){
        if(this._frm.controls[to].value <= this._frm.controls[from].value){
            this._frm.controls[to].value != 0 ? this._frm.controls[to].setValue(this._frm.controls[to].value) : "";
            this._frm.controls[to].setErrors({compare: true});
        } else{
            this._frm.controls[to].setErrors(null);
        }
    }
    
    getNumber(num: string){
        if(num && num.trim().length) return Number(num.replace(/[^0-9]/g, ""));
        return 0;
    }

    inputOnlyNumber(event: any) {
        const pattern = /['\\\-,]/g;
        if (pattern.test(event.target.value)) {
            event.target.value = event.target.value.replace(/['\\\-,]/g, "");
        }
    }
}
