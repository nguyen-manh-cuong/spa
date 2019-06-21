import * as _ from 'lodash';

export function cleanUnicode(str: string): string {
    return str.toLowerCase()
        .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
        .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
        .replace(/ì|í|ị|ỉ|ĩ/g, 'i')
        .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
        .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
        .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
        .replace(/đ/g, 'd')
        .replace(/!|@|\$|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\"| |\"|\&|\#|\[|\]|~/g, ' ')
        .replace(/-+-/g, '-')
        .replace(/(\s)+/g, '$1');
}

export function titleCase(str: string): string {
    const splitStr: Array<string> = str.toLowerCase().split(' ');
    for (let i: number = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(' ');
}

export function standardized(obj: object, libs: object): object {

    if (!_.isObject(obj) || !libs || _.isEmpty(libs)) { return obj; }
    return _.mapValues(obj, (val: string, key: string) => {
        if (!libs[key]) { return val; }
        const rule: string = (_.isString(libs[key]) ? libs[key] : libs[key].type).trim().replace(/(\s)+/g, '').split(/\s*,\s*/);

        val = _.trim(val);

        if (rule.length && val.length && _.isString(val)) {
            if (rule.indexOf('decode') >= 0) { val = decodeURIComponent(val); }
            if (rule.indexOf('singleSpace') >= 0) { val = val.replace(/ {1,}/g, ' '); }
            if (rule.indexOf('noUnicode') >= 0) { val = cleanUnicode(val); }
            if (rule.indexOf('noDash') >= 0) { val = val.replace(/-/g, ' '); }
            if (rule.indexOf('lower') >= 0) { val = val.toLowerCase(); }
            if (rule.indexOf('upper') >= 0) { val = val.toUpperCase(); }
            if (rule.indexOf('camelCase') >= 0) { val = _.camelCase(val); }
            if (rule.indexOf('kebabCase') >= 0) { val = _.kebabCase(val); }
            if (rule.indexOf('snakeCase') >= 0) { val = _.snakeCase(val); }
            if (rule.indexOf('classCase') >= 0) { val = _.upperFirst(_.camelCase(val)); }
            if (rule.indexOf('capitalize') >= 0) { val = _.capitalize(val); }
            if (rule.indexOf('numberOnly') >= 0) { val = val.replace(/\D+/g, ''); }
            if (rule.indexOf('upperFirst') >= 0) { val = _.upperFirst(val); }
            if (rule.indexOf('titleCase') >= 0) { val = titleCase(val.toLowerCase()); }
            if (rule.indexOf('int') >= 0) { return parseInt(val, 0); }
            if (rule.indexOf('noSpace') >= 0) { val = val.replace(/(\s)+/g, ''); }
        }

        return val;
    });
}

export function notifyToastr(title: string, message: string, type: string) {
    if (type === "error")
        abp.notify.error(message, title, { timeOut: 3000, preventDuplicates: true, preventOpenDuplicates: true });
    if (type === "success")
        abp.notify.success(message, title, { timeOut: 3000, preventDuplicates: true, preventOpenDuplicates: true });
    if (type === "warning")
        abp.notify.warn(message, title, { timeOut: 3000, preventDuplicates: true, preventOpenDuplicates: true });
}
