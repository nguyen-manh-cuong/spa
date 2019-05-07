import { forEach } from '@angular/router/src/utils/collection';
import { IDoctor, IHealthfacilities, IHealthfacilitiesDoctor, IDoctorSpecialists } from './../../../../../../SHC Client/ClientApp/src/shared/Interfaces';
import * as _ from 'lodash';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Component, Inject, Injector, OnInit, ViewChild, AfterViewInit, ElementRef, HostListener, Directive, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatInput, MatCheckbox, MatAutocomplete, MatChipInputEvent, MatAutocompleteSelectedEvent, MatDialog, MatPaginator } from '@angular/material';
import * as moment from 'moment';
import { AppComponentBase } from '@shared/app-component-base';
import { DataService } from '@shared/service-proxies/service-data';
import { ValidationRule } from '@shared/common/common';
import swal from 'sweetalert2';
import { publishBehavior, startWith, map, debounceTime, tap, switchMap, finalize, debounce } from 'rxjs/operators';
import { element } from '@angular/core/src/render3/instructions';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { ICategoryCommon } from '@shared/Interfaces';
import { MatAutocompleteTrigger } from '@angular/material';
import { FileValidator } from 'ngx-material-file-input';
import { Observable, fromEvent, merge, timer } from 'rxjs';
import { standardized } from '@shared/helpers/utils';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { stringify } from '@angular/compiler/src/util';
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

  dataService: DataService;
  isLoading = false;
  specialIsLoading = false;

  _certificationInputCheck: Boolean;

  _speciaList = [];
  _healthFacilities = [];

  _birthDay: Date;
  _certificationDate: Date;
  api: string = 'doctor';
  _frm: FormGroup;

  _healthfacilities = [];
  _specialist = [];

  _healthFacilitiesId: number;
  _specialistCode: number;

  _avatars = new Array<string>();
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
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];

  _specialistChip = [];
  specialVisible = true;
  specialSelectable = true;
  specialRemovable = true;
  specialDddOnBlur = true;
  specialSeparatorKeysCodes: number[] = [ENTER, COMMA];



  //chips
  @ViewChild('healthfacilitiesInput') healthfacilitiesInput: ElementRef<HTMLInputElement>;
  @ViewChild('specialistInput') specialistInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  @ViewChild('autoSpecialist') autoSpecialist: MatAutocomplete;

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
    priceFrom: 0,
    priceTo: 0,
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
    public dialog: MatDialog) {
    super(injector);
  }

  @ViewChild("birthDayPicker") birthDayPicker;
  @ViewChild("certificationDatePicker") certificationDatePicker;

  ngOnInit() {

    this.dataService = this._dataService;

    this.getProvinces();
    this.getTitles();
    this.getPositions();
    this.getAcademics();
    this.getDegrees();
    this.getNations();
    this.getSpecialist();
    this.getEthnicities();
    this.filterSpecialistOptions();

    this.dialogComponent = DetailComponent;

    const validationRule = new ValidationRule();



    if (this.obj) {

      if (this.obj.provinceCode) {
        this.getDistricts(this.obj.provinceCode);
      }

      this._obj = _.clone(this.obj);
      this._isNew = false;
    }

    if (this.obj) {
      //   if (this._obj.birthDate) {
      this._birthDay = new Date(this._obj.birthMonth + "/" + this._obj.birthDate + "/" + this._obj.birthYear);
    }



    // else if (this._obj.birthMonth) {
    //   this._birthDay = new Date(this._obj.birthMonth + "/01/" + this._obj.birthYear);
    // }
    // else {
    //   this._birthDay = new Date("01/01/" + this._obj.birthYear);
    // }
    if (this.obj) {
      this._certificationDate = this.obj.certificationDate;
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
      gender: this._obj.gender,
      titleCode: this._obj.titleCode,
      positionCode: [this._obj.positionCode],
      nationCode: [this._obj.nationCode],
      ethnicityCode: [this._obj.ethnicityCode],
      certificationDate: [this._obj.certificationDate],
      academicId: [this._obj.academicId],
      degreeId: [this._obj.degreeId],
      email: [this._obj.email, [Validators.email]],
      certificationCode: [this._obj.certificationCode],
      address: [this._obj.address],
      provinceCode: [this._obj.provinceCode],
      districtCode: [this._obj.districtCode],
      phoneNumber: [this._obj.phoneNumber],
      educationCountryCode: [this._obj.educationCountryCode],
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
        this.obj.specialist.forEach((e: any) => this._specialistChip.push(e));
      }
      if (this.obj) {
        if (this.obj.healthFacilities) {
          this.obj.healthFacilities.forEach((e: any) => this._healthfacilitiesChip.push(e));
        }
      }
    }
    this._obj.certificationCode ? this.flagDate = false : this.flagDate = true;
  }


  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.obj) {
        if (this.obj.birthDate) {
          this.birthDayPicker.nativeElement.value = moment(this._birthDay).format("DD/MM/YYYY");
        }
        if (this.obj.certificationDate)
          this.certificationDatePicker.nativeElement.value = moment(this._certificationDate).format("DD/MM/YYYY");
      }
      console.log("this._frm.ethnicityCode",this._frm.controls['ethnicityCode'].value)
    });
  }

  //Add custom editor
  onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(
      editor.ui.view.toolbar.element,
      editor.ui.getEditableElement()
    );
  }


  //Base//

  certificationCodeChange($event) {
    if ($event.data != null) {
      this.flagDate = false;
    }
    else {
      this.flagDate = true;
    }
  }

  getProvinces() {
    this._dataService.getAll("provinces").subscribe(resp => this.provinces = resp.items);
  }

  getDistricts(provinceCode) {
    this._dataService.getAll("districts", "{ProvinceCode:" + provinceCode + "}").subscribe(resp => this.districts = resp.items);
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
    this._dataService.getAll("categorycommon", "CHUCDANH").subscribe(resp => this.titles = resp.items);
  }

  getPositions() {
    this._dataService.getAll("categorycommon", "CHUCVU").subscribe(resp => this.positions = resp.items);
  }

  getAcademics() {
    this._dataService.getAll("categorycommon", "HOCHAM").subscribe(resp => this.academics = resp.items);
  }

  getDegrees() {
    this._dataService.getAll("categorycommon", "HOCVI").subscribe(resp => this.degrees = resp.items);
  }

  getNations() {
    this._dataService.getAll("nations").subscribe(resp => this.nations = resp.items);
  }

  getEthnicities() {
    this._dataService.getAll("ethnicity").subscribe(resp => {this.ethnicities = resp.items; console.log("ethnicityList",this.ethnicities);});
  }

  getSpecialist() {
    this._dataService.getAll("categorycommon", "CHUYENKHOA").subscribe(resp => this._specialist = resp.items);

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
    this._healthfacilitiesChip.push(event.option.value);
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
      }), '', null, null)
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
    var s = new Specialist(event.option.value.code, event.option.value.name);
    this._specialistChip.push(s);
    this.specialistInput.nativeElement.value = '';
    this.specialistCodeControl.setValue(null);
  }

  specialInput() {
    this._specialist = null;
    this.filterSpecialistOptions();
  }

  //End auto complete specialist

  detectFiles(event) {
    this._avatarError = "";
    let files = event.target.files;
    if (files) {
      for (let file of files) {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        if (file.type == 'image/jpeg' || file.type == 'image/png') {
          reader.onload = (e: any) => {
            this._avatars[0] = e.target.result;
          }
          this._frm.controls['avatar'].setValue(file);
          reader.readAsDataURL(file);
        } else {
          this._avatarError = "File tải lên không phải file ảnh";
        }
      }
    }
  }

  birthDayChange(value: any) {
    if (moment(this.birthDayPicker.nativeElement.value, 'DD/MM/YYYY').valueOf() > moment(moment(new Date()).format('DD/MM/YYYY'), 'DD/MM/YYYY').valueOf()) {
      return swal({
        title: this.l('Notification'),
        text: 'Ngày sinh phải nhỏ hơn ngày hiện tại',
        type: 'warning',
        timer: 3000
      });
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

  checkSpecial: boolean;

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
    var params = _.pick(this._frm.value, [
      'doctorId',
      'fullName',
      'specialist',
      'gender',
      'titleCode',
      'positionCode',
      'nationCode',
      'ethnicityCode',
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
      return swal({
        title: 'Thông báo',
        text: 'Giá khám từ không được lớn hơn 2,000,000,000',
        type: 'warning',
        timer: 3000
      });
    }
    if (priceTo > 2000000000) {
      return swal({
        title: 'Thông báo',
        text: 'Giá khám đến không được lớn hơn 2,000,000,000',
        type: 'warning',
        timer: 3000
      });
    }
    if (this._specialistChip.length == 0) {
      return swal({
        title: 'Thông báo',
        text: 'Yêu cầu chọn ít nhất một chuyên khoa',
        type: 'warning',
        timer: 3000
      });
    }
    if (this.birthDayPicker.nativeElement.value != "" && !moment(this.birthDayPicker.nativeElement.value, 'DD/MM/YYYY').isValid()) {
      return swal({
        title: 'Thông báo',
        text: 'Ngày sinh không đúng định dạng',
        type: 'warning',
        timer: 3000
      });
    }

    if (moment(this.certificationDatePicker.nativeElement.value, 'DD/MM/YYYY').toDate() > new Date(Date.now())) {
      return swal({
        title: 'Thông báo',
        text: 'Ngày cấp chứng chỉ hành nghề lớn hơn ngày hiện tại',
        type: 'warning',
        timer: 3000
      });
    }
    if (this.certificationDatePicker.nativeElement.value != "" && !moment(this.certificationDatePicker.nativeElement.value, 'DD/MM/YYYY').isValid()) {
      return swal({
        title: 'Thông báo',
        text: 'Ngày cấp chứng chỉ hành ngành không đúng định dạng',
        type: 'warning',
        timer: 3000
      });
    }
    if (this._frm.controls['certificationCode'].value == "" && this.certificationDatePicker.nativeElement.value != "") {
      return swal({
        title: 'Thông báo',
        text: 'Yêu cầu nhập mã giấy phép hành nghề trước khi nhập ngày cấp',
        type: 'warning',
        timer: 3000
      });
    }
    if (priceFrom >= priceTo && priceFrom != 0 && priceTo != 0) {
      return swal({
        title: 'Thông báo',
        text: 'Giá khám từ phải nhỏ hơn giá khám đến',
        type: 'warning',
        timer: 3000
      });
    }
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
      swal({
        title: 'Thông báo',
        text: 'Yêu cầu chọn ít nhất một chuyên khoa',
        type: 'warning',
        timer: 3000
      })
    } else {
      this._isNew ?
        this._dataService.createUpload(this.api, standardized(Object.assign(params, {}), {})).subscribe(() => {
          swal({
            title: this.l('SaveSuccess'),
            text: '',
            type: 'success'
          });
          if (this.continueAdd.checked == true) {
            this.openDialogDoctor();
          } else {
            this.dialogRef.close();
          }
        }, err => { }) :
        this._dataService.updateUpload(this.api, standardized(Object.assign(params, {}), {})).subscribe(() => {
          swal({
            title: this.l('SaveSuccess'),
            text: '',
            type: 'success'
          });
          this.dialogRef.close();
        }, err => { });
    }


  }

  openDialogDoctor(): void {
    const dialogRef = this.dialog.open(this.dialogComponent, { minWidth: 'calc(100vw/1.5)', maxWidth: 'calc(100vw - 100px)', disableClose: true });
    dialogRef.afterClosed().subscribe(() => {
      this.dialogRef.close();
    }, err => { });
  }
}
