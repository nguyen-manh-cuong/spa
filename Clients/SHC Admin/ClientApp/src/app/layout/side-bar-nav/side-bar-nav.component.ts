import { Component, Injector, Input, OnInit, ViewEncapsulation } from '@angular/core';

import { AppComponentBase } from '@shared/app-component-base';

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
        this.menuItems = abp.nav.menus['mainMenu'].items; // JSON.parse(abp.nav.menus['mainMenu'].items as any).items;

        console.log(this.menuItems)
    }

    showMenuItem(menuItem): boolean {

        if (menuItem.name === 'HomePage') { return true; }

        return menuItem.view;
    }
}

@Component({
    selector: 'app-recusive-content',
    template: ` <ng-template ngFor let-menuItem [ngForOf]="menu" let-mainMenuItemIndex="index" *ngIf="menu.length">
                    <mat-expansion-panel class="mat-elevation-z" *ngIf="showMenuItem(menuItem)" [ngClass]="{'no-child': menuItem.items.length == 0}" hideToggle="{{menuItem.items.length == 0}}">
                        <mat-expansion-panel-header collapsedHeight="48px" expandedHeight="48px" routerLinkActive="active" color="primary">
                            <div *ngIf="menuItem.items.length > 0" class="d-flex align-items-center text-light">
                                <mat-icon class="mr-3" *ngIf="menuItem.icon">{{menuItem.icon ? menuItem.icon : ''}}</mat-icon><span [innerHTML]="menuItem.level | indentation"></span> {{l(menuItem.name)}}
                            </div>
                            <a *ngIf="menuItem.items.length == 0" [routerLink]="[menuItem.route]" class="d-flex align-items-center text-light w-100">
                                <mat-icon class="mr-3" *ngIf="menuItem.icon">{{menuItem.icon ? menuItem.icon : ''}}</mat-icon><span [innerHTML]="menuItem.level | indentation"></span> {{l(menuItem.name)}}
                            </a>
                            <span class="spacer"></span>
                        </mat-expansion-panel-header>
                        <app-recusive-content [level]="menuItem.level" [menu]="menuItem.items"></app-recusive-content>
                    </mat-expansion-panel>
                </ng-template>`
})
export class RecusiveContentComponent extends AppComponentBase {

    @Input() menu: Array<any>;
    @Input() level: number;

    constructor(injector: Injector) {
        super(injector);
    }

    showMenuItem(menuItem): boolean {

        if (menuItem.name === 'HomePage') { return true; }

        return menuItem.view;
    }
}
