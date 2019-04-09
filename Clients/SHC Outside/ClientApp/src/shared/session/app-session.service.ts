import { ApplicationInfoDto, GetCurrentLoginInformationsOutput, SessionServiceProxy, UserLoginInfoDto } from '@shared/service-proxies/service-proxies'

import { AbpMultiTenancyService } from '@abp/multi-tenancy/abp-multi-tenancy.service'
import { Injectable } from '@angular/core';

@Injectable()
export class AppSessionService {

    private _user: UserLoginInfoDto;
    private _application: ApplicationInfoDto;

    constructor(
        private _sessionService: SessionServiceProxy,
        private _abpMultiTenancyService: AbpMultiTenancyService) {
    }

    get application(): ApplicationInfoDto {
        return this._application;
    }

    get user(): UserLoginInfoDto {
        return this._user;
    }

    get userId(): number {
        return this.user ? this.user.id : null;
    }

    getShownLoginName(): string {
        const userName = this._user ? this._user.userName : '';
        if (!this._abpMultiTenancyService.isEnabled) {
            return userName;
        }

        return userName;
    }

    init(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this._sessionService.getCurrentLoginInformations().toPromise().then((result: GetCurrentLoginInformationsOutput) => {
                this._application = result.application;
                this._user = result.user;

                resolve(true);
            }, (err) => {
                reject(err);
            });
        });
    }
}
