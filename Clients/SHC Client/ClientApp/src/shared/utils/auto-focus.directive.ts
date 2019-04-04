import { AfterViewInit, Directive, ElementRef } from '@angular/core';

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[autoFocus]'
})
export class AutoFocusDirective implements AfterViewInit {

    constructor(
        private _element: ElementRef
    ) {
    }

    ngAfterViewInit(): void {
        $(this._element.nativeElement).focus();
    }
}
