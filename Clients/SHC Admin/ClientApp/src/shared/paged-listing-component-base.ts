import { AfterViewInit, Component, Injector, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { isEmpty, isNil, isNull, omitBy, zipObject } from 'lodash';
import { merge, of } from 'rxjs';

import { AppComponentBase } from 'shared/app-component-base';
import { DataService } from './service-proxies/service-data';
import { FormGroup } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject } from 'rxjs';
import { standardized } from './helpers/utils';
import swal from 'sweetalert2';

export class PagedResultDto {
    items: any[];
    totalCount: number;
}

export class EntityDto {
    id: number;
}

export class PagedRequestDto {
    skipCount: number;
    maxResultCount: number;
}

// tslint:disable-next-line:no-shadowed-variable
export abstract class PagedListingComponentBase<EntityDto> extends AppComponentBase implements AfterViewInit {

    public pageSize: number = 5;
    public pageNumber: number = 1;
    public pageSizeOptions: Array<number> = [5, 10, 20, 50];
    public totalPages: number = 1;
    public totalItems: number;
    public showFilter: boolean = true;

    api: string;

    displayedColumns = [];

    data: EntityDto[] = [];
    dataSources = new MatTableDataSource();
    selection = new SelectionModel<EntityDto>(true, []);

    @ViewChild('paginator') paginator: MatPaginator;
    @ViewChild('sort') sort: MatSort;

    btnSearchClicks$ = new Subject<Event>();
    frmSearch: FormGroup;
    ruleSearch = {};

    dataService: DataService;

    dialog: MatDialog;
    dialogComponent: any;

    constructor(injector: Injector) {
        super(injector);
        $(window).resize(() => { this.setTableHeight(); });
    }

    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSources.data.length;
        return numSelected === numRows;
    }

    masterToggle() {
        this.isAllSelected() ?
            this.selection.clear() :
            this.dataSources.data.forEach((row: EntityDto) => this.selection.select(row));
    }

    setTableHeight(): void {
        // const _filter = $('form.form-filter');
        // if (_filter.length && $('div.table-content').length) { $('div.table-content').css('max-height', `calc(100vh - ${_filter.outerHeight() + 200}px)`) }
    }

    toggedFilter() {
        const _filter = $('form.form-filter');
        if (_filter.length <= 0) { return; }
        this.showFilter = !this.showFilter;
        _filter.css({ 'height': this.showFilter ? 'auto' : 0, 'overflow': this.showFilter ? 'auto' : 'hidden' });
        this.setTableHeight();
    }

    ngAfterViewInit(): void {

        this.dataSources.sort = this.sort;
        this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
        this.btnSearchClicks$.subscribe(() => this.paginator.pageIndex = 0);

        merge(this.sort.sortChange, this.paginator.page, this.btnSearchClicks$)
            .pipe(
                startWith({}),
                switchMap(() => {
                    setTimeout(() => this.isTableLoading = true, 0);
                    const sort = this.sort.active ? zipObject([this.sort.active], [this.sort.direction]) : {};
                    return this.dataService.get(this.api, JSON.stringify(standardized(omitBy(this.frmSearch.value, isNil), this.ruleSearch)), JSON.stringify(sort), this.paginator.pageIndex, this.paginator.pageSize);
                }),
                map((data: any) => {
                    setTimeout(() => this.isTableLoading = false, 500);
                    this.totalItems = data.totalCount;
                    return data.items;
                }),
                catchError(() => {
                    setTimeout(() => this.isTableLoading = false, 500);
                    return of([]);
                })
            ).subscribe(data => this.dataSources.data = data);
        this.setTableHeight();
    }

    openDialog(obj?: EntityDto): void {
        const dialogRef = this.dialog.open(this.dialogComponent, { minWidth: 'calc(100vw/2)', maxWidth: 'calc(100vw - 300px)', disableClose: true, data: obj ? obj : null });
        dialogRef.afterClosed().subscribe(() => {
            this.paginator.pageIndex = 0;
            this.paginator._changePageSize(this.paginator.pageSize);
        });
    }

    deleteDialog(obj: EntityDto, key: string, id?: number | string) {
        swal({
            title: this.l('AreYouSure'),
            html: this.l('DeleteWarningMessage', obj[key]),
            type: 'warning',
            showCancelButton: true,
            confirmButtonClass: 'mat-raised-button mat-primary bg-danger',
            cancelButtonClass: 'mat-button',
            confirmButtonText: this.l('YesDelete'),
            cancelButtonText: this.l('Cancel'),
            buttonsStyling: false
        }).then((result) => {
            if (result.value) {
                this.dataService.delete(this.api, obj[id ? id : 'id']).subscribe(() => {
                    swal(this.l('SuccessfullyDeleted'), this.l('DeletedInSystem', obj[key]), 'success');
                    this.paginator.pageIndex = 0;
                    this.paginator._changePageSize(this.paginator.pageSize);
                });
            }
        });
    }
    // ngOnInit(): void {
    //     this.refresh();
    // }

    // refresh(): void {
    //     this.getDataPage(this.pageNumber);
    // }

    // public showPaging(result: PagedResultDto, pageNumber: number): void {
    //     this.totalPages = ((result.totalCount - (result.totalCount % this.pageSize)) / this.pageSize) + 1;

    //     this.totalItems = result.totalCount;
    //     this.pageNumber = pageNumber;
    // }

    // public getDataPage(page: number): void {
    //     const req = new PagedRequestDto();
    //     req.maxResultCount = this.pageSize;
    //     req.skipCount = (page - 1) * this.pageSize;

    //     this.isTableLoading = true;
    //     this.list(req, page, () => {
    //         this.isTableLoading = false;
    //     });
    // }

    // protected abstract list(request: PagedRequestDto, pageNumber: number, finishedCallback: Function): void;
    // protected abstract delete(entity: EntityDto): void;
}
