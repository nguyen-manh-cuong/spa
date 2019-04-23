import * as _ from 'lodash';

import { Component, Inject, Injector, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { IPackage, IPackageDetail } from '@shared/Interfaces';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { AppComponentBase } from '@shared/app-component-base';
import { DataService } from '@shared/service-proxies/service-data';


@Component({
    selector: 'app-task',
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.scss'],
    encapsulation: ViewEncapsulation.None

})
export class DetailComponent extends AppComponentBase implements OnInit {

    api: string = 'smspackages';

    _frm: FormGroup;
    _package: IPackage | any = { name: '', description: '', cost: '', quantity: '', isActive: '', smsFrom: '', smsTo: '', detailCost: '' };
    _context: any;
    _isNew: boolean = true;

    _details: Array<IPackageDetail> = [];

    _smsFrom: string = 'smsFrom';
    _smsTo: string = 'smsTo';
    _detailCost: string = 'cost';

    constructor(injector: Injector, private _dataService: DataService, private _formBuilder: FormBuilder, public dialogRef: MatDialogRef<DetailComponent>, @Inject(MAT_DIALOG_DATA) public packageData: IPackage) { super(injector); }

    ngOnInit() {
        if (this.packageData) {
            this._package = _.clone(this.packageData);
            this._isNew = false;
            this._details = _.orderBy(this.packageData.details, ['smsFrom'],['asc']);
        }

        this._context = {
            name: [this._package.name, Validators.required],
            description: [this._package.description],
            cost: [this._package.cost],
            quantity: [this._package.quantity],
            isActive: [this._package.isActive],
            smsFrom: 0, 
            smsTo: [this._package.smsTo], 
            detailCost: [this._package.detailCost]       
        };

        this._frm = this._formBuilder.group(this._context);  
        
        if(this.packageData){
            this._frm.controls['smsFrom'].patchValue(this._details[0].smsFrom);
            this._frm.controls['smsTo'].patchValue(this._details[0].smsTo);
            this._frm.controls['detailCost'].patchValue(this._details[0].cost);

            this._details.splice(0, 1)
            this._details.forEach((el, i) => {
                this._details[i].index = i;
                this._frm.addControl(this._smsFrom + i, new FormControl(el.smsFrom));
                this._frm.addControl(this._smsTo + i, new FormControl(el.smsTo));
                this._frm.addControl(this._detailCost + i, new FormControl(el.cost));                       
            })
        }
    }
}
