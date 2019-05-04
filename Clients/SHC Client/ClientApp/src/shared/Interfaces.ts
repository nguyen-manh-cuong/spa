import { NgMultiLabelTemplateDirective } from "@ng-select/ng-select/ng-select/ng-templates.directive";

export interface IUser {
    id?: number;
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
    identification?: number;
    insurrance?: string;
    workPlace?: string;
    healthFacilitiesName?: string;
    specialist?: string;

    groups: IGroup[];
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
export interface IUsersServices {
    id: number;
    isUsingdoctor: boolean;
    isUsingCall: boolean;
    isUsingUpload: boolean;
    isUsingRegister: boolean;
    isUsingVideo: boolean;
    isUsingExamination: boolean;
}
export interface ILanguage {
    id: number;
    key: string;
    page: string;
    vi: string;
    en: string;
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

export interface IDoctorSpecialists {
    doctorId: string;
    specialistCode: string;
    specialist: string;
}

export interface IHealthfacilitiesDoctor {
    doctorId: string;
    healthFacilitiesId: string;
}
 
export interface IHealthfacilities {
    healthFacilitiesId: number,
    name: string,
    code: string
    address: string,
    avatar: string,
    specialist: IHealthfacilitiesSpecialists[];
    totalDoctor: NgMultiLabelTemplateDirective
}

export interface IHealthfacilitiesSpecialists {
    healthFacilitiesId: number;
    specialistCode: string;
    specialist: string;
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

export interface IPatient{
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
