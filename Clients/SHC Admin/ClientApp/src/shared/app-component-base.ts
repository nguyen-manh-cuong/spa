import { ElementRef, Injector, HostListener } from '@angular/core';

import { AbpMultiTenancyService } from '@abp/multi-tenancy/abp-multi-tenancy.service';
import { AppConsts } from '@shared/AppConsts';
import { AppSessionService } from '@shared/session/app-session.service';
import { FeatureCheckerService } from '@abp/features/feature-checker.service';
import { LocalizationService } from '@abp/localization/localization.service';
import { MessageService } from '@abp/message/message.service';
import { NotifyService } from '@abp/notify/notify.service';
import { PermissionCheckerService } from '@abp/auth/permission-checker.service';
import { SettingService } from '@abp/settings/setting.service';

export abstract class AppComponentBase {

    localizationSourceName = AppConsts.localization.defaultLocalizationSourceName;

    localization: LocalizationService;
    permission: PermissionCheckerService;
    feature: FeatureCheckerService;
    notify: NotifyService;
    setting: SettingService;
    message: MessageService;
    multiTenancy: AbpMultiTenancyService;
    appSession: AppSessionService;
    elementRef: ElementRef;

    numberOfClicks = 0;

    @HostListener('document:click', ['$event'])

    public documentClick(event: Event) {
        return event;
    }

    _age = { years: 0, months: 0, days: 0 };

    public isTableLoading = false;

    constructor(injector: Injector) {
        this.localization = injector.get(LocalizationService);
        this.permission = injector.get(PermissionCheckerService);
        this.feature = injector.get(FeatureCheckerService);
        this.notify = injector.get(NotifyService);
        this.setting = injector.get(SettingService);
        this.message = injector.get(MessageService);
        this.multiTenancy = injector.get(AbpMultiTenancyService);
        this.appSession = injector.get(AppSessionService);
        this.elementRef = injector.get(ElementRef);
    }

    l(key: string, ...args: any[]): string {
        args.unshift(key);
        args.unshift(this.localizationSourceName);
        return this.ls.apply(this, args);
    }

    ll(key: string, ...args: any[]): string {
        args.unshift(key);
        args.unshift(this.localizationSourceName);
        return this.l(key, args).toLocaleLowerCase();
    }

    convertAge(date: number, month: number, year: number) {
        const yearNow = new Date().getFullYear();
        const monthNow = new Date().getMonth() + 1;
        const dateNow = new Date().getDate();
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



        if (this._age.years > 0)
            ageString = this._age.years + "T";
        else if ((this._age.years == 0) && (this._age.months == 0) && (this._age.days > 0))
            ageString = this._age.days + "NG";
        else if ((this._age.years == 0) && (this._age.months > 0) && (this._age.days >= 0))
            ageString = this._age.months + "TH";

        return ageString;
    }

    ls(sourcename: string, key: string, ...args: any[]): string {
        let localizedText = this.localization.localize(key, sourcename);

        if (!localizedText) {
            localizedText = key;
        }

        if (!args || !args.length) {
            return localizedText;
        }

        args.unshift(localizedText);
        return abp.utils.formatString.apply(this, args);
    }

    isGranted(permissionName: string): boolean {
        return this.permission.isGranted(permissionName);
    }
}
