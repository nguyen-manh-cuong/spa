import { AfterViewInit, Component, Injector, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { AbpSessionService } from '@abp/session/abp-session.service';
import { AppComponentBase } from '@shared/app-component-base';
import { Router } from '@angular/router';
import { IHealthfacilities } from '@shared/Interfaces';
import { debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { DataService } from '@shared/service-proxies/service-data';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-secret',
    templateUrl: './secret.component.html',
    styleUrls: ['./secret.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SecretComponent extends AppComponentBase implements OnInit {

    constructor(
        private _sanitizer: DomSanitizer, 
        private _dataService: DataService, 
        private http: HttpClient, injector: Injector, 
        private _formBuilder: FormBuilder, 
        private _router: Router, 
        private _sessionService: AbpSessionService) {
        super(injector);
    }

    ngOnInit(): void {
    }
}
