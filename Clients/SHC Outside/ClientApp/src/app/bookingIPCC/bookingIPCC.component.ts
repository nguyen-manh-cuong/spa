import * as _ from 'lodash';
import * as moment from 'moment';
import swal from 'sweetalert2';

import { Component, Injector, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ValidationRule } from '@shared/common/common';
import { AppComponentBase } from '@shared/app-component-base';
import { DataService } from '@shared/service-proxies/service-data';
import {IMyDpOptions} from 'mydatepicker';
import { IHealthfacilities } from '@shared/Interfaces';
import { Location } from '@angular/common'



@Component({
  selector: 'app-booking-ipcc',
  templateUrl: './bookingIPCC.component.html',
  styleUrls: ['./bookingIPCC.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class BookingIPCCComponent extends AppComponentBase implements OnInit {
  validateRule = new ValidationRule();
   
  public _currentStep: number = 1;
  public frmBooking: FormGroup;

  public _relationship: Array<{ id: number, name: string }> = [{ id: 1, name: 'Vợ/Chồng' }, { id: 2, name: 'Bố/Mẹ' }, { id: 3, name: 'Anh/Chị' }, { id: 4, name: 'Con' }];
  public _gender: Array<{ id: number, name: string }> = [{ id: 1, name: 'Nam' }, { id: 2, name: 'Nữ' }, { id: 3, name: 'Không xác định' }];
  public _dates = _.range(1, 32);
  public _months = _.range(1, 13);
  public _years = _.range(moment().year() - 100, moment().year() + 1);

  public _provinces = [];
  public _districts = [];
  public _provincesExamination = [];
  public _districtsExamination = [];
  public _specialists = [];
  public _healthfacilities = [];
  public _healthfacility: IHealthfacilities;
  public _doctors = [];

  public myDatePickerOptions: IMyDpOptions = {
    dateFormat: 'dd/mm/yyyy',
    disableUntil: {year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() - 1},
  };

  type: any;
  
  @ViewChild("examinationDate") examinationDate;

  constructor(injector: Injector, private _dataService: DataService, private _formBuilder: FormBuilder, private _location: Location) {
    super(injector);
  }

  ngOnInit() {
    this.frmBooking = this._formBuilder.group({
      //1
      bookingUser: ['', [Validators.required, this.validateRule.hasValue]], phoneNumber: ['', [Validators.required, this.validateRule.hasValue, this.validateRule.topPhoneNumber]],
      //2 
      bookingRepresent: ['', [Validators.required, this.validateRule.hasValue]], phoneRepresent: ['', [Validators.required, this.validateRule.hasValue, this.validateRule.topPhoneNumber]], emailRepresent: [, [this.validateRule.email]],       
      bookingType: [1], email: [, [this.validateRule.email]], relationshipId: [1, Validators.required],
      gender: [1], birthDay: [], birthMonth: [], birthYear: [, Validators.required], address: [],
      provinceCode: [], districtCode: [], reason: ['', [Validators.required, this.validateRule.hasValue]],
      //3
      provinceCodeExamination: [, Validators.required], districtCodeExamination: [, Validators.required],
      specialists: [], healthFacilitiesId: [, Validators.required],
      //4
      examinationDate: [, [Validators.required, this.validateRule.dateInvalid]], examinationTime: [, Validators.required], doctorId: [], ticketId: []
    });

    this._dataService.getAll('provinces').subscribe(resp => this._provinces = this._provincesExamination = resp.items);
    this._dataService.getAll('categorycommon', 'CHUYENKHOA').subscribe(resp => this._specialists = resp.items);

    setTimeout(() => {
      this._dataService
      .get('config', JSON.stringify(['A05.DefaultProvince', 'A05.DefaultDistrict']), '', 0, 0)
      .subscribe(resp => {      
        var provinceCode = resp.items.filter(el => el.code == 'A05.DefaultProvince');
        var districtCode = resp.items.filter(el => el.code == 'A05.DefaultDistrict');
        this.onSelectProvince(provinceCode[0].values);
        this.onSelectExaminationProvince(provinceCode[0].values);

        this.frmBooking.controls['provinceCode'].setValue(provinceCode[0].values);
        this.frmBooking.controls['districtCode'].setValue(districtCode[0].values);

        this.frmBooking.controls['provinceCodeExamination'].setValue(provinceCode[0].values);
        this.frmBooking.controls['districtCodeExamination'].setValue(districtCode[0].values);
      });
    }, 1000);
    abp.ui.setBusy();
  }

  onSelectProvince(obj: any) {
    this._districts = [];
    this.frmBooking.patchValue({ districtCode: null });
    if(!this.frmBooking.controls['provinceCode'].value) return;

    const province = this._provinces.find((o: { provinceCode: string, name: string; }) => o.provinceCode === obj);
    if (province) { this._dataService.get('districts', JSON.stringify({ ProvinceCode: province.provinceCode }), '', 0, 0).subscribe(resp => this._districts = resp.items); }
  }

  onSelectExaminationProvince(obj: any) {
    this._districtsExamination = [];
    this.frmBooking.patchValue({ districtCodeExamination: null, healthFacilitiesId: null, doctorId: null });
    if(!this.frmBooking.controls['provinceCodeExamination'].value) return;

    const province = this._provincesExamination.find((o: { provinceCode: string, name: string; }) => o.provinceCode === obj);
    if (province) { this._dataService.get('districts', JSON.stringify({ ProvinceCode: province.provinceCode }), '', 0, 0).subscribe(resp => this._districtsExamination = resp.items); }
  }

  getHealthfacilities() {
    this._healthfacilities = [];   
    this.frmBooking.patchValue({ healthFacilitiesId: null, doctorId: null });
    if(!this.frmBooking.controls['districtCodeExamination'].value) return;

    this._dataService.get('healthfacilitiesbooking', JSON.stringify({ 
      districtCode: this.frmBooking.controls['districtCodeExamination'].value,
      provinceCode: this.frmBooking.controls['provinceCodeExamination'].value,
      name: null,
      specialist: this.frmBooking.controls['specialists'].value
    }), '', 0, 0).subscribe(resp => this._healthfacilities = resp.items);   
  }

  onSelectHealthFacilities(obj: any){
    this._doctors = [];
    this.frmBooking.patchValue({ doctorId: null });
    this._healthfacility = this._healthfacilities.find(o => o.healthFacilitiesId == obj);
    this._dataService.get('doctors', this._healthfacility.healthFacilitiesId.toString(), '', 0, 0).subscribe(resp => this._doctors = resp.items);
  }

  submit() {   
    var controls = this.frmBooking.controls['bookingType'].value == 1 ? ['bookingUser', 'phoneNumber', 'reason', 'birthYear', 'provinceCodeExamination', 'districtCodeExamination', 'healthFacilitiesId', 'examinationDate', 'examinationTime', 'email'] : ['bookingUser', 'phoneNumber', 'bookingRepresent', 'phoneRepresent', 'reason', 'birthYear', 'provinceCodeExamination', 'districtCodeExamination', 'healthFacilitiesId', 'examinationDate', 'examinationTime', 'email'];
    this.frmBooking.patchValue({bookingUser: this.frmBooking.value.bookingUser.trim(), reason: this.frmBooking.value.reason.trim(), address: this.frmBooking.value.address ? this.frmBooking.value.address.trim() : null, examinationDate: this.examinationDate.nativeElement.value ? this.examinationDate.nativeElement.value : null});

    if(this.checkBirthDate()) return;

    if(this.frmBooking.controls['bookingType'].value == 2){
      this.frmBooking.patchValue({bookingRepresent: this.frmBooking.value.bookingRepresent.trim(), phoneRepresent: this.frmBooking.value.phoneRepresent.trim()});
    }

    if (this.frmBooking.invalid) {
      this.validateAllFormFields(this.frmBooking, controls);
      var check = 0;
      controls.forEach(el => {
        if(this.frmBooking.controls[el].invalid){
          check = 1;
        }
      });

      if(check == 1)  return;
    }
    
    var fromData = this.frmBooking.value;
    var examinationTime = fromData.examinationTime.substring(0, 2) + ':' + this.frmBooking.controls['examinationTime'].value.substring(2, 4);
    var ticketId = this._healthfacility.code + moment(this.frmBooking.controls['examinationDate'].value.jsdate).format("DDMMYYYY") + Math.floor((Math.random() * 9000) + 1000);
    
    fromData.ticketId = ticketId;
    fromData.examinationTime = examinationTime;
    fromData.examinationDate = moment(fromData.examinationDate, 'DD/MM/YYYY').toDate();
    
    this._dataService.create('bookinginformations', _.pickBy(fromData, _.identity)).subscribe(
      () => {
        this._dataService.create('infosms', {
            lstMedicalHealthcareHistories: [{phoneNumber: fromData.phoneNumber}], 
            healthFacilitiesId: this.frmBooking.value.healthFacilitiesId,           
            smsTemplateId: null,
            type: 4, 
            content: ''                                                                                                                       
        })
        .subscribe(resp => {}, err => {});

        swal({
          title: 'Đặt khám thành công!',
          type: 'success',
          confirmButtonClass: 'mat-raised-button mat-primary bg-danger',
          confirmButtonText: 'OK',
        }).then(() => {
          this._location.back();
        });
      }, err => {})
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

  onKeyupDate(date: any){
    if(date && !moment(date, 'DD/MM/YYYY').isValid){
      this.frmBooking.controls['examinationDate'].setErrors({special: true});      
    } else{
      if(moment(date + '23:59:59', 'DD/MM/YYYY hh:mm:ss').toDate() < new Date()){
        this.frmBooking.controls['examinationDate'].setErrors({compareDate: true});
      } else{
        this.frmBooking.patchValue({examinationDate: this.examinationDate.nativeElement.value});
      }
    }
    this.validateAllFormFields(this.frmBooking, ['examinationDate']);
  }

  onDateChanged(value: any) {
    if(value.jsdate){
      this.frmBooking.controls['examinationDate'].setErrors(null);
    } else{
      this.frmBooking.controls['examinationDate'].setErrors({required: true});
    }
  }

  onSelectBirthDay(obj: any){
    this.checkBirthDate();
  }

  onSelectBirthMonth(obj: any){
    this.checkBirthDate();
  }

  onSelectBirthYear(obj: any){
    this.checkBirthDate();
  }

  checkBirthDate(){
    if(this.frmBooking.controls.birthDay.value && this.frmBooking.controls.birthMonth.value){
      if(!moment(this.frmBooking.controls.birthDay.value + "/" + this.frmBooking.controls.birthMonth.value + "/" + this.frmBooking.controls.birthYear.value, "DD/MM/YYYY").isValid()){
        this.frmBooking.controls.birthYear.setErrors({birthYear : true});
        return false;
      }
    }

    this.frmBooking.controls.birthYear.value ? this.frmBooking.controls.birthYear.setErrors(null) : this.frmBooking.controls.birthYear.setErrors({required : true});
    return false;
  }

  rulePhoneNumber(event: any){
    const patternNum = /^[0-9]*$/; 

    if(event.target.value && event.target.value.length > 1 && !patternNum.test(event.target.value.trim().substring(1))){
      this.frmBooking.controls['phoneNumber'].setErrors({special: true});
    }
  }

  ruleEmail(event: any){
    const pattern = /^[a-zA-Z0-9\.\-\_\@]*$/;
    if (!pattern.test(event.target.value)) {
      event.target.value = event.target.value.replace(/[^a-zA-Z0-9\.\-\_\@]/g, "");
    }
  }
}
