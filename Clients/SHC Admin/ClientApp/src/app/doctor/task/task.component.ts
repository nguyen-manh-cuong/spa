
import { IDoctor } from './../../../../../../SHC Client/ClientApp/src/shared/Interfaces';
import * as _ from 'lodash';
// import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Component, Inject, Injector, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatInput, MatCheckbox } from '@angular/material';
import * as moment from 'moment';
import { AppComponentBase } from '@shared/app-component-base';
import { DataService } from '@shared/service-proxies/service-data';
import { ValidationRule } from '@shared/common/common';
import swal from 'sweetalert2';
import { publishBehavior } from 'rxjs/operators';
import { element } from '@angular/core/src/render3/instructions';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
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
  _birthDay: Date = new Date(Date.now());
  _certificationDate:Date=new Date(Date.now());
  api: string = 'doctor';
  _frm: FormGroup;

  positions = [];
  titles = [];
  academics = [];
  degrees = [];
  nations = [];
  ethnicities = [];
  specialist = [];
  provinces = [];
  districts = [];
  checkProvince = false;

  _obj: IDoctor | any = {
    fullName: '',
    hisId: '',
    specialist: [],
    birthDate: 0,
    birthMonth: 0,
    birthYear: 0,
    gender: 1,
    titleCode: '',
    posittionCode: '',
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
    avatar: 'https://cmkt-image-prd.global.ssl.fastly.net/0.1.0/ps/1441527/1160/772/m1/fpnw/wm0/businessman-avatar-icon-01-.jpg?1468234792&s=e3a468692e15e93a2056bd848193e97a',
    description: '',
    priceFrom: 0,
    priceTo: 0,
    priceDescription: '',
    sumary: '',
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

  // public Editor = ClassicEditor;

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
    this.getEthnicities();
    this.getSpecialist();


    const validationRule = new ValidationRule();
    if (this.obj) {
      this._obj = _.clone(this.obj);
      this._isNew = false;
    }

    if (this.obj) {
      if (this._obj.birthDate) {
        this._birthDay = new Date(this._obj.birthMonth + "/" + this._obj.birthDate + "/" + this._obj.birthYear);
      }
      else if (this._obj.birthMonth) {
        this._birthDay = new Date(this._obj.birthMonth + "/01/" + this._obj.birthYear);
      }
      else {
        this._birthDay = new Date("01/01/" + this._obj.birthYear);
      }

      if(this._obj.certificationDate){
        this._certificationDate=this._obj.certificationDate;
      }
      else{
        this._obj.certificationDate=new Date(Date.now());
      }
    }




    this._context = {
      fullName: [this._obj.fullName, [Validators.required, validationRule.hasValue]],
      specialist: [this._obj.specialist, [Validators.required, validationRule.hasValue]],
      birthDay: [this._birthDay],
      gender: this._obj.gender,
      titleCode: this._obj.titleCode,
      posittionCode: [this._obj.posittionCode],
      nationCode: [this._obj.nationCode],
      ethnicityCode: [this._obj.ethnicityCode],
      certificationDate: [this._obj.certificationDate],
      academicId: [this._obj.academicId],
      degreeId: [this._obj.degreeId],
      email: [this._obj.email],
      certificationCode: [this._obj.certificationCode],
      address: [this._obj.address],
      provinceCode: [this._obj.provinceCode],
      districtCode: [this._obj.districtCode],
      phoneNumber: [this._obj.phoneNumber],
      educationCountryCode: [this._obj.educationCountryCode],
      avatar: [this._obj.avatar],
      description: this._obj.description,
      priceFrom: [this._obj.priceFrom],
      priceTo: [this._obj.priceTo],
      priceDescription: this._obj.priceDescription,
      sumary: [this._obj.sumary],
      allowBooking: [this._obj.allowBooking],
      allowFilter: [this._obj.allowFilter],
      allowSearch: [this._obj.allowSearch],
      healthFacilities: [this._obj.healthFacilities]
    };

    this._frm = this._formBuilder.group(this._context);
    console.log('Gia tri form', this._context);
    if (this._obj.avatar == "") {
      this._frm.controls['avatar'].setValue("https://cmkt-image-prd.global.ssl.fastly.net/0.1.0/ps/1441527/1160/772/m1/fpnw/wm0/businessman-avatar-icon-01-.jpg?1468234792&s=e3a468692e15e93a2056bd848193e97a");
    }

    // if (this.obj)
    //   this._frm.controls['allowBooking'].setValue(this._obj.allowBooking);
    //   this._frm.controls['allowFilter'].setValue(this._obj.allowFilter);
    //   this._frm.controls['allowSearch'].setValue(this._obj.allowSearch);
  }


  ngAfterViewInit(): void {
    setTimeout(() => {
      this.birthDayPicker.nativeElement.value = moment(this._birthDay).format("DD/MM/YYYY");
      this.certificationDatePicker.nativeElement.value=moment(this._certificationDate).format("DD/MM/YYYY");
    });
  }

  submit() {
    console.log(201, 'vao ham submit', this._frm.value);
    var params = _.pick(this._frm.value, ['id', 'fullName', , 'isActive', 'createUserId', 'updateUserId']);

    params.fullName = _.trim(params.fullName);    

    if (!moment(this.birthDayPicker.nativeElement.value, 'DD/MM/YYYY').isValid()) {
      return swal('Thông báo', 'Ngày sinh không đúng định dạng', 'warning');
    }
    else{
      if (this.obj) {
        params.id = this.obj.doctorId;
      }
  
      if (this.appSession.userId && this._isNew == true) {
        params.createUserId = this.appSession.userId;
        params.updateUserId = this.appSession.userId;
      }
  
      if (this.appSession.userId && this._isNew == false) {
        params.updateUserId = this.appSession.userId;
      }
      console.log('Gia tri params', params);
      this._isNew ?
        this._dataService.create(this.api, params).subscribe(() => {
          swal(this.l('SaveSuccess'), '', 'success');
          this.dialogRef.close();
        }, err => { }) :       
        this._dataService.update(this.api, params).subscribe(() => {
          swal(this.l('SaveSuccess'), '', 'success');
          this.dialogRef.close();
        }, err => { });
    }
  }

  // myFilter = (d: Date): boolean => {
  //   const date = d;
  //   var now=new Date(new Date(new Date(Date.now()).setHours(0,0,0)).setDate(new Date(Date.now()).getDate()-1));
  //   return date >= now;
  // }


  //Base//

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
    this._dataService.getAll("categorycommon", "CHUYENKHOA").subscribe(resp => this.specialist = resp.items);
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
}
