import { forEach } from '@angular/router/src/utils/collection';
import { IDoctor, IHealthfacilities, IHealthfacilitiesDoctor, IDoctorSpecialists } from './../../../../../../SHC Client/ClientApp/src/shared/Interfaces';
import * as _ from 'lodash';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Component, Inject, Injector, OnInit, ViewChild, AfterViewInit, ElementRef, HostListener, Directive, Output, EventEmitter, ViewEncapsulation, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ValidationErrors } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatInput, MatCheckbox, MatAutocomplete, MatChipInputEvent, MatAutocompleteSelectedEvent, MatDialog, MatPaginator } from '@angular/material';
import * as moment from 'moment';
import { AppComponentBase } from '@shared/app-component-base';
import { DataService } from '@shared/service-proxies/service-data';
import { ValidationRule } from '@shared/common/common';
import swal from 'sweetalert2';
import { publishBehavior, startWith, map, debounceTime, tap, switchMap, finalize, debounce, take } from 'rxjs/operators';
import { element } from '@angular/core/src/render3/instructions';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { ICategoryCommon } from '@shared/Interfaces';
import { MatAutocompleteTrigger } from '@angular/material';
import { FileValidator } from 'ngx-material-file-input';
import { Observable, fromEvent, merge, timer } from 'rxjs';
import { standardized, notifyToastr } from '@shared/helpers/utils';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { stringify } from '@angular/compiler/src/util';
import { prepareSyntheticListenerFunctionName } from '@angular/compiler/src/render3/util';
import { providerToFactory } from '@angular/core/src/di/r3_injector';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { AppConsts } from '@shared/AppConsts';
export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

export class DoctorSpecialists {
  constructor(
    public specialistCode: string) { }
}

export class HealthfacilitiesDoctor {
  constructor(
    public healthFacilitiesId: string) { }
}

export class Specialist {
  constructor(
    public specialistCode: string,
    public name: string
  ) { }
}


