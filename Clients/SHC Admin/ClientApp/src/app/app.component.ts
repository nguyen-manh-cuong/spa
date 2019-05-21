import * as _ from 'lodash';
import swal from 'sweetalert2';

import { ActivatedRouteSnapshot, ActivationEnd, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { AfterViewInit, ChangeDetectorRef, Component, Injector, OnInit, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { filter, map } from 'rxjs/operators';

import { AppAuthService } from '@shared/auth/app-auth.service';
import { AppComponentBase } from '@shared/app-component-base';
import { Observable } from 'rxjs';
import { SignalRAspNetCoreHelper } from '@shared/helpers/SignalRAspNetCoreHelper';
import { Title } from '@angular/platform-browser';
import { MatDialog } from '@angular/material';
import { DataService } from '@shared/service-proxies/service-data';
import { HealthfacilitiesListComponent } from './healthfacilities-list/healthfacilities-list.component';

@Component({
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AppComponent extends AppComponentBase implements OnInit, AfterViewInit {

    private viewContainerRef: ViewContainerRef;
    private title = 'Viettel Gateway';
    public pateTitle = '';

    isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset).pipe(map(result => result.matches));
    shownLoginName: string = '';

    languages: abp.localization.ILanguageInfo[];
    currentLanguage: abp.localization.ILanguageInfo;

    constructor(
        injector: Injector, 
        private breakpointObserver: BreakpointObserver, 
        private _authService: AppAuthService, 
        private router: Router, 
        private titleService: Title,
        private _dialog: MatDialog,
        private _dataService: DataService
    ) {
        super(injector);
        this.shownLoginName = this.appSession.getShownLoginName();
        this.router.events.subscribe((event: any) => {
            if (event instanceof NavigationStart) {
                // Show loading indicator
                this.isTableLoading = true;
            }
 
            if (event instanceof NavigationEnd) {
                // Hide loading indicator
                //const menu = abp.nav.menus['mainMenu'].items.find((e: any) => e.route === event.url);
 
                var menu;
                abp.nav.menus['mainMenu'].items.forEach(el => {
                    if(el.route === this.router.url && el.items.length == 0){
                        menu = el;
                    } else{
                        if (el.items.length > 0) {
                            el.items.forEach(eli => {
                                if(eli.route + '/index' === this.router.url) menu = eli;
                                if(eli.route + '/packageindex' === this.router.url) menu = eli;
                            });
                        }
                    }
                });
 
                if (menu) {
                    this.titleService.setTitle(`${this.title} | ${this.l(menu.name)}`);
                    this.pateTitle = this.l(menu.name);
                }
 
                this.isTableLoading = false;
            }
 
            if (event instanceof NavigationError) {
                // Hide loading indicator
 
                // Present error to user
            }
        });
    }

    ngOnInit(): void {
        // SignalRAspNetCoreHelper.initSignalR();
        if(this.appSession.user.accountType != 0){
            var healthFacilities = (abp.session as any).healthFacilities;
            var check = true;

            if(healthFacilities && healthFacilities.length){
                if(healthFacilities.length > 1){
                    for (let index = 0; index < healthFacilities.length; index++) {
                        if(healthFacilities[index].isDefault == true) {
                            this.appSession.user.healthFacilitiesId = healthFacilities[index].healthFacilitiesId;
                            this.appSession.user.healthFacilities = healthFacilities[index];
                            check = false;
                            break;
                        }
                    }
                } else{
                    check = false;
                    this.appSession.user.healthFacilitiesId = healthFacilities[0].healthFacilitiesId;
                    this.appSession.user.healthFacilities = healthFacilities[0];
                    this._dataService.update('usershealthfacilities', {
                        userId: abp.session.userId,
                        healthFacilitiesId: healthFacilities[0].healthFacilitiesId
                    }).subscribe(resp => {}, err => {});
                }

                if(check == true) this._dialog.open(HealthfacilitiesListComponent, { minWidth: 'calc(100vw/3)', maxWidth: 'calc(100vw - 300px)', disableClose: true, data: healthFacilities ? healthFacilities : null});
            } else{
                this._dialog.open(HealthfacilitiesListComponent, { minWidth: 'calc(100vw/3)', maxWidth: 'calc(100vw - 300px)', disableClose: true, data: []});
            }
        }

        this.languages = _.filter(this.localization.languages, l => (<any>l).isDisabled === false);
        this.currentLanguage = this.localization.currentLanguage;

        abp.event.on('abp.notifications.received', userNotification => {
            abp.notifications.showUiNotifyForUserNotification(userNotification);

            // Desktop notification
            // Push.create('AbpZeroTemplate', {
            //     body: userNotification.notification.data.message,
            //     icon: abp.appPath + 'assets/app-logo-small.png',
            //     timeout: 6000,
            //     onClick: function() {
            //         window.focus();
            //         this.close();
            //     }
            // });
        });
    }

    changeLanguage(language: abp.localization.ILanguageInfo) {
        abp.utils.setCookieValue(
            'Abp.Localization.CultureName',
            language.name,
            new Date(new Date().getTime() + 5 * 365 * 86400000), // 5 year
            abp.appPath
        );

        location.reload();
    }

    ngAfterViewInit(): void {
    }

    logout(): void {
        this._authService.logout();
    }

    onResize(event) {
        // exported from $.AdminBSB.activateAll
    }

    getHealthfacility(){
        this._dataService
            .get("usershealthfacilities", JSON.stringify({userId : abp.session.userId}), '', null, null)
            .subscribe(resp => {
                if(resp && resp.items && resp.items.length){
                    if(resp.items.length != 1) this._dialog.open(HealthfacilitiesListComponent, { minWidth: 'calc(100vw/3)', maxWidth: 'calc(100vw - 300px)', disableClose: true, data: resp.items});
                    else{
                        swal('Thông báo', 'Tài khoản của bạn chỉ có 1 csyt', 'warning');
                    }
                }
            });
    }
}
