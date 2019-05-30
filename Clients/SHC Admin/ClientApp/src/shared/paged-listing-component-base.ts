import { AfterViewInit, Component, Injector, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
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
import { analyzeAndValidateNgModules } from '@angular/compiler';
import * as moment from 'moment';
import {MomentDateAdapter} from '@angular/material-moment-adapter';

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

    public pageSize: number = 20;
    public pageNumber: number = 1;
    public pageSizeOptions: Array<number> = [5, 10, 20, 50];
    public totalPages: number = 1;
    public totalItems: number;
    public showFilter: boolean = true;

    api: string;

    displayedColumns = [];
    _age = { years: 0, months: 0, days: 0 };

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

    convertAge(date: number, month: number, year: number) {
        // ngày sinh nhật
        var strBirthday =  date.toString().concat('-', month.toString(), '-',  year.toString()); 
        const birthday = moment(strBirthday, 'DD-MM-YYYY').valueOf();
        // Ngày hiện tại
        const yearNow = new Date().getFullYear();
        const monthNow = new Date().getMonth() + 1;
        const dateNow = moment(new Date()).valueOf();
        var time1 = (dateNow -birthday)/(1000*24*60*60);

        const strNow = dateNow.toString().concat('-', monthNow.toString(), '-',  yearNow.toString());       
        var time = new Date().getTime() - new Date(birthday).getTime();
        // Convert thời gian (milliseconds) sang ngày
        var duration = moment.duration(time, 'milliseconds');
        // Làm tròn
        var days = Math.floor(duration.asDays());
        var months = Math.floor(duration.asMonths() + 1);
        var years = Math.floor(duration.asYears());

        var ageString = "";
        var yearAge = yearNow - year;

        if (monthNow >= month)
            var monthAge = monthNow - month;
        else {
            yearAge--;
            var monthAge = 12 + monthNow - month;
        }

        if (dateNow >= date)
            var dateAge = dateNow - date;
        else {
            monthAge--;
            var dateAge = 31 + dateNow - date;

            if (monthAge < 0) {
                monthAge = 11;
                yearAge--;
            }
        }

        this._age.years = yearAge;
        this._age.months = monthAge;
        this._age.days = dateAge;

        
        // so sanh ngay
        if(days == 0){
            ageString = "1 Ngày";
        }
        else{
            if(days <= 90){
                ageString = days + " Ngày tuổi";
             }       
             else if(days <= 2160){
                 ageString = months + " Tháng tuổi";            
             }
             else if(days > 2160){
                 ageString = years + " Tuổi";
             }
        }
        
        // if (this._age.years > 0)
        //     ageString = this._age.years + "T";
        // else if ((this._age.years == 0) && (this._age.months == 0) && (this._age.days > 0))
        //     ageString = this._age.days + "NG";
        // else if ((this._age.years == 0) && (this._age.months > 0) && (this._age.days >= 0))
        //     ageString = this._age.months + "TH";
        
        return ageString;
    }

    toggedFilter() {
        const _filter = $('form.form-filter');
        if (_filter.length <= 0) { return; }
        this.showFilter = !this.showFilter;
        _filter.css({ 'height': this.showFilter ? 'auto' : 0, 'overflow': this.showFilter ? 'auto' : 'hidden' });
        this.setTableHeight();
    }

    ngAfterViewInit(): void {

        //this.dataSources.sort = this.sort;
        if (this.sort) {
            this.sort.sortChange.subscribe(() => {
                this.paginator.pageIndex = 0
            });
        }

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
        ).subscribe(data => {
            this.dataSources.data = data;
        });
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
