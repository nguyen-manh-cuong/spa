import * as _ from 'lodash';

import { AppConsts } from '@shared/AppConsts';

export class LocalizedResourcesHelper {

    static loadResources(callback: () => void): void {
        $.when(LocalizedResourcesHelper.loadLocalizedStlyes(), LocalizedResourcesHelper.loadLocalizedScripts()).done(() => {
            callback();
        });
    }

    static loadLocalizedStlyes(): JQueryPromise<any> {
        // const cssPostfix = '';
        // const theme = abp.setting.get('App.UiManagement.Theme').toLocaleLowerCase();

        // $('head').append($('<link rel="stylesheet" type="text/css" />').attr('href', AppConsts.appBaseUrl + '/assets/metronic/dist/html/' + theme + '/assets/demo/' + theme + '/base/style.bundle' + cssPostfix + '.css'));
        // $('head').append($('<link rel="stylesheet" type="text/css" />').attr('href', AppConsts.appBaseUrl + '/assets/primeng/datatable/css/primeng.datatable' + cssPostfix + '.css'));
        // $('head').append($('<link rel="stylesheet" type="text/css" />').attr('href', AppConsts.appBaseUrl + '/assets/common/styles/themes/' + theme + '/primeng.datatable' + cssPostfix + '.css'));

        // $('head').append($('<link rel="stylesheet" type="text/css" />').attr('href', AppConsts.appBaseUrl + '/assets/common/styles/metronic-customize.css'));
        // $('head').append($('<link rel="stylesheet" type="text/css" />').attr('href', AppConsts.appBaseUrl + '/assets/common/styles/themes/' + theme + '/metronic-customize.css'));

        // $('head').append($('<link rel="stylesheet" type="text/css" />').attr('href', AppConsts.appBaseUrl + '/assets/common/styles/metronic-customize-angular.css'));
        // $('head').append($('<link rel="stylesheet" type="text/css" />').attr('href', AppConsts.appBaseUrl + '/assets/common/styles/themes/' + theme + '/metronic-customize-angular.css'));

        // if (abp.setting.get('App.UiManagement.Left.Position') === 'top') {
        //     $('head').append($('<link rel="stylesheet" type="text/css" />').attr('href', AppConsts.appBaseUrl + '/assets/common/styles/metronic-customize-top-menu.css'));
        //     $('head').append($('<link rel="stylesheet" type="text/css" />').attr('href', AppConsts.appBaseUrl + '/assets/common/styles/themes/' + theme + '/metronic-customize-top-menu.css'));
        // }
        return $.Deferred().resolve().promise();
    }

    private static loadLocalizedScripts(): JQueryPromise<any> {
        if (!abp.session.userId) {
            return $.Deferred().resolve().promise();
        }

        const currentCulture = abp.localization.currentLanguage.name;

        const bootstrapSelect = AppConsts.appBaseUrl + '/assets/localization/bootstrap-select/defaults-{0}.js';
        const jqueryTimeago = AppConsts.appBaseUrl + '/assets/localization/jquery-timeago/jquery.timeago.{0}.js';

        return $.when(
            // jQuery.getScript(abp.utils.formatString(bootstrapSelect, LocalizedResourcesHelper.findBootstrapSelectLocalization(currentCulture))),
            // jQuery.getScript(abp.utils.formatString(jqueryTimeago, LocalizedResourcesHelper.findTimeagoLocalization(currentCulture)))
        );
    }

    private static mapCultureForBootstrapSelect(currentCulture: string): string {
        const cultureMap = {
            'vi': 'vi_VN',
            'en': 'en_US'
            // Add more here
        };

        if (cultureMap[currentCulture]) {
            return cultureMap[currentCulture];
        }

        return currentCulture.replace('-', '_');
    }

    private static mapCultureForTimeago(currentCulture: string): string {
        const cultureMap = {
            'sv-SE': 'sv',
            'pt-BR': 'pt-br'
            // Add more here
        };

        if (cultureMap[currentCulture]) {
            return cultureMap[currentCulture];
        }

        return currentCulture;
    }

    private static findBootstrapSelectLocalization(currentCulture: string): string {
        const supportedCultures = [
            'vi_VN',
            'en_US'];

        const mappedCulture = LocalizedResourcesHelper.mapCultureForBootstrapSelect(currentCulture);
        const foundCultures = _.filter(supportedCultures, sc => sc.indexOf(mappedCulture) === 0);
        if (foundCultures && foundCultures.length > 0) {
            return foundCultures[0];
        }

        return 'vi_VN';
    }

    private static findTimeagoLocalization(currentCulture: string): string {
        const supportedCultures = [
            'en',
            'vi'];

        const mappedCulture = LocalizedResourcesHelper.mapCultureForTimeago(currentCulture);
        const foundCultures = _.filter(supportedCultures, sc => sc.indexOf(mappedCulture) === 0);
        if (foundCultures && foundCultures.length > 0) {
            return foundCultures[0];
        }

        return 'vi';
    }
}
