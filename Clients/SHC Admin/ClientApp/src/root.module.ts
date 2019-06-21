import * as _ from 'lodash';
import * as localForage from 'localforage';

import { APP_INITIALIZER, Injector, LOCALE_ID, NgModule } from '@angular/core';
import { PlatformLocation, registerLocaleData } from '@angular/common';

import { API_BASE_URL } from '@shared/service-proxies/service-proxies';
import { AbpHttpInterceptor } from '@abp/abpHttpInterceptor';
import { AbpModule } from '@abp/abp.module';
import { AppConsts } from '@shared/AppConsts';
import { AppPreBootstrap } from './AppPreBootstrap';
import { AppSessionService } from '@shared/session/app-session.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { RootComponent } from './root.component';
import { RootRoutingModule } from './root-routing.module';
import { ServiceProxyModule } from '@shared/service-proxies/service-proxy.module';
import { SharedModule } from '@shared/shared.module';
import swal from 'sweetalert2';
import { notifyToastr } from '@shared/helpers/utils';


export function appInitializerFactory(
    injector: Injector,
    platformLocation: PlatformLocation) {
    return () => {

        abp.ui.setBusy();

        return new Promise<boolean>((resolve, reject) => {
            AppConsts.appBaseHref = getBaseHref(platformLocation);
            const appBaseUrl = getDocumentOrigin() + AppConsts.appBaseHref;

            AppPreBootstrap.run(appBaseUrl, () => {
                abp.event.trigger('abp.dynamicScriptsInitialized');
                const appSessionService: AppSessionService = injector.get(AppSessionService);
                appSessionService.init().then(
                    (result) => {
                        abp.ui.clearBusy();

                        if (shouldLoadLocale()) {
                            const angularLocale = convertAbpLocaleToAngularLocale(abp.localization.currentLanguage.name);
                            System.import(`@angular/common/locales/${angularLocale}.js`)
                                .then(module => {
                                    registerLocaleData(module.default);
                                    resolve(result);
                                }, reject);
                        } else {
                            resolve(result);
                        }
                    },
                    (err) => {
                        abp.ui.clearBusy();
                        reject(err);
                    }
                );
            });
        });
    }
}

export function shouldLoadLocale(): boolean {
    return abp.localization.currentLanguage.name && abp.localization.currentLanguage.name !== 'en-US';
}


export function getRemoteServiceBaseUrl(): string {
    return AppConsts.serverBaseUrl;
}

export function convertAbpLocaleToAngularLocale(locale: string): string {
    if (!AppConsts.localeMappings) {
        return locale;
    }

    const localeMapings = _.filter(AppConsts.localeMappings, { from: locale });
    if (localeMapings && localeMapings.length) {
        return localeMapings[0]['to'];
    }

    return locale;
}

@NgModule({
    imports: [
        BrowserModule, BrowserAnimationsModule,
        SharedModule.forRoot(),
        AbpModule,
        ServiceProxyModule,
        RootRoutingModule,
        HttpClientModule
    ],
    declarations: [
        RootComponent,
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AbpHttpInterceptor, multi: true },
        { provide: API_BASE_URL, useFactory: getRemoteServiceBaseUrl },
        {
            provide: APP_INITIALIZER,
            useFactory: appInitializerFactory,
            deps: [Injector, PlatformLocation],
            multi: true
        }
    ],
    exports: [],
    bootstrap: [RootComponent]
})

export class RootModule {
    static message: string;
    constructor() {
        abp.message.error = (message, title) => {
            //abp.notify.error(message, title, { hideDuration: 3000, preventDuplicates: true, preventOpenDuplicates: true });
            notifyToastr(title,message,'error');
            RootModule.message = message;
        }
    }

}

export function getBaseHref(platformLocation: PlatformLocation): string {
    const baseUrl = platformLocation.getBaseHrefFromDOM();
    if (baseUrl) {
        return baseUrl;
    }

    return '/';
}

function getDocumentOrigin() {
    if (!document.location.origin) {
        return document.location.protocol + '//' + document.location.hostname + (document.location.port ? ':' + document.location.port : '');
    }

    return document.location.origin;
}
