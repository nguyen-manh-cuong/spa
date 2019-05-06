import { forEach } from '@angular/router/src/utils/collection';

import { IDoctor, IHealthfacilities, IHealthfacilitiesDoctor, IDoctorSpecialists } from './../../../../../../SHC Client/ClientApp/src/shared/Interfaces';
import * as _ from 'lodash';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Component, Inject, Injector, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatInput, MatCheckbox } from '@angular/material';
import * as moment from 'moment';
import { AppComponentBase } from '@shared/app-component-base';
import { DataService } from '@shared/service-proxies/service-data';
import { ValidationRule } from '@shared/common/common';
import swal from 'sweetalert2';
import { publishBehavior, startWith, map } from 'rxjs/operators';
import { element } from '@angular/core/src/render3/instructions';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { ICategoryCommon } from '@shared/Interfaces';
import { MatAutocompleteTrigger } from '@angular/material';
import { FileValidator } from 'ngx-material-file-input';
import { Observable } from 'rxjs';
import { standardized } from '@shared/helpers/utils';
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

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class TaskComponent extends AppComponentBase implements OnInit, AfterViewInit {

  _certificationInputCheck:Boolean;

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

  constructor(
    injector: Injector,
    private _dataService: DataService,
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<TaskComponent>,
    @Inject(MAT_DIALOG_DATA)
    public obj: IDoctor) {
    super(injector);
  }

  @ViewChild("birthDayPicker") birthDayPicker;
  @ViewChild("certificationDatePicker") certificationDatePicker;

  ngOnInit() {

    this.getProvinces();
    this.getTitles();
    this.getPositions();
    this.getAcademics();
    this.getDegrees();
    this.getNations();
    this.getSpecialist();
    this.getEthnicities();



    const validationRule = new ValidationRule();

    if (this.obj) {

      if (this.obj.provinceCode) {
        this.getDistricts(this.obj.provinceCode);
      }

      this._obj = _.clone(this.obj);
      this._isNew = false;
    }

    if (this.obj.birthYear) {
    //   if (this._obj.birthDate) {
        this._birthDay = new Date(this._obj.birthMonth + "/" + this._obj.birthDate + "/" + this._obj.birthYear);
     }

      // else if (this._obj.birthMonth) {
      //   this._birthDay = new Date(this._obj.birthMonth + "/01/" + this._obj.birthYear);
      // }
      // else {
      //   this._birthDay = new Date("01/01/" + this._obj.birthYear);
      // }
      if (this.obj.certificationDate) {
        this._certificationDate = this.obj.certificationDate;
      }
    //   else {
    //     this._obj.certificationDate = new Date(Date.now());
    //   }
    // }


    this._context = {
      doctorId: [this._obj.doctorId],
      fullName: [this._obj.fullName, [Validators.required, validationRule.hasValue]],
      specialist: [this._obj.specialist, [Validators.required, validationRule.hasValue]],
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

    if (this.appSession.user.healthFacilitiesId) {
      this._dataService.getAll('healthfacilities', "{healthfacilitiesId:" + String(this.appSession.user.healthFacilitiesId) + "}").subscribe(resp => this._healthfacilities = resp.items);
      this._frm.controls['healthfacilities'].setValue(this.appSession.user.healthFacilitiesId);
    }
    else {
      this._dataService.getAll('healthfacilities').subscribe(resp => this._healthfacilities = resp.items);
      this.filterOptions();
    }
  }


  ngAfterViewInit(): void {
    setTimeout(() => {
      if(this.obj.birthYear){
        this.birthDayPicker.nativeElement.value = moment(this._birthDay).format("DD/MM/YYYY");
      }
      if(this.obj.certificationDate){
        this.certificationDatePicker.nativeElement.value = moment(this._certificationDate).format("DD/MM/YYYY");
      }
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

  certificationCodeChange($event){
    console.log($event);
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
    this._dataService.getAll("ethnicity").subscribe(resp => this.ethnicities = resp.items);
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

  _filterHealthfacilities(name: any): IHealthfacilities[] {
    const filterValue = name.toLowerCase();
    var healthfacilities = isNaN(filterValue) ?
      this._healthfacilities.filter(h => h.name.toLowerCase().indexOf(filterValue) === 0) :
      this._healthfacilities.filter(h => h.code.toLowerCase().indexOf(filterValue) === 0);
    return healthfacilities;
  }

  clickCbo() {
    !this.healthfacilitiesControl.value ? this.filterOptions() : '';
  }

  filterOptions() {
    this.filteredHealthFacilitiesOptions = this.healthfacilitiesControl.valueChanges
      .pipe(
        startWith<string | IHealthfacilities>(''),
        map(value => typeof value === 'string' ? value : value.name),
        map(name => name ? this._filterHealthfacilities(name) : this._healthfacilities.slice()),
        map(data => data.slice())
      );
  }

  onInputHealthfacilities(obj: any) {
    this._frm.controls['healthfacilities'].setValue(0);
    this._healthFacilitiesId = null;
  }

  onSelectHealthFacilities(value: any) {
    if (value.healthFacilitiesId) {
      this._frm.controls['healthfacilities'].setValue(value.healthFacilitiesId);
      this._healthFacilitiesId = value.healthFacilitiesId;
    }
  }

  //End auto complete health facilities




  //Auto complete specialist
  displaySpecialistFn(h?: ICategoryCommon): string | undefined {
    return h ? h.name : undefined;
  }


  _filterSpecialist(name: any): ICategoryCommon[] {
    const filterValue = name.toLowerCase();
    var specialist = isNaN(filterValue) ?
      this._specialist.filter(c => c.code.toLowerCase().indexOf(filterValue) === 0) :
      this._specialist.filter(c => c.name.toLowerCase().indexOf(filterValue) === 0);
    return specialist;
  }

  clickSpecialistCbo() {
    !this.specialistCodeControl.value ? this.filterSpecialistOptions() : '';
  }

  filterSpecialistOptions() {
    this.filteredSpecialistOptions = this.specialistCodeControl.valueChanges
      .pipe(
        startWith<string | ICategoryCommon>(''),
        map(value => typeof value === 'string' ? value : value.name),
        map(name => name ? this._filterSpecialist(name) : this._specialist.slice()),
        map(data => data.slice())
      );
  }

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

  onInputSpecialist(obj: any) {
    this._frm.controls['specialist'].setValue("");
    this._specialistCode = null;
  }

  onSelectSpecialist(value: any) {
    if (value.code) {
      this._frm.controls['specialist'].setValue(value.code);
      this._specialistCode = value.code;
    }
  }

  birthDayChange(value: any) {
    this._birthDay = this.birthDayPicker.nativeElement.value;
  }

  certificationDateChange(value: any) {
    // var date = moment(this.certificationDatePicker.nativeElement.value, 'DD/MM/YYYY').date() + 1;
    // var month = moment(this.certificationDatePicker.nativeElement.value, 'DD/MM/YYYY').month() + 1;
    // var year = moment(this.certificationDatePicker.nativeElement.value, 'DD/MM/YYYY').year();
    // this._certificationDate = moment(date + "/" + month + "/" + year, 'DD/MM/YYYY').toDate();
    this._certificationDate = value;
  }

  //End auto complete specialist

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

    if (!moment(this.birthDayPicker.nativeElement.value, 'DD/MM/YYYY').isValid()) {
      return swal({
        title: 'Thông báo',
        text: 'Ngày sinh không đúng định dạng',
        type: 'warning',
        timer: 3000
      });
    }
    else if (this.certificationDatePicker.nativeElement.value!="" && !moment(this.certificationDatePicker.nativeElement.value, 'DD/MM/YYYY').isValid()) {
      return swal({
        title: 'Thông báo',
        text: 'Ngày cấp chứng chỉ hành ngành không đúng định dạng',
        type: 'warning',
        timer: 3000
      });
    }
    else {
      if (this.obj) {
        params.doctorId = this.obj.doctorId;
      }

      if(this._certificationDate){
        var cerdate=moment(this._certificationDate,'DD/MM/YYYY').date()+"/"+moment(this._certificationDate,'DD/MM/YYYY').month()+"/"+moment(this._certificationDate,'DD/MM/YYYY').year();
        params.certificationDate =cerdate;
      }


      params.avatar = this._frm.controls['avatar'].value;

      //Set birthDate
      if(this._birthDay){
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

      if (this.specialistCodeControl.value != null) {
        var special = new DoctorSpecialists(this.specialistCodeControl.value.code);
        this._speciaList.push(special);
        params.specialist = this._speciaList;
      }
      else {
        params.specialist = [];
      }

      if (this.healthfacilitiesControl.value != null) {
        var health = new HealthfacilitiesDoctor(this.healthfacilitiesControl.value.healthFacilitiesId);
        this._healthFacilities.push(health);
        params.healthfacilities = this._healthFacilities;
      }
      else {
        params.healthfacilities = [];
      }

      this._isNew ?
        this._dataService.createUpload(this.api, standardized(Object.assign(params, {}), {})).subscribe(() => {
          swal({
            title: this.l('SaveSuccess'),
            text: '',
            type: 'success'
          });
          this.dialogRef.close();
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

}
