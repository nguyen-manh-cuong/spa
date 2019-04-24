//import { NgMultiLabelTemplateDirective } from "@ng-select/ng-select/ng-select/ng-templates.directive";

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

export interface ILanguage {
    id: number;
    key: string;
    page: string;
    vi: string;
    en: string;
}

export interface IDoctor {
    doctorId: string;
    fullName: string;
    avatar: string;
    academic: string;
    degree: string;
    description: string;
    specialist: IDoctorSpecialists[];
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
