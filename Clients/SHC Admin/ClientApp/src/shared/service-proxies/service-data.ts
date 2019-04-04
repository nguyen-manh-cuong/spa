import { HttpClient, HttpHeaders, HttpResponse, HttpResponseBase } from '@angular/common/http';
import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { Observable, from as _observableFrom, of as _observableOf, throwError as _observableThrow } from 'rxjs';
import { catchError as _observableCatch, mergeMap as _observableMergeMap } from 'rxjs/operators';

import { AppConsts } from '@shared/AppConsts';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

@Injectable()
export class DataService {

    private http: HttpClient;
    private baseUrl: string;
    protected jsonParseReviver: ((key: string, value: any) => any) | undefined = undefined;

    constructor(@Inject(HttpClient) http: HttpClient, @Optional() @Inject(API_BASE_URL) baseUrl?: string) {
        this.http = http;
        this.baseUrl = AppConsts.remoteServiceBaseUrl;
    }

    getAll(enpoint: string, filter?: string | null | undefined, sorting?: string | null | undefined): Observable<any> {
        let url_ = this.baseUrl + `/${enpoint}?`;
        if (filter !== undefined) { url_ += 'Filter=' + encodeURIComponent('' + filter) + '&'; }
        if (sorting !== undefined) { url_ += 'Sorting=' + encodeURIComponent('' + sorting) + '&'; }
        url_ = url_.replace(/[?&]$/, '');

        const options_: any = { observe: 'response', responseType: 'blob', headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json' }) };

        return this.http.request('get', url_, options_).pipe(_observableMergeMap((response_: any) => this.processDataOk(response_)))
            .pipe(_observableCatch((response_: any) => {
                if (response_ instanceof HttpResponseBase) {
                    try {
                        return this.processDataOk(<any>response_);
                    } catch (e) {
                        return <Observable<any>><any>_observableThrow(e);
                    }
                } else {
                    return <Observable<any>><any>_observableThrow(response_);
                }
            }));
    }

    /**
     * @filter (optional)
     * @sorting (optional)
     * @skipCount (optional)
     * @maxResultCount (optional)
     * @return Success
     */
    get(enpoint: string, filter: object | string | null | undefined, sorting: string | null | undefined, skipCount: number | null | undefined, maxResultCount: number | null | undefined): Observable<any> {
        let url_ = this.baseUrl + `/${enpoint}?`;

        if (filter !== undefined) { url_ += 'Filter=' + encodeURIComponent('' + filter) + '&'; }
        if (sorting !== undefined) { url_ += 'Sorting=' + encodeURIComponent('' + sorting) + '&'; }
        if (skipCount !== undefined) { url_ += 'SkipCount=' + encodeURIComponent('' + skipCount) + '&'; }
        if (maxResultCount !== undefined) { url_ += 'MaxResultCount=' + encodeURIComponent('' + maxResultCount) + '&'; }
        url_ = url_.replace(/[?&]$/, '');

        const options_: any = { observe: 'response', responseType: 'blob', headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json' }) };

        abp.ui.setBusy('#main-container');
        return this.http.request('get', url_, options_).pipe(_observableMergeMap((response_: any) => this.processDataOk(response_)))
            .pipe(_observableCatch((response_: any) => {
                abp.ui.clearBusy('#main-container');
                if (response_ instanceof HttpResponseBase) {
                    try {
                        return this.processDataOk(<any>response_);
                    } catch (e) {
                        return <Observable<any>><any>_observableThrow(e);
                    }
                } else {
                    return <Observable<any>><any>_observableThrow(response_);
                }
            }));
    }

    /**
     * @input (optional)
     * @return Success
     */
    create(enpoint: string, input: any | null | undefined): Observable<any> {
        let url_ = this.baseUrl + `/${enpoint}`;
        url_ = url_.replace(/[?&]$/, '');

        const content_ = JSON.stringify(input);

        const options_: any = {
            body: content_,
            observe: 'response',
            responseType: 'blob',
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            })
        };

        return this.http.request('post', url_, options_).pipe(_observableMergeMap((response_: any) => {
            return this.processDataOk(response_);
        })).pipe(_observableCatch((response_: any) => {
            if (response_ instanceof HttpResponseBase) {
                try {
                    return this.processDataOk(<any>response_);
                } catch (e) {
                    return <Observable<any>><any>_observableThrow(e);
                }
            } else {
                return <Observable<any>><any>_observableThrow(response_);
            }
        }));
    }

