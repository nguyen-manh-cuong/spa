import * as _ from 'lodash';

import { Component, Inject, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ISmsTemplate, IHealthfacilities } from '@shared/Interfaces';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { AppComponentBase } from '@shared/app-component-base';
import { DataService } from '@shared/service-proxies/service-data';
import swal from 'sweetalert2';


@Component({
    selector: 'app-task',
    templateUrl: './healthfacilities-list.component.html',
    styleUrls: ['./healthfacilities-list.component.scss']
})
export class HealthfacilitiesListComponent extends AppComponentBase implements OnInit {
    _frm: FormGroup;
    _usersHealthfacilities;
    _checkLength: number;
    _checked: number = -1;
    _healthFacilities: IHealthfacilities;

    dataService: DataService;

    constructor(injector: Injector, private _dataService: DataService, public dialogRef: MatDialogRef<HealthfacilitiesListComponent>, @Inject(MAT_DIALOG_DATA) public data) { super(injector); }

    ngOnInit() {
        this.dataService = this._dataService;
        this._usersHealthfacilities = this.data;
        this._checkLength = this.data.length;
    }

    updateDefault() {
        this._dataService.update('usershealthfacilities', {
            userId: abp.session.userId,
            healthFacilitiesId: this._healthFacilities.healthFacilitiesId,
            healthFacilitiesIdOld: this.appSession.user.healthFacilities ? this.appSession.user.healthFacilities.healthFacilitiesId : null
        }).subscribe(resp => {
            this.appSession.user.healthFacilitiesId = this._healthFacilities.healthFacilitiesId;
            this.appSession.user.healthFacilities = this._healthFacilities; 
            this.dialogRef.close();
            window.location.reload();
        }, err => { this.dialogRef.close() });
    }

    getHealthFacilities(value: any, index: number, event: any){
        if($('#'+ index).is(":checked")){
            this._checked = index;
            this._healthFacilities = value;
        } else{
            this._checked = -1;
            this._healthFacilities = null;
        }
    }
}
