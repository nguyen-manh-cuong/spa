import { AppConsts } from '@shared/AppConsts';
import { Injectable } from '@angular/core';

@Injectable()
export class AppAuthService {

    logout(reload?: boolean): void {
        abp.auth.clearToken();
        if (reload !== false) {
            location.href = AppConsts.appBaseUrl;
        }
    }
}
