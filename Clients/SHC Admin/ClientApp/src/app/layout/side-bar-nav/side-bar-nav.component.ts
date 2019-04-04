import { Component, Injector, OnInit, ViewEncapsulation } from '@angular/core';

import { AppComponentBase } from '@shared/app-component-base';
import { MenuItem } from '@shared/layout/menu-item';

@Component({
    selector: 'app-side-bar-nav',
    templateUrl: './side-bar-nav.component.html',
    styleUrls: ['./side-bar-nav.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SideBarNavComponent extends AppComponentBase {

    menuItems: any;

    constructor(injector: Injector) {
        super(injector);
        this.menuItems = abp.nav.menus['mainMenu'].items;
    }

    showMenuItem(menuItem): boolean {
        if (menuItem.permissionName) {
            return this.permission.isGranted(menuItem.permissionName);
        }

        return true;
    }
}
