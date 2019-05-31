import * as moment from 'moment';

import { CompilerOptions, NgModuleRef, Type } from '@angular/core';

import { AppConsts } from '@shared/AppConsts';
import { LocalizedResourcesHelper } from '@shared/helpers/LocalizedResourcesHelper';
import { UrlHelper } from '@shared/helpers/UrlHelper';
import { environment } from './environments/environment';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

export class AppPreBootstrap {

    static run(appRootUrl: string, callback: () => void): void {
        AppPreBootstrap.getApplicationConfig(appRootUrl, () => {
            if (UrlHelper.isInstallUrl(location.href)) {
                LocalizedResourcesHelper.loadLocalizedStlyes();
                callback();
                return;
            }
            AppPreBootstrap.getUserConfiguration(callback);
        });
    }

    static bootstrap<TM>(moduleType: Type<TM>, compilerOptions?: CompilerOptions | CompilerOptions[]): Promise<NgModuleRef<TM>> {
        return platformBrowserDynamic().bootstrapModule(moduleType, compilerOptions);
    }

    private static getApplicationConfig(appRootUrl: string, callback: () => void) {
        const cookieLangValue = abp.utils.getCookieValue('Abp.Localization.CultureName');
        return abp.ajax({
            url: appRootUrl + 'assets/' + environment.appConfig,
            method: 'GET',
            headers: {
                AppCulture: cookieLangValue ? cookieLangValue : 'vi',
                // 'Abp.TenantId': abp.multiTenancy.getTenantIdCookie()
            }
        }).done(result => {
            AppConsts.appBaseUrl = result.appBaseUrl;
            AppConsts.remoteServiceBaseUrl = result.remoteServiceBaseUrl;
            AppConsts.localeMappings = result.localeMappings;
            AppConsts.uploadBaseUrl = result.uploadBaseUrl;

            AppConsts.appName = result.appName;
            AppConsts.appId = result.appId;
            AppConsts.serverBaseUrl = result.serverBaseUrl;
            callback();
        });
    }

    private static getUserConfiguration(callback: () => void): JQueryPromise<any> {
        const cookieLangValue = abp.utils.getCookieValue('Abp.Localization.CultureName');
        const token = abp.auth.getToken();
        return abp.ajax({
            url: AppConsts.serverBaseUrl + '/UserConfiguration',
            method: 'GET',
            headers: {
                AppCulture: cookieLangValue ? cookieLangValue : 'vi',
                AppName: AppConsts.appName,
                AppId: AppConsts.appId,
                Authorization: 'Bearer ' + (token ? token : '')
            }
        }).done(result => {

            $.extend(true, abp, result);

            // moment.locale('vi');
            moment.locale(abp.localization.currentLanguage.name);
            // (window as any).moment.locale(abp.localization.currentLanguage.name);

            abp.event.trigger('abp.dynamicScriptsInitialized');

            // if (abp.clock.provider.supportsMultipleTimezone) {
            //     moment.tz.setDefault(abp.timing.timeZoneInfo.iana.timeZoneId);
            // }
            LocalizedResourcesHelper.loadResources(callback);
            // callback();
        });
    }
}
