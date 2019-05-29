import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    ViewChild,
    DoCheck
} from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'mat-select-autocomplete',
    template: `
  <mat-form-field appearance="{{appearance}}" class="{{class}}">
    <mat-select #selectElem [attr.disabled]="disabled" [placeholder]="placeholder" [formControl]="formControl" [multiple]="multiple"
    [(ngModel)]="selectedValue" (selectionChange)="onSelectionChange($event)">
    <div class="box-search">
        <mat-checkbox *ngIf="multiple" color="primary" class="box-select-all" [(ngModel)]="selectAllChecked"
        (change)="toggleSelectAll($event)"></mat-checkbox>
        <input #searchInput type="text" [ngClass]="{'pl-1': !multiple}" (input)="filterItem(searchInput.value)"  placeholder="Tìm kiếm...">
        <div class="box-search-icon" (click)="filterItem(''); searchInput.value = ''">
          <button mat-icon-button class="search-button">
            <mat-icon class="mat-24" aria-label="Search icon">clear</mat-icon>
          </button>
        </div>
      </div>
      <mat-select-trigger>
        {{onDisplayString()}}
      </mat-select-trigger>
        <mat-option *ngFor="let option of filteredOptions" [attr.disabled]="option.disabled" [value]="option[value]"
          [style.display]="hideOption(option) ? 'none': 'flex'">{{option[code] ? (option[code] + " - ") : null}} {{option[display]}}
        </mat-option>
    </mat-select>
    <mat-hint style="color:red" *ngIf="showErrorMsg">{{errorMsg}}</mat-hint>
  </mat-form-field>
  `,
    styles: [
        `
    .box-search {
      margin: 8px;
      border-radius: 2px;
      box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(0, 0, 0, 0.08);
      transition: box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
    }
    .box-search input {
      flex: 1;
      border: none;
      outline: none;
    }
    .box-select-all {
      width: 36px;
      line-height: 33px;
      color: #808080;
      text-align: center;
    }
    .search-button {
      width: 36px;
      height: 36px;
      line-height: 33px;
      color: #808080;
    }
    .pl-1 {
      padding-left: 1rem;
    }`
    ]
})
export class SelectAutocompleteComponent implements OnChanges, DoCheck {

    @Input()
    placeholder;
    @Input()
    options;
    @Input()
    disabled = false;
    @Input()
    code = 'code';
    @Input()
    display = 'display';
    @Input()
    value = 'value';
    @Input()
    formControl = new FormControl();
    @Input()
    errorMsg = 'Field is required';
    @Input()
    showErrorMsg = false;
    @Input()
    selectedOptions;
    @Input()
    multiple = true;

    // New Options
    @Input()
    labelCount = 1;
    @Input()
    appearance = 'standard';
    @Input()
    class = 'grid-7-11';

    @Output()
    selectionChange: EventEmitter<any> = new EventEmitter();

    @ViewChild('selectElem') selectElem;

    filteredOptions: Array<any> = [];
    selectedValue: Array<any> = [];
    selectedName: Array<any> = [];
    selectAllChecked = false;
    displayString = '';
    constructor() { }

    ngOnChanges() {
        this.filteredOptions = this.options;
        if (this.selectedOptions) {
            this.selectedValue = this.selectedOptions;
        } else if (this.formControl.value) {
            this.selectedValue = this.formControl.value;
        }
    }

    ngDoCheck() {
        if (!this.selectedValue.length) {
            this.selectionChange.emit(this.selectedValue);
        }
    }

    toggleDropdown() {
        this.selectElem.toggle();
    }

    toggleSelectAll = function (val) {
        if (val.checked) {
            this.filteredOptions.forEach(option => {
                if (!this.selectedValue.includes(option[this.value])) {
                    this.selectedValue = this.selectedValue.concat([option[this.value]]);
                }
            });
        } else {
            this.selectedValue = [];
        }
        this.selectionChange.emit(this.selectedValue);
    };

    filterItem(value) {
        if (!isNaN(value)) {
            this.filteredOptions = this.options.filter(
                item => item[this.code].toLowerCase().indexOf(value.toLowerCase()) > -1
            );
        } else {
            this.filteredOptions = this.options.filter(
                item => item[this.display].toLowerCase().indexOf(value.toLowerCase()) > -1
            );
        }
        this.selectAllChecked = true;
        this.filteredOptions.forEach(item => {
            if (this.selectedValue.indexOf(item[this.value]) > -1) {
                this.selectAllChecked = false;
            }
        });
    }

    hideOption(option) {
        return !(this.filteredOptions.indexOf(option) > -1);
    }

    // Returns plain strings array of filtered values
    getFilteredOptionsValues() {
        const filteredValues = [];
        this.filteredOptions.forEach(option => {
            filteredValues.push(option.value);
        });
        return filteredValues;
    }

    onDisplayString() {
        this.displayString = '';
        if (this.selectedName && this.selectedName.length) {
            let displayOption = [];
            if (this.multiple) {
                // Multi select display
                for (let i = 0; i < this.labelCount; i++) {
                    displayOption[i] = this.options.find(
                        option => option === this.selectedName[i]
                    );
                }
                if (displayOption.length) {
                    for (let i = 0; i < displayOption.length; i++) {
                        this.displayString += displayOption[i][this.display] + ',';
                    }
                    this.displayString = this.displayString.slice(0, -1);
                    if (this.selectedName.length > 1) {
                        this.displayString += ` (+${this.selectedName.length - this.labelCount} cơ sở khác)`;
                    }
                }
            } else {
                // Single select display
                displayOption = this.options.filter(
                    option => option.value === this.selectedName
                );
                if (displayOption.length) {
                    this.displayString = displayOption[0][this.display];
                }
            }
        }
        return this.displayString;
    }

    onSelectionChange(val) {
        this.selectedName = [];
        const filteredValues = this.getFilteredOptionsValues();
        let count = 0;
        if (this.multiple) {
            this.selectedValue.filter(item => {
                if (filteredValues.indexOf(item) > -1) {
                    count++;
                }
            });
            this.selectAllChecked = count === this.filteredOptions.length;
        }
        this.selectedValue = val.value;
        for (var i = 0; i < this.selectedValue.length; i++) {
            this.selectedName.push(this.options.find(
                item => item[this.value] == this.selectedValue[i]
            ));
        }

        this.selectionChange.emit(this.selectedValue);
    }

}
