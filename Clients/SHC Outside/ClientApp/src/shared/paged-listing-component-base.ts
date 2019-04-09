import { AfterViewInit, Component, Injector, OnInit, ViewChild } from '@angular/core';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { isEmpty, isNil, isNull, omitBy, zipObject } from 'lodash';
import { merge, of } from 'rxjs';

import { AppComponentBase } from 'shared/app-component-base';
import { DataService } from './service-proxies/service-data';
import { FormGroup } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject } from 'rxjs';
import { standardized } from './helpers/utils';

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

    data: EntityDto[] = [];
    selection = new SelectionModel<EntityDto>(true, []);

    btnSearchClicks$ = new Subject<Event>();
    frmSearch: FormGroup;
    ruleSearch = {};

    dataService: DataService;

    dialogComponent: any;

    constructor(injector: Injector) {
        super(injector);
    }

    ngAfterViewInit(): void {

    }

}
