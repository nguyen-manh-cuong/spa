import * as _ from 'lodash';
import * as moment from 'moment';

import { Component, Injector, OnInit, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ValidationRule } from '@shared/common/common';
import { AppComponentBase } from '@shared/app-component-base';
import { DataService } from '@shared/service-proxies/service-data';
import { Title, DomSanitizer } from '@angular/platform-browser';
import { IDoctor, IHealthfacilities } from '@shared/Interfaces';


@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class BookingComponent extends AppComponentBase implements OnInit, AfterViewInit {
  validateRule = new ValidationRule();
  public _currentStep: number = 1;
  public frmBooking: FormGroup;

  public _relationship: Array<{ id: number, name: string }> = [{ id: 1, name: 'Vợ/Chồng' }, { id: 2, name: 'Bố/Mẹ' }, { id: 3, name: 'Anh/Chị' }, { id: 4, name: 'Con' }];

  public _provinces = [];
  public _districts = [];

  public _dates = _.range(1, 32);
  public _months = _.range(1, 13);
  public _years = _.range(moment().year() - 100, moment().year() + 1);

  //3
  public _provincesExamination = [];
  public _districtsExamination = [];
  public _specialists = [];
  public _specialist = "";
  public _healthfacilities = [];
  public _healthfacility: IHealthfacilities;
  public _doctors = [];
  public _doctor: IDoctor;
  public _workingTimes = [];
  public _lstWorkingTimes = [];
  public _capcha: { code: string, data: any } = { code: '', data: '' };


  //4
  success = 0;
  isDoctor = 0;
  isClicked = -1;
  isChecked = true;
  type: any;
  dateExamination = '';
  capcha = false;
  defaultd = '../assets/images/default/defaultd.png';
  defaulth = '../assets/images/default/defaulth.jpg';

  slideConfig = {
    "slidesToShow": 4, 
    "slidesToScroll": 1,
    "nextArrow":'<div class="nav-btn next-slide"></div>',
    "prevArrow":false,
    "infinite": false
  };

  constructor(injector: Injector, private _sanitizer: DomSanitizer, private _dataService: DataService, private _formBuilder: FormBuilder, private titleService: Title) {
    super(injector);
  }

  ngOnInit() {
    this.frmBooking = this._formBuilder.group({
      //1
      bookingUser: ['', [Validators.required, this.validateRule.hasValue]], phoneNumber: ['', [Validators.required, this.validateRule.hasValue, this.validateRule.topPhoneNumber]],
      //2 
      bookingType: [1],
      bookingSecondUser: ['', [Validators.required, this.validateRule.hasValue]], phoneSecondNumber: ['', [Validators.required, this.validateRule.hasValue, this.validateRule.topPhoneNumber]], email: [, [this.validateRule.email]],
      bookingRepresent: ['', [Validators.required, this.validateRule.hasValue]], phoneRepresent: ['', [Validators.required, this.validateRule.hasValue, this.validateRule.topPhoneNumber]], emailRepresent: [, [this.validateRule.email]], 
      relationshipId: [1, Validators.required],
      gender: [1], birthDay: [], birthMonth: [], birthYear: [, Validators.required], address: [],
      provinceCode: [], districtCode: [], wardCode: [], reason: ['', [Validators.required, this.validateRule.hasValue]],
      //3
      provinceCodeExamination: [, Validators.required], districtCodeExamination: [, Validators.required],
      specialists: [], healthfacilitiesSearch: [], healthFacilitiesId: [, Validators.required],
      //4
      examinationDate: [, Validators.required], examinationWorkingTime: [], examinationTime: [], doctorId: [], ticketId: [], timeSlotId: [], codeCapcha: [], rules: [false]
    });

    if(this.appSession.user){
      this.frmBooking.controls['bookingUser'].setValue(this.appSession.user.fullName);
      this.frmBooking.controls['phoneNumber'].setValue(this.appSession.user.phoneNumber);
    }

    this._dataService.getAll('provinces').subscribe(resp => this._provinces = this._provincesExamination = resp.items);
    this.getDate();
    this.getCapcha();
    abp.ui.setBusy();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this._dataService
      .get('config', JSON.stringify(['A05.DefaultProvince', 'A05.DefaultDistrict']), '', 0, 0)
      .subscribe(resp => {      
        var provinceCode = resp.items.filter(el => el.code == 'A05.DefaultProvince');
        var districtCode = resp.items.filter(el => el.code == 'A05.DefaultDistrict');
        this.onSelectProvince(provinceCode[0].values);
        this.frmBooking.controls['provinceCode'].setValue(provinceCode[0].values);
        this.frmBooking.controls['districtCode'].setValue(districtCode[0].values);
      });
    }, 500);
  }

  setStep(i: number) {
    if (i >= 2) {
      this.onSelectType(this.frmBooking.get('bookingType').value);
      this.validateAllFormFields(this.frmBooking, ['bookingUser', 'phoneNumber']);
      this.frmBooking.controls['bookingUser'].patchValue(this.frmBooking.value.bookingUser.trim())
      if (this.frmBooking.controls.bookingUser.invalid || this.frmBooking.controls.phoneNumber.invalid) { return; }
    }

    if (i >= 3) {
      this.validateAllFormFields(this.frmBooking, ['reason', 'birthYear']);
      if (this.frmBooking.controls.reason.invalid || this.frmBooking.controls.birthYear.invalid || this.frmBooking.controls.email.invalid) { return; }

      if (this.frmBooking.get('bookingType').value === 2) {
        this.validateAllFormFields(this.frmBooking, ['bookingRepresent', 'phoneRepresent']);
        if (this.frmBooking.controls.bookingRepresent.invalid || this.frmBooking.controls.phoneRepresent.invalid || this.frmBooking.controls.emailRepresent.invalid) { return; }
      }

      if (i === 3) {
        !this.frmBooking.value.provinceCodeExamination ? this.frmBooking.patchValue({ provinceCodeExamination: this.frmBooking.get('provinceCode').value }) : '';
        !this.frmBooking.value.districtCodeExamination ? this.frmBooking.patchValue({ districtCodeExamination: this.frmBooking.get('districtCode').value }) : '';
        !this._specialists.length ? this._dataService.getAll('categorycommon', 'CHUYENKHOA').subscribe(resp => this._specialists = resp.items) : '';
        !this.frmBooking.value.healthFacilitiesId ? this.getHealthfacilities() : '';
      }
      this.frmBooking.patchValue({bookingSecondUser: this.frmBooking.value.bookingSecondUser.trim(), reason: this.frmBooking.value.reason.trim(), address: this.frmBooking.value.address ? this.frmBooking.value.address.trim() : null});
    }

    if (i >= 4) {
      this.validateAllFormFields(this.frmBooking, ['provinceCodeExamination', 'districtCodeExamination', 'healthFacilitiesId']);
      if (this.frmBooking.controls.provinceCodeExamination.invalid || this.frmBooking.controls.districtCodeExamination.invalid || this.frmBooking.controls.healthFacilitiesId.invalid) { return; }

      if(i === 4){
        !this._doctor ? this._dataService.get('doctors', this._healthfacility.healthFacilitiesId.toString(), '', 0, 0).subscribe(resp => this._doctors = resp.items) : '';
      }
    }

    if (i >= 5) { 
      if (this.frmBooking.controls.examinationDate.invalid) { return; }
    }

    this._currentStep = i;
  }

  validateAllFormFields(formGroup: FormGroup, fields: Array<string>) {
    if (fields.length === 0) { return; }
    Object.keys(formGroup.controls).forEach(field => {
      if (fields.indexOf(field) < 0) { return; }
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched();
        control.markAsDirty();
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control, fields);
      }
    });
  }

  onSelectType(num: number) {
    const u = _.trim(this.frmBooking.get('bookingUser').value);
    const p = _.trim(this.frmBooking.get('phoneNumber').value);
    if (num === 2) {
      if(!this.frmBooking.controls['bookingRepresent'].value) this.frmBooking.patchValue({ bookingRepresent: u, phoneRepresent: p, bookingSecondUser: null, phoneSecondNumber: null });
    } else {
      this.frmBooking.patchValue({ bookingSecondUser: u, phoneSecondNumber: p, bookingRepresent: null, phoneRepresent: null });
    }
  }

  onSelectProvince(obj: any) {
    this._districts = this._districtsExamination = []; 
    this.frmBooking.patchValue({ districtCode: null, provinceCodeExamination: null, districtCodeExamination: null });
    const province = this._provinces.find((o: { provinceCode: string, name: string; }) => o.provinceCode === obj);
    if (province) { this._dataService.get('districts', JSON.stringify({ ProvinceCode: province.provinceCode }), '', 0, 0).subscribe(resp => this._districts = resp.items); }
  }

  onSelectExaminationProvince(obj: any) {
    this._districtsExamination = [];
    this.frmBooking.patchValue({ districtCodeExamination: null, healthFacilitiesId: null });
    const province = this._provincesExamination.find((o: { provinceCode: string, name: string; }) => o.provinceCode === obj);
    if (province) { this._dataService.get('districts', JSON.stringify({ ProvinceCode: province.provinceCode }), '', 0, 0).subscribe(resp => this._districtsExamination = resp.items); }
  }

  onSelectDistrict(){
    this.frmBooking.patchValue({ districtCodeExamination: null });
  }

  onSelectHealthFacilities(obj: any){
    this.onClickHealthFacilities();
    this._healthfacility = this._healthfacilities.find(o => o.healthFacilitiesId == obj);
  }

  onClickDoctor(doctor: any){
    this.isDoctor = 1;    
    this._doctor = doctor;
    this._lstWorkingTimes = [];
    this._specialist = this._doctor.specialist.map(e => e.specialist).join(","); 
    this.frmBooking.controls['doctorId'].patchValue(this._doctor.doctorId);
    this.frmBooking.controls.examinationDate.setErrors({required: true});
    
    this._dataService.get('workingtime', this._doctor.doctorId, '', 0, 0).subscribe(resp => {
      this._workingTimes = resp.items

      for (let i = 0; i < 7; i++) {
        var date = new Date();
        var workingTime = [];
        date.setDate(date.getDate() + i);
  
        this._workingTimes.forEach(el => {
          if(moment(date).format("DD/MM/YYYY") == moment(el.calendarDate).format("DD/MM/YYYY")){
            workingTime.push({
              hoursStart: el.hoursStart,
              minuteStart: el.minuteStart,
              timeSlotId: el.timeSlotId
            })
          }
        });
  
        this._lstWorkingTimes.push({
          dayWeek: this.getDayOfWeek(date.getDay()),
          dayMonth: ' (' + date.getDate() + '/' + (date.getMonth() + 1) + ')',
          date: date,
          workingTime: _.orderBy(workingTime, ['hoursStart'], ['asc']) 
        });
      }
    });
  }

  onClickHealthFacilities(){
    this._lstWorkingTimes = [];
    this._doctor = null;
    this.getDate();
    this.isDoctor = 0;
    this.type = -1;
    this.frmBooking.patchValue({examinationWorkingTime: null, examinationTime: null, timeSlotId: null, doctorId: null});
    this.frmBooking.controls.examinationDate.setErrors({required: true});
  }

  onClickWorkingTime(time: any, value: any, type: number, index: number){
    this.frmBooking.patchValue({examinationDate: time.date, examinationWorkingTime: null, examinationTime: null, timeSlotId: null, doctorId: null});
    this.type = -1;
    this.isClicked = index;

    if(type == 0){
      this.type = value;
      this.dateExamination = (value == 1 ? 'Sáng (8:00 - 12:00) ngày ' : (value == 2 ? 'Chiều (12:00 - 17:00) ngày ' : 'Tối (17:00 - 21:00) ngày '))  + moment(time.date).format("DD/MM/YYYY") + ' (Quý khách vui lòng đến sớm hơn 10 phút để chúng tôi phục vụ tốt nhất)'
      this.frmBooking.patchValue({examinationWorkingTime: value, examinationTime: null, timeSlotId: null});
    } else{
      this.type = value.hoursStart;
      this.dateExamination = (value.hoursStart + ':' + value.minuteStart) + ' ngày ' + moment(time.date).format("DD/MM/YYYY") + ' (Quý khách vui lòng đến sớm hơn 10 phút để chúng tôi phục vụ tốt nhất)'
      this.frmBooking.patchValue({examinationWorkingTime: null, examinationTime: (value.hoursStart + ':' + value.minuteStart), timeSlotId: value.timeSlotId});
    }
  }
  
  getHealthfacilities() {
    this._healthfacilities = [];
    if(!this.frmBooking.controls['districtCodeExamination'].value) return;
  
    this.frmBooking.patchValue({ healthFacilitiesId: null });
    this._dataService.get('healthfacilitiesbooking', JSON.stringify({ 
      districtCode: this.frmBooking.controls['districtCodeExamination'].value,
      provinceCode: this.frmBooking.controls['provinceCodeExamination'].value,
      name: this.frmBooking.value.healthfacilitiesSearch ? this.frmBooking.controls['healthfacilitiesSearch'].value.trim() : '',
      specialist: this.frmBooking.controls['specialists'].value
    }), '', 0, 0).subscribe(resp => this._healthfacilities = resp.items);   
  }

  submit() {
    var ticketId = this._healthfacility.code + moment(this.frmBooking.controls['examinationDate'].value).format("DDMMYYYY") + Math.floor((Math.random() * 9000) + 1000); 
    this.frmBooking.controls['ticketId'].setValue(ticketId);
    
    if(this.frmBooking.value.bookingType == 2){
      this.frmBooking.patchValue({bookingUser: this.frmBooking.value.bookingSecondUser, phoneNumber: this.frmBooking.value.phoneSecondNumber})
    } else{
      this.frmBooking.patchValue({bookingRepresent: this.frmBooking.value.bookingUser, phoneRepresent: this.frmBooking.value.phoneNumber})
    }
    if (this.frmBooking.controls['codeCapcha'].value != this._capcha.code) { 
      this.capcha = true;
      return; 
    }

    this._dataService.create('bookinginformations', _.pickBy(this.frmBooking.value, _.identity)).subscribe(
      () => {
        this.success = 1;
      }, err => {
        this.success = -1;
      })
  }

  getDate(){
    for (let i = 0; i < 7; i++) {
      var date = new Date();
      date.setDate(date.getDate() + i);

      this._lstWorkingTimes.push({
        dayWeek: this.getDayOfWeek(date.getDay()),
        dayMonth: ' (' + date.getDate() + '/' + (date.getMonth() + 1) + ')',
        date: date,
        workingTime: []
      });
    }
  }

  getDayOfWeek(day: number): string{
    switch (day) {
      case 1: 
        return "Thứ 2";
      case 2:
        return "Thứ 3";
      case 3:
        return "Thứ 4";
      case 4:
        return "Thứ 5";
      case 5:
        return "Thứ 6";
      case 6:
        return "Thứ 7";
      case 0:
        return "Chủ nhật";
    }
  }

  getCapcha() {
    this._dataService.getAny('get-captcha-image').subscribe(res => this._capcha = { code: res.code, data: this._sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + res.data) });
  }

  rulePhoneNumber(event: any){
    const pattern = /^[0-9\+]*$/;
    const patternNum = /^[0-9]*$/; 

    if(event.target.value && event.target.value.length > 1 && !patternNum.test(event.target.value.trim().substring(1))){
      this.frmBooking.controls['phoneNumber'].setErrors({special: true});
    }

    if (!pattern.test(event.target.value)) {
      event.target.value = event.target.value.replace(/[^0-9\+]/g, "");
    }
  }

  ruleEmail(event: any){
    const pattern = /^[a-zA-Z0-9\.\-\_\@]*$/;
    if (!pattern.test(event.target.value)) {
      event.target.value = event.target.value.replace(/[^a-zA-Z0-9\.\-\_\@]/g, "");
    }
  }

  hashLength(value: any){
    if(value.length > 40){
      return value.substring(0, 40) + '...';
    }

    return value;
  }
}
