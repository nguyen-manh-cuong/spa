import { Component, Injector, OnInit } from '@angular/core';
import { IUser } from '@shared/Interfaces';
import { MatDialog } from '@angular/material';

import { DataService } from '@shared/service-proxies/service-data';
import { FormBuilder } from '@angular/forms';
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { TaskComponent } from '../task/task.component';
import { DetailComponent } from '../detail/detail.component';
import swal from 'sweetalert2';

@Component({
    selector: 'app-index',
    templateUrl: './index.component.html',
    styleUrls: ['./index.component.scss']
})
export class IndexComponent extends PagedListingComponentBase<IUser> implements OnInit {

    displayedColumns = ['orderNumber', 'name', 'description', 'quantity', 'cost', 'status', 'task'];
    status = [{ id: 2, name: 'Tất cả'}, { id: 1, name: 'Hiệu lực'}, { id: 0, name: 'Không hiệu lực'}];
    dialogDetail: any;

    constructor(injector: Injector, private _dataService: DataService, public dialog: MatDialog, private _formBuilder: FormBuilder) {
        super(injector);
    }

    ngOnInit() {
        this.api = 'smspackages';
        this.frmSearch = this._formBuilder.group({ packagesNameDescription: [], status: [2,] });
        this.dataService = this._dataService;

        this.dialogComponent = TaskComponent;
        this.dialogDetail = DetailComponent;
    }
    
    detail(obj): void{
        const dialogRef = this.dialog.open(this.dialogDetail, { minWidth: 'calc(100vw/2)', maxWidth: 'calc(100vw - 300px)', data: obj ? obj : null });
        dialogRef.afterClosed().subscribe(() => this.paginator._changePageSize(this.paginator.pageSize));
    }

    showMessage(title: string, content: string, type: string){
        swal(this.l('Sửa gói thất bại.'), this.l('Gói SMS đang được sử dụng!'), 'error');
    }
}