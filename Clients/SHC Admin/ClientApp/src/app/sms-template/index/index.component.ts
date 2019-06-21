import { AfterViewInit, Component, Injector, OnInit, ViewEncapsulation } from '@angular/core';

import { DataService } from '@shared/service-proxies/service-data';
import { FormBuilder } from '@angular/forms';
import { ISmsTemplate } from '@shared/Interfaces';
import { MatDialog } from '@angular/material';
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { TaskComponent } from '../task/task.component';
import swal from 'sweetalert2';
import { getPermission, notifyToastr } from '@shared/helpers/utils';
import { Router } from '@angular/router';
import { DetailComponent } from '../detail/detail.component';


@Component({
    selector: 'app-index',
    templateUrl: './index.component.html',
    styleUrls: ['./index.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class IndexComponent extends PagedListingComponentBase<ISmsTemplate> implements OnInit, AfterViewInit {
    detailDialog: any;
    displayedColumns = ['orderNumber','code', 'smsTemplateName', 'messageType', 'smsContent', 'isActive', 'organizationName', 'task'];
    permission: any;
    _status = [{ id: 2, name: "Tất cả" }, { id: 1, name: "Hiệu lực" }, { id: 0, name: "Không hiệu lực" }]


    constructor(injector: Injector, private _dataService: DataService, public dialog: MatDialog, private _formBuilder: FormBuilder, private router: Router) {
        super(injector);
    }

    ngOnInit() {
        this.api = 'sms-templates';
        this.frmSearch = this._formBuilder.group({ smsTemplateName: [], status: [2,], healthFacilitiesId: this.appSession.user.healthFacilitiesId });
        this.dataService = this._dataService;
        this.dialogComponent = TaskComponent;
        this.detailDialog = DetailComponent;
        this._status
        this.permission = getPermission(abp.nav.menus['mainMenu'].items, this.router.url);
    }

    maxLengthTxt(text) {
        if (text.toString().length > 30) {
            return text.toString().substring(0, 30) + "...";
        }

        return text.toString();
    }

    showMessage(type: any) {
        var message = type == 1 ? "Không có quyền chỉnh sửa mẫu tin nhắn này" : (type == 2 ? "Không có quyền xóa mẫu tin nhắn này" : 'Xóa mẫu tin nhắn không thành công.<br>Mẫu tin nhắn đang được sử dụng!');

        notifyToastr(  'Thông báo', message, 'warning');
        // swal({
        //     title: 'Thông báo',
        //     html: message,
        //     type: 'warning',
        //     timer: 3000
        // })
    }

    checkPermission(isEdit: boolean, isDelete: boolean): boolean{
        if(isEdit || isDelete){
            return true;
        } else{
            this.displayedColumns = ['orderNumber', 'smsTemplateName', 'messageType', 'smsContent', 'isActive', 'organizationName'];
            return false;
        }
    }


    openDetailDialog(obj?: ISmsTemplate): void {
        const dialogRef = this.dialog.open(this.detailDialog, { minWidth: 'calc(100vw/2)', maxWidth: 'calc(100vw - 300px)', disableClose: true, data: obj ? obj : null });
        dialogRef.afterClosed().subscribe(() => {
            this.paginator.pageIndex = 0;
            this.paginator._changePageSize(this.paginator.pageSize);
        });
    }

}
