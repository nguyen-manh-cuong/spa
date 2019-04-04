import * as _ from 'lodash';

import { ActivatedRouteSnapshot, ActivationEnd, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { AfterViewInit, ChangeDetectorRef, Component, Injector, OnInit, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { filter, map } from 'rxjs/operators';

import { AppAuthService } from '@shared/auth/app-auth.service';
import { AppComponentBase } from '@shared/app-component-base';
import { Observable } from 'rxjs';
import { SignalRAspNetCoreHelper } from '@shared/helpers/SignalRAspNetCoreHelper';
import { Title } from '@angular/platform-browser';

@Component({
    templateUrl: './app.component.html',
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

    constructor(injector: Injector, private breakpointObserver: BreakpointObserver, private _authService: AppAuthService, private router: Router, private titleService: Title) {
        super(injector);
        this.shownLoginName = this.appSession.getShownLoginName();
        // console.log(ap);
    }

    ngOnInit(): void {
        // SignalRAspNetCoreHelper.initSignalR();

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

        this.router.events.subscribe((event: any) => {
            if (event instanceof NavigationStart) {
                // Show loading indicator
                this.isTableLoading = true;
            }

            if (event instanceof NavigationEnd) {
                // Hide loading indicator
                const menu = abp.nav.menus['mainMenu'].items.find((e: any) => e.route === event.url);

                if (menu) {
                    this.titleService.setTitle(`${this.title} | ${this.l(menu.name)}`);
                    this.pateTitle = this.l(menu.name);
                }

                this.isTableLoading = false;
            }

            if (event instanceof NavigationError) {
                // Hide loading indicator

                // Present error to user
                console.log(event.error);
            }
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
}
