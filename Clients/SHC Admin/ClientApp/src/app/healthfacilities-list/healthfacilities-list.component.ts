import * as _ from 'lodash';

import { Component, Inject, Injector, OnInit, ViewEncapsulation, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ISmsTemplate, IHealthfacilities } from '@shared/Interfaces';
import { MAT_DIALOG_DATA, MatDialogRef, MatTableDataSource, MatPaginator } from '@angular/material';
import { AppComponentBase } from '@shared/app-component-base';
import { DataService } from '@shared/service-proxies/service-data';
import swal from 'sweetalert2';


@Component({
    selector: 'app-task',
    templateUrl: './healthfacilities-list.component.html',
    styleUrls: ['./healthfacilities-list.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class HealthfacilitiesListComponent extends AppComponentBase implements OnInit, AfterViewInit {
    public pageSize: number = 20;
    public pageNumber: number = 1;
    public pageSizeOptions: Array<number> = [5, 10, 20, 50];
    public totalItems: number;

    _frm: FormGroup;
    _usersHealthfacilities: any = [];
    _checkLength: number;
    _checked: number = -1;
    _healthFacilities: IHealthfacilities;
    healthFacilitiesArray: IHealthfacilities;
    dataSource = new MatTableDataSource();
    dataService: DataService;

    

    displayedColumns = ['colSelect', 'colHel'];

    @ViewChild('nameHealthFacilities') nameHealthFacilities;
    @ViewChild(MatPaginator) paginator: MatPaginator;

    constructor(injector: Injector, private _dataService: DataService, public dialogRef: MatDialogRef<HealthfacilitiesListComponent>, @Inject(MAT_DIALOG_DATA) public data) { super(injector);}

    ngOnInit() {
        this.dataService = this._dataService;
        if (this.data.length > 0) {
            this._usersHealthfacilities = this.data;
            this._checkLength = this.data.length;
            this.dataSource.data = this.data;
            this.totalItems = this.data.length;
            console.log(1001, this.data)
        }
       
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

    onSelect(value) {
        this._healthFacilities = value;
    }


    onHandleChange() {
        //this._healthFacilities = null;
    }

    onHandleSearch() {
        if (this.nameHealthFacilities.nativeElement.value) {
            let arrTemp = [];
           
            for (var i = 0; i < this.data.length; i++) {
                if (this.data[i].name.toLowerCase().search(this.nameHealthFacilities.nativeElement.value.trim().toLowerCase()) !== -1) {
                    arrTemp.push(this.data[i]);
                }
            }
            this.dataSource.data = arrTemp;
        }
        else {
            this.dataSource.data = this.data;
        }
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
    }
}