    /**
     * @input (optional)
     * @return Success
     */
    update(enpoint: string, input: any | null | undefined): Observable<any> {
        let url_ = this.baseUrl + `/${enpoint}`;
        url_ = url_.replace(/[?&]$/, '');

        const content_ = JSON.stringify(input);

        const options_: any = {
            body: content_,
            observe: 'response',
            responseType: 'blob',
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            })
        };

        return this.http.request('put', url_, options_).pipe(_observableMergeMap((response_: any) => {
            return this.processDataOk(response_);
        })).pipe(_observableCatch((response_: any) => {
            if (response_ instanceof HttpResponseBase) {
                try {
                    return this.processDataOk(<any>response_);
                } catch (e) {
                    return <Observable<any>><any>_observableThrow(e);
                }
            } else {
                return <Observable<any>><any>_observableThrow(response_);
            }
        }));
    }

    /**
    * @id (optional)
    * @return Success
    */
    delete(enpoint: string, id: number | null | undefined): Observable<void> {
        let url_ = this.baseUrl + `/${enpoint}?`;
        if (id !== undefined) {
            url_ += 'Id=' + encodeURIComponent('' + id) + '&';
        }
        url_ = url_.replace(/[?&]$/, '');

        const options_: any = {
            observe: 'response',
            responseType: 'blob',
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        };

        return this.http.request('delete', url_, options_).pipe(_observableMergeMap((response_: any) => this.processDataOk(response_))).pipe(_observableCatch((response_: any) => {
            if (response_ instanceof HttpResponseBase) {
                try {
                    return this.processDataOk(<any>response_);
                } catch (e) {
                    return <Observable<void>><any>_observableThrow(e);
                }
            } else {
                return <Observable<void>><any>_observableThrow(response_);
            }
        }));
    }

    protected processDataOk(response: HttpResponseBase): Observable<any> { 
        abp.ui.clearBusy('#main-container');
        const status = response.status;
        const responseBlob = response instanceof HttpResponse ? response.body : (<any>response).error instanceof Blob ? (<any>response).error : undefined;

        const _headers: any = {}; if (response.headers) { for (const key of response.headers.keys()) { _headers[key] = response.headers.get(key); } };

        if (status === 200) {
            return blobResponseToText(responseBlob).pipe(_observableMergeMap(_responseText => _observableOf(_responseText === '' ? null : JSON.parse(_responseText, this.jsonParseReviver))));
        } else if (status !== 200 && status !== 204) {
            return blobResponseToText(responseBlob).pipe(_observableMergeMap(_responseText => {
                return throwException('An unexpected server error occurred.', status, _responseText, _headers);
            }));
        }
        return _observableOf<any>(<any>null);
    }


}

function throwException(message: string, status: number, response: string, headers: { [key: string]: any; }, result?: any): Observable<any> {
    if (result !== null && result !== undefined) {
        return _observableThrow(result);
    } else {
        return _observableThrow(new SwaggerException(message, status, response, headers, null));
    }
}

function blobResponseToText(blob: any): Observable<string> {
    return new Observable<string>((observer: any) => {
        if (!blob) {
            observer.next('');
            observer.complete();
        } else {
            const reader = new FileReader();
            reader.onload = function () {
                observer.next(this.result);
                observer.complete();
            }
            reader.readAsText(blob);
        }
    });
}

export class SwaggerException extends Error {
    message: string;
    status: number;
    response: string;
    headers: { [key: string]: any; };
    result: any;

    protected isSwaggerException = true;

    static isSwaggerException(obj: any): obj is SwaggerException {
        return obj.isSwaggerException === true;
    }

    constructor(message: string, status: number, response: string, headers: { [key: string]: any; }, result: any) {
        super();

        this.message = message;
        this.status = status;
        this.response = response;
        this.headers = headers;
        this.result = result;
    }
}
