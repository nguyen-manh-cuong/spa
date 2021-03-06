

export interface IUser {
    id?: number;
    userId?: number;
    userName: string;
    password: string;
    fullName?: string;
    email?: string;

    provinceCode?: string;
    districtCode?: string;
    wardCode?: string;
    address?: string;
    phoneNumber?: string;

    sex?: number;
    birthDay?: Date;
    accountType?: number;

    medicalCode?: string;
    medicalCodeRelatives?: string;
    identification?: number | string;
    insurrance?: string;
    workPlace?: string;
    healthFacilitiesName?: string;
    specialist?: string;
    certificationCode?: string;
    lisenceCode?: string;

    status: number | string;
    statusSHC: number | string;
    
    groups: IGroup[];
    healthId: IHealthfacilities[];
    groupHealthFacilities: IHealthfacilities[];
}

export interface IDoctor {
    doctorId: number;
    academicId:number;
    address:string;
    birthDate:number;
    birthMonth:number;
    birthYear:number;
    certificationCode:string;
    certificationDate:Date;
    gender:number;
    titleCode:string;
    positionCode:string;
    nationCode:string;
    ethnicityCode:string;
    degreeId:number;
    email:string;
    provinceCode:string;
    districtCode:string;
    phoneNumber:string;
    educationCountryCode:string;
    priceFrom:number;
    priceTo:number;
    priceDescription:number;
    summary:string;
    fullName: string;
    avatar: string;
    academic: string;
    degree: string;
    description: string;
    allowBooking:boolean;
    allowFilter:boolean;
    allowSearch:boolean;
    specialist: IDoctorSpecialists[];
    healthFacilities: IHealthfacilitiesDoctor[];
    createUserId:number;
    updateUserId:number;
}

export interface IHealthfacilitiesDoctor {
    doctorId: string;
    healthFacilitiesId: string;
}

export interface IProvince {
    provinceCode: string;
    name: string;
}

export interface IDistrict {
    districtCode: string;
    name: string;
}

export interface IWard {
    wardCode: string;
    name: string;
}

export interface IGroup {
    id: number;
    name: string;
    description: string;

    users?: IUser[];
}

export interface IService {
    serviceName: string;
    description: string;

    users?: IUser[];
}

export interface ILanguage {
    id: number;
    key: string;
    page: string;
    vi: string;
    en: string;
}
export interface IBookingTimeslots {
    timeSlotId: number;
    hoursStart: string;
    minuteStart: string;
    hoursEnd: string;
    minuteEnd: string;
    code: string;
    name: string;
    healthFacilitiesId: number;
    isActive: boolean;
    healthFacilitiesName: string;
}

export interface IBookingInformations {
    healthFacilitiesId: number;
    doctorId: number;
    status: number;
    bookingId: number;
    ticketId: string;
    bookingUser: string;
    phoneNumber: string;
    birthDate: number;
    birthMonth: number;
    birthYear: number;
    address: string;
    provinceCodeExamination: string;
    districtCodeExamination: string;
    provinceCode: string;
    districtCode: string;
    bookingRepresent: string;
    phoneRepresent: string;
    emailRepresent: string;
    email: string;
    healthFacilitiesName: string;
    doctorName: string;
    quantity;
    quantityByGederFemale: number;
    quantityByGederMale: number;
    quantityByStatusNew: number;
    quantityByStatusPending: number;
    quantityByStatusDone: number;
    quantityByStatusCancel: number;
    examinationDate: Date;
    examinationTime: string;
    examinationWorkingTime: number;
    timeSlotId: number;
    reason: string;
    bookingTimeSlot: IBookingTimeslots;
    bookingType: number;
}

export interface IPackage {
    id: number;
    name: string;
    description: string;
    cost: number;
    quantity: number;
    isActive: number;

    details: Array<IPackageDetail>;
}

export interface IPackageDetail {
    smsFrom: number;
    smsTo: number;
    cost: number;

    index: number;
}

export interface IPachkageDistribute {
    id: number;
    smsPackage: number;
    healthFacilities: number;
    smsPackageId: number;
    healthFacilitiesId: number;
    monthStart: Number;
    monthEnd: Number;
    yearStart: Number;
    yearEnd: Number;
    status: number;
    quantity: number;
    smsPackageUsed: ISmsPackageUsed;
}

export interface ISmsPackageUsed {
    id: number;
    smsPackageId: number;
    healthFacilitiesId: number;
    quantityused: number;
    createDate: Date;
}

export interface ISmsTemplate {
    id: number,
    smsTemplateName: string;
    smsTemplateCode:string;
    messageType: number;
    smsContent: string;
    status: boolean;
    applyAllSystem: boolean;
    isDelete: boolean;
    createUser: string;
    createDate: Date;
    updateUser: string;
    updateDate: Date;
    typeNumber: string;
    organizationCode: string;
    organizationName: string;
}

export interface ICategoryCommon {
    id: number;
    name: string;
    code?: string;
    type?: string;
    isDelete?: boolean;
    createDate?: Date;

    users?: IUser[];
}

