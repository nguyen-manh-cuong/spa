import { AuthenticateModel, AuthenticateResultModel, TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';

import { AppConsts } from '@shared/AppConsts';
import { Injectable } from '@angular/core';
import { LogService } from '@abp/log/log.service';
import { MessageService } from '@abp/message/message.service';
import { Router } from '@angular/router';
import { TokenService } from '@abp/auth/token.service';
import { UrlHelper } from '@shared/helpers/UrlHelper';
import { UtilsService } from '@abp/utils/utils.service';
import { finalize } from 'rxjs/operators';

@Injectable()
export class LoginService {

    static readonly twoFactorRememberClientTokenName = 'TwoFactorRememberClientToken';

    authenticateModel: AuthenticateModel;
    authenticateResult: AuthenticateResultModel;

    rememberMe: boolean;

    constructor(
        private _tokenAuthService: TokenAuthServiceProxy,
        private _router: Router,
        private _utilsService: UtilsService,
        private _tokenService: TokenService,
        private _logService: LogService
    ) { this.clear(); }

    authenticate(finallyCallback?: (success: any) => void, errorCallback?: (error: any) => void): void {
        finallyCallback = finallyCallback || (() => { });

        this._tokenAuthService
            .authenticate(this.authenticateModel)
            .pipe(finalize(() => {  }))
            .subscribe((result: AuthenticateResultModel) => {
                this.processAuthenticateResult(result);
                finallyCallback(result);
            }, error => errorCallback(error));
    }

    private processAuthenticateResult(authenticateResult: AuthenticateResultModel) {
        this.authenticateResult = authenticateResult;

        if (authenticateResult.accessToken) {
            // Successfully logged in
            //console.log(111, authenticateResult.accessToken);

            this.login(authenticateResult.accessToken, authenticateResult.encryptedAccessToken, authenticateResult.expireInSeconds, this.rememberMe);
        } else {
            // Unexpected result!
            //this._logService.warn('Unexpected authenticateResult!');
            //this._router.navigate(['auth/login']);

        }
    }

    private login(accessToken: string, encryptedAccessToken: string, expireInSeconds: number, rememberMe?: boolean): void {

        console.log('dang nhap thanh cong');
        const tokenExpireDate = rememberMe ? (new Date(new Date().getTime() + 1000 * expireInSeconds)) : undefined;

        this._tokenService.setToken(
            accessToken,
            tokenExpireDate
        );

        this._utilsService.setCookieValue(
            AppConsts.authorization.encrptedAuthTokenName,
            encryptedAccessToken,
            tokenExpireDate,
            abp.appPath,
        );

        let initialUrl = UrlHelper.initialUrl;
        if (initialUrl.indexOf('/login') > 0) {
            initialUrl = AppConsts.appBaseUrl;
        }

         console.log(localStorage.getItem('isLoggedIn'));
         if (localStorage.getItem('isLoggedIn') == null) {
             localStorage.setItem('isLoggedIn', "true");
             location.href = initialUrl;
         }

        //location.href = initialUrl;

        //location.href = initialUrl;

    }

    private clear(): void {
        this.authenticateModel = new AuthenticateModel();
        this.authenticateModel.rememberClient = false;
        this.authenticateResult = null;
        this.rememberMe = false;
    }
}