@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class DetailComponent extends AppComponentBase implements OnInit, AfterViewInit {

  genders = [
    {
      code: 1,
      name: "Nam"
    },
    {
      code: 2,
      name: "Nữ"
    },
    {
      code: 0,
      name: "Không xác định"
    }];


  flagDate = true;
  maxDate = new Date(Date.now());
  maxDate2 = new Date(Date.now());

  @ViewChild("certification") certification;
  @ViewChild("inputAvatar") inputAvatar;
  @ViewChild('priceFrom') priceFrom;
  @ViewChild('priceTo') priceTo;
  @ViewChild('autosize') autosize: CdkTextareaAutosize;
  dataService: DataService;
  isLoading = false;
  specialIsLoading = false;
  checkPriceFrom = false;
  checkPriceTo = false
  _certificationInputCheck = true;
  checkCertificationCode = true;
  checkAvatar = false;
  _speciaList = [];
  _healthFacilities = [];
  summary: string;

  _birthDay="";
  _certificationDate= "";
  api: string = 'doctor';
  _frm: FormGroup;

  _healthfacilities = [];
  _specialist = [];

  _healthFacilitiesId: number;
  _specialistCode: number;

  _avatars = new Array<string>();
  avatarName = "Chưa chọn ảnh";
  _avatarError = "";

  filteredHealthFacilitiesOptions: Observable<IHealthfacilities[]>;
  filteredSpecialistOptions: Observable<ICategoryCommon[]>;

  healthfacilitiesControl = new FormControl();
  specialistCodeControl = new FormControl();

  positions = [];
  titles = [];
  academics = [];
  degrees = [];
  nations = [];
  ethnicities = [];
  provinces = [];
  districts = [];
  checkProvince = false;

  //chips

  _healthfacilitiesChip = [];
  visible = true;
  selectable = false;
  removable = false;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];

  _specialistChip = [];
  specialVisible = true;
  specialSelectable = false;
  specialRemovable = false;
  specialAddOnBlur = true;
  specialSeparatorKeysCodes: number[] = [ENTER, COMMA];



  //chips
  @ViewChild('healthfacilitiesInput') healthfacilitiesInput: ElementRef<HTMLInputElement>;
  @ViewChild('specialistInput') specialistInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  @ViewChild('autoSpecialist') autoSpecialist: MatAutocomplete;
  
  uploadBaseUrl:string;

  _obj: IDoctor | any = {
    doctorId: 0,
    fullName: '',
    hisId: '',
    specialist: [],
    birthDate: null,
    birthMonth: null,
    birthYear: null,
    gender: 1,
    titleCode: '',
    positionCode: '',
    nationCode: '',
    ethnicityCode: '',
    certificationDate: '',
    academicId: 0,
    degreeId: 0,
    email: '',
    certificationCode: '',
    address: '',
    provinceCode: '',
    districtCode: '',
    phoneNumber: '',
    educationCountryCode: '',
    avatar: '',
    description: '',
    priceFrom: '',
    priceTo: '',
    priceDescription: '',
    summary: '',
    isSync: true,
    allowBooking: true,
    allowFilter: true,
    allowSearch: true,
    createUserId: this.appSession.userId,
    updateUserId: this.appSession.userId,
    healthFacilities: []
  };

  startDate = new Date(Date.now());
  _context: any;
  _isNew: boolean = true;

  public Editor = ClassicEditor;

  dialogComponent: typeof DetailComponent;


  constructor(
    injector: Injector,
    private _dataService: DataService,
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<DetailComponent>,
    @Inject(MAT_DIALOG_DATA)
    public obj: IDoctor,
    public dialog: MatDialog,
    private ngZone: NgZone) {
    super(injector);
  }

  @ViewChild("birthDayPicker") birthDayPicker;
  @ViewChild("certificationDatePicker") certificationDatePicker;

  ngOnInit() {
    this.dataService = this._dataService;
    this.uploadBaseUrl = AppConsts.remoteServiceBaseUrl.substring(0, AppConsts.remoteServiceBaseUrl.indexOf("9008") + 4) + "/wwwroot";
    this.getProvinces();
    this.getTitles();
    this.getPositions();
    this.getAcademics();
    this.getDegrees();
    this.getNations();
    this.getSpecialist();

    this.filterSpecialistOptions();

    this.dialogComponent = DetailComponent;

    const validationRule = new ValidationRule();

    if (this.obj) {

      if (this.obj.provinceCode) {
        this.getDistricts(this.obj.provinceCode);
      }

      if (this.obj.avatar) {
        this.checkAvatar = true;
      }

      if (this.obj.birthDate && this.obj.birthMonth && this.obj.birthYear) {
        var d, m, y = this.obj.birthYear;
        if (this.obj.birthDate < 10)
          d = "0" + this.obj.birthDate;
        else
          d = this.obj.birthDate;
        if (this.obj.birthMonth < 10)
          m = "0" + this.obj.birthMonth;
        else
          m = this.obj.birthMonth;
        this._birthDay = d + "/" + m + "/" + y;
      }

      if(this.obj.summary){
        this.summary=this.obj.summary;
      }

      this._obj = _.clone(this.obj);
      this._isNew = false;

      if (this.obj.certificationCode) {
        this._certificationInputCheck = false;
      }
    }



    // else if (this._obj.birthMonth) {
    //   this._birthDay = new Date(this._obj.birthMonth + "/01/" + this._obj.birthYear);
    // }
    // else {
    //   this._birthDay = new Date("01/01/" + this._obj.birthYear);
    // }
    if (this.obj) {
      if (this.obj.certificationDate) {
        var day, month, year = moment(this.obj.certificationDate).year();;
        if (moment(this.obj.certificationDate).date() < 10)
          day = "0" + moment(this.obj.certificationDate).date();
        else
          day = moment(this.obj.certificationDate).date();
        if ((moment(this.obj.certificationDate).month() + 1) < 10)
          month = "0" + (moment(this.obj.certificationDate).month() + 1);
        else
          month = moment(this.obj.certificationDate).month();
        this._certificationDate = day + "/" + month + "/" + year;
      }

      if (this.obj.avatar) {
        this.avatarName = this.obj.avatar.slice(9, this.obj.avatar.length);
      }
    }
    //   else {
    //     this._obj.certificationDate = new Date(Date.now());
    //   }
    // }



    this._context = {
      doctorId: [this._obj.doctorId],
      fullName: [this._obj.fullName, [Validators.required, validationRule.hasValue]],
      specialist: [this._obj.specialist],
      //birthDay: [this._birthDay],
      gender: this._obj.gender == 1 ? this._obj.gender = "Nam" : (this._obj.gender == 2 ? this._obj.gender = "Nữ" : "Không xác định"),
      titleCode: "",
      positionCode: "",
      nationCode: "",
      ethnicityCode: "",
      certificationDate: [this._obj.certificationDate],
      academicId: "",
      degreeId: "",
      email: [this._obj.email, [validationRule.email]],
      certificationCode: [this._obj.certificationCode],
      address: [this._obj.address],
      provinceCode: "",
      districtCode: "",
      phoneNumber: [this._obj.phoneNumber, [validationRule.topPhoneNumber]],
      educationCountryCode: "",
      avatar: [null, [FileValidator.maxContentSize(20000000)]],
      description: this._obj.description,
      priceFrom: [this._obj.priceFrom],
      priceTo: [this._obj.priceTo],
      priceDescription: this._obj.priceDescription,
      summary: [this._obj.summary],
      allowBooking: [this._obj.allowBooking],
      allowFilter: [this._obj.allowFilter],
      allowSearch: [this._obj.allowSearch],
      healthfacilities: [this._obj.healthFacilities]
    };


    this._frm = this._formBuilder.group(this._context);


    // if (this.appSession.user.healthFacilitiesId) {
    //   this._dataService.getAll('healthfacilities', "{healthfacilitiesId:" + String(this.appSession.user.healthFacilitiesId) + "}").subscribe(resp => this._healthfacilities = resp.items);
    //   this._frm.controls['healthfacilities'].setValue(this.appSession.user.healthFacilitiesId);
    // }
    // else {
    //   this._dataService.getAll('healthfacilities').subscribe(resp => this._healthfacilities = resp.items);
    //   this.filterOptions();
    // }

    if (this.appSession.user.healthFacilitiesId) {
      this.dataService
        .get("healthfacilities", JSON.stringify({ healthfacilitiesId: this.appSession.user.healthFacilitiesId }), '', null, null)
        .subscribe(resp => {
          this._healthfacilities = resp.items;
        });
      setTimeout(() => {
        this._frm.controls['healthfacilities'].setValue(this.appSession.user.healthFacilitiesId);
        this.onSelectHealthFacilities(this._healthfacilities[0]);
      }, 1000);
    } else {
      this.filterOptions();
      this.healthfacilitiesControl.setValue(null);
    }

    if (this.obj) {
      if (this.obj.specialist) {
        this.obj.specialist.forEach((e: any) =>{ 
          if(e.specialistCode!=null)
          this._specialistChip.push(e);});
      }
      if (this.obj) {
        if (this.obj.healthFacilities) {
          this.obj.healthFacilities.forEach((e: any) => this._healthfacilitiesChip.push(e));
        }
      }
    }
    this._obj.certificationCode ? this.flagDate = false : this.flagDate = true;
    setTimeout(() => {
      this.getEthnicities();
    }, 1000);
  }


  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this.ngZone.onStable.pipe(take(1))
        .subscribe(() => this.autosize.resizeToFitContent(true));
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      // if (this.obj) {
      //   if (this.obj.birthDate) {
      //     this.birthDayPicker.nativeElement.value = moment(this._birthDay).format("DD/MM/YYYY");
      //   }
      //   if (this.obj.certificationDate)
      //     this.certificationDatePicker.nativeElement.value = moment(this._certificationDate).format("DD/MM/YYYY");
      // }
    });
  }

  //Add custom editor
  onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(
      editor.ui.view.toolbar.element,
      editor.ui.getEditableElement(),
      editor.isReadOnly = true
    );
  }


  //Base//

  certificationInput($event) {
    if ($event.target.value) {
      this._certificationInputCheck = false;
    }
    else {
      this._certificationInputCheck = true;
      this.certificationDatePicker.nativeElement.value = "";
    }
    this.checkCertificationCode = false;
  }

  certificationKeypress($event) {
    if ($event.key == "v") {
      this._certificationInputCheck = false;
    }
    if ($event.key == "x" && this.certification.elementNative.value == "") {
      this.certificationDatePicker.nativeElement.value = "";
    }
  }

  replace_alias(str) {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str;
  }

  replace_space(str) {
    str = str.replace(/ /g, "_");
    return str;
  }

  priceFromInput($event) {
    this.priceFrom.nativeElement.value = this.replace_alias(this.priceFrom.nativeElement.value);
    if (this.priceFrom.nativeElement.value.length == 15) {
      var last = this.priceFrom.nativeElement.value.slice(12, 13);
      this.priceFrom.nativeElement.value = last + "." + this.priceFrom.nativeElement.value.slice(0, 11);
    }
    if (this.priceFrom.nativeElement.value.length == 14) {
      this.priceFrom.nativeElement.value = this.priceFrom.nativeElement.value.slice(1, 14);
    }
    if ($event.target.value) {
      this.checkPriceFrom = false;
      this.checkPriceTo = false;
    }
  }

  priceToInput($event) {
    this.priceTo.nativeElement.value = this.replace_alias(this.priceTo.nativeElement.value);
    if (this.priceTo.nativeElement.value.length == 15) {
      var last = this.priceTo.nativeElement.value.slice(12, 13);
      this.priceTo.nativeElement.value = last + "." + this.priceTo.nativeElement.value.slice(0, 11);
    }
    if (this.priceTo.nativeElement.value.length == 14) {
      var last = this.priceTo.nativeElement.value.slice(12, 13);
      this.priceTo.nativeElement.value = this.priceTo.nativeElement.value.slice(1, 14);
    }
    if ($event.target.value) {
      this.checkPriceFrom = false;
      this.checkPriceTo = false;
    }
  }

  getProvinces() {
    this._dataService.getAll("provinces").subscribe(resp => this.provinces = resp.items, err => { }, () => {
      this.provinces.forEach(p => {
        if (p.provinceCode == this.obj.provinceCode) {
          this._frm.controls['provinceCode'].setValue(p.name);
        }
      });
    });
  }

  getDistricts(provinceCode) {
    this._dataService.getAll("districts", "{ProvinceCode:" + provinceCode + "}").subscribe(resp => this.districts = resp.items, err => { }, () => {
      this.districts.forEach(d => {
        if (d.districtCode == this.obj.districtCode) {
          this._frm.controls['districtCode'].setValue(d.name);
        }
      });
    });
  }

  provinceChange($event) {
    this._frm.patchValue({ districtCode: null });
    if ($event.value != undefined) {
      this.getDistricts($event.value);
      this.checkProvince = true;
    }
    else {
      this.checkProvince = false;
      this.districts = null;
    }
  }

  getTitles() {
    this._dataService.getAll("categorycommon", "CHUCDANH").subscribe(resp => this.titles = resp.items, err => { }, () => {
      this.titles.forEach(t => {
        if (t.code == this.obj.titleCode) {
          this._frm.controls['titleCode'].setValue(t.name);
        }
      });
    });
  }

  getPositions() {
    this._dataService.getAll("categorycommon", "CHUCVU").subscribe(resp => this.positions = resp.items, err => { }, () => {
      this.positions.forEach(p => {
        if (p.code == this.obj.positionCode) {
          this._frm.controls['positionCode'].setValue(p.name);
        }
      });
    });
  }

  getAcademics() {
    this._dataService.getAll("categorycommon", "HOCHAM").subscribe(resp => this.academics = resp.items, err => { }, () => {
      this.academics.forEach(a => {
        if (a.id == this.obj.academicId) {
          this._frm.controls['academicId'].setValue(a.name);
        }
      });
    });
  }

  getDegrees() {
    this._dataService.getAll("categorycommon", "HOCVI").subscribe(resp => this.degrees = resp.items, err => { }, () => {
      this.degrees.forEach(d => {
        if (d.id == this.obj.degreeId) {
          this._frm.controls['degreeId'].setValue(d.name);
        }
      });
    });
  }

  getNations() {
    this._dataService.getAll("nations").subscribe(resp => this.nations = resp.items, err => { }, () => {
      this.nations.forEach(n => {
        if (n.nationCode == this.obj.nationCode) {
          this._frm.controls['nationCode'].setValue(n.nationName);
        }
        if (n.nationCode == this.obj.educationCountryCode) {
          this._frm.controls['educationCountryCode'].setValue(n.nationName);
        }
      });
    });
  }

  getEthnicities() {
    this._dataService.getAll("ethnicity").subscribe(resp => { this.ethnicities = resp.items; }, err => { }, () => {
      this.ethnicities.forEach(e => {
        if (e.ethnicityCode == this.obj.ethnicityCode) {
          this._frm.controls['ethnicityCode'].setValue(e.name);
        }
      });
    });
  }

  getSpecialist() {
    this.dataService.get("catcommon", '', "{name:'asc'}", null, 300).subscribe(resp => this._specialist = resp.items);
  }

  @ViewChild("continueAdd") continueAdd: MatCheckbox;

  checkBoxChange(controlName?) {
    if (controlName != null) {
      this._frm.controls[controlName].setValue(!this._frm.controls[controlName].value);
    }
    else {
      this.continueAdd.writeValue(!this.continueAdd.checked);
    }
  }


  //End Base//

  //Auto complete health facilities

  displayFn(h?: IHealthfacilities): string | undefined {
    return h ? h.name : undefined;
  }

  filterOptions() {
    this.healthfacilitiesControl.valueChanges
      .pipe(
        debounceTime(500),
        tap(() => this.isLoading = true),
        switchMap(value => this.filter(value))
      )
      .subscribe(data => {
        this._healthfacilities = data.items;
      });
  }

  filter(value: any) {
    var fValue = typeof value === 'string' ? value : (value ? value.name : '')
    this._healthfacilities = [];

    return this.dataService
      .get("healthfacilities", JSON.stringify({
        name: isNaN(fValue) ? fValue : "",
        code: !isNaN(fValue) ? fValue : ""
      }), '', null, null)
      .pipe(
        finalize(() => this.isLoading = false)
      )
  }

  onSelectHealthFacilities(obj: any) {
    this.healthfacilitiesControl.value ? this._frm.controls['healthfacilities'].setValue(this.healthfacilitiesControl.value.healthFacilitiesId) : (this.appSession.user.healthFacilitiesId == null ? this._frm.controls['healthfacilities'].setValue(null) : '');
  }

  closed(): void {
    if (this.healthfacilitiesControl.value && typeof this.healthfacilitiesControl.value == 'string' && !this.healthfacilitiesControl.value.trim()) this.healthfacilitiesControl.setErrors({ required: true })
  }

  //chips
  add(event: MatChipInputEvent): void {
    if (!this.matAutocomplete.isOpen) {
      const input = event.input;

      if (input) {
        input.value = '';
      }

      this.healthfacilitiesControl.setValue(null);
    }
  }


  remove(code: string): void {
    for (let i = 0; i < this._healthfacilitiesChip.length; i++) {
      if (this._healthfacilitiesChip[i].code == code)
        this._healthfacilitiesChip.splice(i, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    var check;
    if (this._healthfacilitiesChip.length == 0) {
      this._healthfacilitiesChip.push(event.option.value);
    }
    else {
      this._healthfacilitiesChip.forEach(h => {
        if (h.healthFacilitiesId == event.option.value.healthFacilitiesId) {
          check = false;
        }
      });
      if (check != false) {
        this._healthfacilitiesChip.push(event.option.value);
      }
      else {
        notifyToastr('Thông báo', 'Đã chọn đơn vị này', 'warning');
        // swal({
        //   title: 'Thông báo',
        //   text: 'Đã chọn đơn vị này',
        //   type: 'warning',
        //   timer: 3000
        // })
      }
    }
    this.healthfacilitiesInput.nativeElement.value = '';
    this.healthfacilitiesControl.setValue(null);
  }

  healthInput() {
    this._healthfacilities = null;
    this.filterOptions();
  }
  //End auto complete health facilities




  //Auto complete specialist
  displaySpecialistFn(h?: ICategoryCommon): string | undefined {
    return h ? h.name : undefined;
  }


  filterSpecialistOptions() {
    this.specialistCodeControl.valueChanges
      .pipe(
        debounceTime(500),
        tap(() => this.specialIsLoading = true),
        switchMap(value => this.filterSpecialist(value))
      )
      .subscribe(data => this._specialist = data.items);
  }

  filterSpecialist(value: any) {
    var fValue = value;
    this._specialist = [];
    return this.dataService
      .get("catcommon", JSON.stringify({
        name: isNaN(fValue) ? fValue : "",
        max: 300
      }), "{name:'asc'}", null, 300)
      .pipe(finalize(() => this.specialIsLoading = false));
  }

  specialClosed(): void {
    if (this.specialistCodeControl.value && typeof this.specialistCodeControl.value == 'string' && !this.specialistCodeControl.value.trim()) {
      this.specialistCodeControl.setErrors({ required: true });
    }
  }



  //chips
  specialAdd(event: MatChipInputEvent): void {
    if (!this.autoSpecialist.isOpen) {
      const input = event.input;
      if (input) {
        input.value = '';
      }
      this.specialistCodeControl.setValue(null);
    }
  }

  specialRemove(code: string): void {
    for (let i = 0; i < this._specialistChip.length; i++) {
      if (this._specialistChip[i].specialistCode == code) {
        this._specialistChip.splice(i, 1);
      }
    }
    if (this._specialistChip.length > 0) {
      this.checkSpecial = true;
    }
    else {
      this.checkSpecial = false;
    }
  }


  specialSelected(event: MatAutocompleteSelectedEvent): void {
    this.checkSpecial = true;

    var check;
    if (this._specialistChip.length == 0) {
      var s = new Specialist(event.option.value.code, event.option.value.name);
      this._specialistChip.push(s);
    }
    else {
      this._specialistChip.forEach(h => {
        if (h.specialistCode == event.option.value.code) {
          check = false;
        }
      });
      if (check != false) {
        var s = new Specialist(event.option.value.code, event.option.value.name);
        this._specialistChip.push(s);
      }
      else {
        notifyToastr('Thông báo', 'Đã chọn chuyên khoa này', 'warning');
        // swal({
        //   title: 'Thông báo',
        //   text: 'Đã chọn chuyên khoa này',
        //   type: 'warning',
        //   timer: 3000
        // })
      }
    }
    this.specialistInput.nativeElement.value = '';
    this.specialistCodeControl.setValue(null);
  }

  specialInput() {
    this._specialist = null;
    this.filterSpecialistOptions();
  }

  //End auto complete specialist

  detectFiles(event) {
    if (event.target.files[0].size > 2097152) {
      this._frm.controls['avatar'].setValue(null);
      this.avatarName = "Chưa chọn ảnh";
      return notifyToastr('Thông báo', 'File quá lớn. Chỉ được chọn file có dung lượng nhỏ hơn hoặc bằng 2MB', 'warning');
      //   swal({
      //   title: 'Thông báo',
      //   text: 'File quá lớn. Chỉ được chọn file có dung lượng nhỏ hơn hoặc bằng 2MB',
      //   type: 'warning',
      //   timer: 3000
      // });
    }
    this.avatarName = this.replace_space(this.replace_alias(event.target.files[0].name));
    this._avatarError = "";
    let files = event.target.files;
    if (files) {
      for (let file of files) {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        if (file.type == 'image/jpeg' || file.type == 'image/png') {
          reader.onload = (e: any) => {
            this.checkAvatar = false;
            this._avatars[0] = e.target.result;
          }
          this._frm.controls['avatar'].setValue(file);
          reader.readAsDataURL(file);
        } else {
          this.avatarName = "Chưa chọn ảnh";
          notifyToastr('Thông báo', 'Chỉ được tải lên file jpg, png, jpeg, pdf', 'warning');
          // swal({
          //   title: 'Thông báo',
          //   text: 'Chỉ được tải lên file jpg, png, jpeg, pdf',
          //   type: 'warning',
          //   timer: 3000
          // });
          this._frm.controls['avatar'].setValue(null);
        }
      }
    }
  }

  birthDayChange(value: any) {
    if (moment(this.birthDayPicker.nativeElement.value, 'DD/MM/YYYY').valueOf() > moment(moment(new Date()).format('DD/MM/YYYY'), 'DD/MM/YYYY').valueOf()) {
      return notifyToastr(this.l('Notification'), 'Ngày sinh phải nhỏ hơn ngày hiện tại', 'warning');
      // swal({
      //   title: this.l('Notification'),
      //   text: 'Ngày sinh phải nhỏ hơn ngày hiện tại',
      //   type: 'warning',
      //   timer: 3000
      // });
    }

    this._birthDay = this.birthDayPicker.nativeElement.value;
  }

  certificationDateChange(value: any) {
    // var date = moment(this.certificationDatePicker.nativeElement.value, 'DD/MM/YYYY').date() + 1;
    // var month = moment(this.certificationDatePicker.nativeElement.value, 'DD/MM/YYYY').month() + 1;
    // var year = moment(this.certificationDatePicker.nativeElement.value, 'DD/MM/YYYY').year();
    // this._certificationDate = moment(date + "/" + month + "/" + year, 'DD/MM/YYYY').toDate();
    this._certificationDate = value;
  }

  onCtrlV() {

  }

  onCtrlC() {

  }

  rulePhoneNumber() {
    var control = this._frm.controls['phoneNumber'];

    const pattern = /^[0-9\+]*$/;

    if (control.value && !pattern.test(control.value)) {
      control.setValue(control.value.replace(/[^0-9\+]/g, ""));
    }
  }

  ruleEmail(event: any) {
    const pattern = /^[a-zA-Z0-9\.\-\_\@]*$/;
    if (!pattern.test(event.target.value)) {
      event.target.value = event.target.value.replace(/[^a-zA-Z0-9\.\-\_\@]/g, "");
    }
  }



  checkSpecial = true;

  specialistClick() {
    if (this._specialistChip.length == 0) {
      this.checkSpecial = false;
    }
    else {
      this.checkSpecial = true;
    }
  }

  fullNameInput($event) {
    if ($event.data != null) {
      if (this._specialistChip.length == 0) {
        this.checkSpecial = false;
      }
      else {
        this.checkSpecial = true;
      }
    }
  }


  //SUBMIT
  submit() {
    if (this._frm.controls['provinceCode'].value == undefined) {
      this._frm.controls['provinceCode'].setValue(null);
    }
    if (this._frm.controls['districtCode'].value == undefined) {
      this._frm.controls['districtCode'].setValue(null);
    }
    if (this._frm.controls['ethnicityCode'].value == undefined) {
      this._frm.controls['ethnicityCode'].setValue(null);
    }
    if (this._frm.controls['educationCountryCode'].value == undefined) {
      this._frm.controls['educationCountryCode'].setValue(null);
    }
    if (this._frm.controls['nationCode'].value == undefined) {
      this._frm.controls['nationCode'].setValue(null);
    }
    var params = _.pick(this._frm.value, [
      'doctorId',
      'fullName',
      'specialist',
      'gender',
      'titleCode',
      'positionCode',
      'nationCode',
      'ethnicityCode',
      'certificationDate',
      'academicId',
      'degreeId',
      'email',
      'certificationCode',
      'address',
      'provinceCode',
      'districtCode',
      'phoneNumber',
      'educationCountryCode',
      'avatar',
      'description',
      'priceFrom',
      'priceTo',
      'priceDescription',
      'summary',
      'allowBooking',
      'allowFilter',
      'allowSearch',
      'healthfacilities',
      'createUserId',
      'updateUserId',
      'birthDate',
      'birthMonth',
      'birthYear']);

    params.fullName = _.trim(params.fullName);

    var priceFrom = this._frm.controls['priceFrom'].value;
    var priceTo = this._frm.controls['priceTo'].value;

    if (priceFrom > 2000000000) {
      return notifyToastr('Thông báo', 'Giá khám từ không được lớn hơn 2,000,000,000', 'warning');
      //  swal({
      //   title: 'Thông báo',
      //   text: 'Giá khám từ không được lớn hơn 2,000,000,000',
      //   type: 'warning',
      //   timer: 3000
      // });
    }
    if (priceTo > 2000000000) {
      return notifyToastr('Thông báo', 'Giá khám đến không được lớn hơn 2,000,000,000', 'warning');
      //   swal({
      //   title: 'Thông báo',
      //   text: 'Giá khám đến không được lớn hơn 2,000,000,000',
      //   type: 'warning',
      //   timer: 3000
      // });
    }
    if (this._specialistChip.length == 0) {
      return notifyToastr('Thông báo', 'Yêu cầu chọn ít nhất một chuyên khoa', 'warning');
      //  swal({
      //   title: 'Thông báo',
      //   text: 'Yêu cầu chọn ít nhất một chuyên khoa',
      //   type: 'warning',
      //   timer: 3000
      // });
    }
    if (this.birthDayPicker.nativeElement.value != "" && !moment(this.birthDayPicker.nativeElement.value, 'DD/MM/YYYY').isValid()) {
      return notifyToastr('Thông báo', 'Ngày sinh không đúng định dạng', 'warning');
      //  swal({
      //   title: 'Thông báo',
      //   text: 'Ngày sinh không đúng định dạng',
      //   type: 'warning',
      //   timer: 3000
      // });
    }

    if (moment(this.certificationDatePicker.nativeElement.value, 'DD/MM/YYYY').toDate() > new Date(Date.now())) {
      return notifyToastr('Thông báo', 'Ngày cấp chứng chỉ hành nghề lớn hơn ngày hiện tại', 'warning'); 
      //   swal({
      //   title: 'Thông báo',
      //   text: 'Ngày cấp chứng chỉ hành nghề lớn hơn ngày hiện tại',
      //   type: 'warning',
      //   timer: 3000
      // });
    }
    if (this.certificationDatePicker.nativeElement.value != "" && !moment(this.certificationDatePicker.nativeElement.value, 'DD/MM/YYYY').isValid()) {
      return notifyToastr('Thông báo', 'Ngày cấp chứng chỉ hành ngành không đúng định dạng', 'warning'); 
      //  swal({
      //   title: 'Thông báo',
      //   text: 'Ngày cấp chứng chỉ hành ngành không đúng định dạng',
      //   type: 'warning',
      //   timer: 3000
      // });
    }
    if ((this._frm.controls['certificationCode'].value === "" || this._frm.controls['certificationCode'].value == null) && (this.certificationDatePicker.nativeElement.value != '' || this.certificationDatePicker.nativeElement.valueAsDate != null)) {
      return notifyToastr('Thông báo', 'Yêu cầu nhập mã giấy phép hành nghề trước khi nhập ngày cấp', 'warning'); 
      //  swal({
      //   title: 'Thông báo',
      //   text: 'Yêu cầu nhập mã giấy phép hành nghề trước khi nhập ngày cấp',
      //   type: 'warning',
      //   timer: 3000
      // });
    }

    if (typeof priceFrom === 'number' && typeof priceTo === 'number' && priceFrom >= priceTo) {
      this.checkPriceTo = true;
      this.checkPriceFrom = true;
      return notifyToastr('Thông báo', 'Giá khám từ phải nhỏ hơn giá khám đến', 'warning'); 
      // swal({
      //   title: 'Thông báo',
      //   text: 'Giá khám từ phải nhỏ hơn giá khám đến',
      //   type: 'warning',
      //   timer: 3000
      // });
    }

    // if (priceFrom == 0) {
    //   this.checkPriceFrom = true;
    //   return swal({
    //     title: 'Thông báo',
    //     text: 'Giá trị nhập vào phải lớn hơn 0',
    //     type: 'warning',
    //     timer: 3000
    //   });
    // }
    // if (priceTo == 0) {
    //   this.checkPriceTo = true;
    //   return swal({
    //     title: 'Thông báo',
    //     text: 'Giá trị nhập vào phải lớn hơn 0',
    //     type: 'warning',
    //     timer: 3000
    //   });
    // }
    // if (priceFrom == null || priceFrom == "") {
    //   if (priceTo != null && priceTo != "") {
    //     this.checkPriceTo = true;
    //     return swal({
    //       title: 'Thông báo',
    //       text: 'Giá khám từ phải nhỏ hơn giá khám đến',
    //       type: 'warning',
    //       timer: 3000
    //     });
    //   }
    //   else {
    //     if (priceFrom >= priceTo) {
    //       this.checkPriceTo = true;
    //       return swal({
    //         title: 'Thông báo',
    //         text: 'Giá khám từ phải nhỏ hơn giá khám đến',
    //         type: 'warning',
    //         timer: 3000
    //       });
    //     }
    //   }
    // }
    // if (priceTo == null || priceTo == "") {
    //   if (priceFrom != null && priceFrom != "") {
    //     this.checkPriceFrom = true;
    //     return swal({
    //       title: 'Thông báo',
    //       text: 'Giá khám từ phải nhỏ hơn giá khám đến',
    //       type: 'warning',
    //       timer: 3000
    //     });
    //   }
    //   else {
    //     if (priceFrom >= priceTo) {
    //       this.checkPriceFrom = true;
    //       return swal({
    //         title: 'Thông báo',
    //         text: 'Giá khám từ phải nhỏ hơn giá khám đến',
    //         type: 'warning',
    //         timer: 3000
    //       });
    //     }
    //   }
    // }

    if (this.obj) {
      params.doctorId = this.obj.doctorId;
    }

    if (this._certificationDate) {
      var cerdate = moment(this._certificationDate, 'DD/MM/YYYY').date() + "/" + moment(this._certificationDate, 'DD/MM/YYYY').month() + "/" + moment(this._certificationDate, 'DD/MM/YYYY').year();
      params.certificationDate = cerdate;
    }


    params.avatar = this._frm.controls['avatar'].value;

    //Set birthDate
    if (this._birthDay && this.birthDayPicker.nativeElement.value != "") {
      params.birthDate = moment(this._birthDay, 'DD/MM/YYYY').date();
      params.birthMonth = moment(this._birthDay, 'DD/MM/YYYY').month() + 1;
      params.birthYear = moment(this._birthDay, 'DD/MM/YYYY').year();
    }

    if (this.appSession.userId && this._isNew == true) {
      params.createUserId = this.appSession.userId;
      params.updateUserId = this.appSession.userId;
    }

    if (this.appSession.userId && this._isNew == false) {
      params.updateUserId = this.appSession.userId;
    }



    if (this._specialistChip) {
      params.specialist = this._specialistChip;
    }
    else {
      params.specialist = [];
    }

    if (this.appSession.user.healthFacilitiesId) {
      this._healthfacilitiesChip.push({ healthFacilitiesId: this.appSession.user.healthFacilitiesId });
    }

    if (this._healthfacilitiesChip) {
      params.healthfacilities = this._healthfacilitiesChip;
    }
    else {
      params.healthfacilities = [];
    }

    if (!this._specialistChip) {
      notifyToastr('Thông báo', 'Yêu cầu chọn ít nhất một chuyên khoa', 'warning'); 
      // swal({
      //   title: 'Thông báo',
      //   text: 'Yêu cầu chọn ít nhất một chuyên khoa',
      //   type: 'warning',
      //   timer: 3000
      // })
    } else {
      this._isNew ?
        this._dataService.createUpload(this.api, standardized(Object.assign(params, {}), {})).subscribe(() => {
          notifyToastr(this.l('SaveSuccess'), '', 'success'); 
          // swal({
          //   title: this.l('SaveSuccess'),
          //   text: '',
          //   type: 'success',
          //   timer: 3000
          // });
          if (this.continueAdd.checked == true) {
            this.openDialogDoctor();
          } else {
            this.dialogRef.close();
          }
        }, err => {
          this.checkCertificationCode = true;
        }) :
        this._dataService.updateUpload(this.api, standardized(Object.assign(params, {}), {})).subscribe(() => {
          notifyToastr(this.l('SaveSuccess'), '', 'success'); 
          // swal({
          //   title: this.l('SaveSuccess'),
          //   text: '',
          //   type: 'success',
          //   timer: 3000
          // });
          this.dialogRef.close();
        }, err => {
          this.checkCertificationCode = true;
        });
    }
  }


  openDialogDoctor(): void {
    const dialogRef = this.dialog.open(this.dialogComponent, { minWidth: 'calc(100vw/1.5)', maxWidth: 'calc(100vw - 100px)', disableClose: true });
    dialogRef.afterClosed().subscribe(() => {
      this.dialogRef.close();
    }, err => { });
  }
}