export interface IProvince {
    name: string;
    isDelete: boolean;
    isActive: boolean;
    provinceCode: string;
}

export interface IDistrict {
    districtCode: string;
    name: string;
    isDelete: boolean;
    isActive: boolean;
}

export interface IPatient {
    patientId: number;
    code: number;
    fullName: string;
    birthDate: number;
    birthMonth: number;
    birthYear: number;
    gender: number;
    identification: number;
    address: string;
    phoneNumber: number;

    healthInsuranceNumber: number;
    provinceCode: string;
    districtCode: string;
}

export interface IDoctorSpecialists {
    doctorId: string;
    specialistCode: string;
    specialist: string;
}
 
export interface IHealthfacilities {
    healthFacilitiesId: number,
    name: string,
    code: string
    address: string,
    avatar: string,
    specialistName: string,
    //totalDoctor: NgMultiLabelTemplateDirective
}
export interface ISmsLogs {
    id: number,
    message: string
}

export interface IMedicalHealthcareHistories {
    patientHistoriesId?: number,
    healthFacilitiesId?: number,
    healthInsuranceNumber?: string,
    doctorId?: number,
    patientId?: number,
    reExaminationDate?: Date,

    code?: number;
    fullName: string;
    birthDate?: number;
    birthMonth?: number;
    birthYear: number;
    gender: number;
    phoneNumber?: number;
    address?: string;
}

export interface IBookingDoctorsCalendars {
    calendarDate?: string;
    calendarId: number;
    hoursEnd: string;
    hoursStart: string;
    minuteEnd: string;
    minuteStart: string;
    status?: number;
    strCalendarDate?: string;
    timeSlotId?: number;
    address?: string;
    doctorId?: number,
    fullName: string;
    healthFacilitiesName: string;
}

export interface IBookingDoctorsCalendarsView {
    doctorId?: number,
    name: string;

    lstBookingDoctorsCalendars: Array<IBookingDoctorsCalendars>;
}

export interface IBookingDoctorsApprove {
    title?: string,
    start?: Date,
    color?: string,
    description?: string
}

// tslint:disable-next-line:no-empty-interface
export interface IAddHeadersToRequest {
}

// tslint:disable-next-line:no-empty-interface
export interface IUpstreamHeaderTransform {
}

// tslint:disable-next-line:no-empty-interface
export interface IDownstreamHeaderTransform {
}

// tslint:disable-next-line:no-empty-interface
export interface AddClaimsToRequest {
}

// tslint:disable-next-line:no-empty-interface
export interface RouteClaimsRequirement {
}

// tslint:disable-next-line:no-empty-interface
export interface AddQueriesToRequest {
}

export interface IFileCacheOptions {
    ttlSeconds: number;
    region?: any;
}

export interface IQoSOptions {
    exceptionsAllowedBeforeBreaking: number;
    durationOfBreak: number;
    timeoutValue: number;
}

export interface ILoadBalancerOptions {
    type?: any;
    key?: any;
    expiry: number;
}

export interface IRateLimitOptions {
    clientWhitelist: any[];
    enableRateLimiting: boolean;
    period?: any;
    periodTimespan: number;
    limit: number;
}

export interface IAuthenticationOptions {
    authenticationProviderKey: string;
    allowedScopes: any[];
}

export interface IHttpHandlerOptions {
    allowAutoRedirect: boolean;
    useCookieContainer: boolean;
    useTracing: boolean;
    useProxy: boolean;
}

export interface IDownstreamHostAndPort {
    host: string;
    port: number;
}

export interface ISecurityOptions {
    ipAllowedList: any[];
    ipBlockedList: any[];
}

export interface IRouter {
    serviceTitle?: string;
    display?: boolean;
    applicationName?: string;
    downstreamPathTemplate?: string;
    upstreamPathTemplate?: string;
    upstreamHttpMethod?: string[];
    addHeadersToRequest?: IAddHeadersToRequest;
    upstreamHeaderTransform?: IUpstreamHeaderTransform;
    downstreamHeaderTransform?: IDownstreamHeaderTransform;
    addClaimsToRequest?: AddClaimsToRequest;
    routeClaimsRequirement?: RouteClaimsRequirement;
    addQueriesToRequest?: AddQueriesToRequest;
    requestIdKey?: any;
    fileCacheOptions?: IFileCacheOptions;
    reRouteIsCaseSensitive?: boolean;
    serviceName?: any;
    downstreamScheme?: string;
    qoSOptions?: IQoSOptions;
    loadBalancerOptions?: ILoadBalancerOptions;
    rateLimitOptions?: IRateLimitOptions;
    authenticationOptions?: IAuthenticationOptions;
    httpHandlerOptions?: IHttpHandlerOptions;
    downstreamHostAndPorts?: IDownstreamHostAndPort[];
    upstreamHost?: any;
    key?: any;
    delegatingHandlers?: any[];
    priority?: number;
    timeout?: number;
    dangerousAcceptAnyServerCertificateValidator?: boolean;
    securityOptions?: ISecurityOptions;
    swaggerKey?: any;
}
