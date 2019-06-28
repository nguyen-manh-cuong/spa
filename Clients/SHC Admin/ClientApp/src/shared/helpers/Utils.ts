import * as _ from 'lodash';

export function cleanUnicode(str: string): string {
    return str
        .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
        .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
        .replace(/ì|í|ị|ỉ|ĩ/g, 'i')
        .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
        .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
        .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
        .replace(/đ/g, 'd')
        .replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A")
        .replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E")
        .replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I")
        .replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O")
        .replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U")
        .replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y")
        .replace(/Đ/g, "D");
}

export function cleanSpecial(str:string):string{
    return str
        .replace(/!|@|\$|%|\^|\\|\;|\}|\{|\_|\-|\"|\'|\||\`|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\"|\"|\&|\#|\[|\]|~/g, '')
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

export function getPermission(items: any, router: string): object {
    var route = router.split("/");
    var check: boolean = false;
    var permission = {
        add: false,
        delete: false,
        edit: false,
        view: false
    }
    route.splice(-1, 1);

    if (items.length) {
        for (let i = 0; i < items.length; i++) {
            if (items[i].route === route.join("/")) {
                permission.add = items[i].add;
                permission.delete = items[i].delete;
                permission.edit = items[i].edit;
                permission.view = items[i].view;
                break;
            } else {
                var child = items[i].items;

                if (child.length) {
                    for (let i = 0; i < child.length; i++) {
                        if (child[i].route === route.join("/")) {
                            permission.add = child[i].add;
                            permission.delete = child[i].delete;
                            permission.edit = child[i].edit;
                            permission.view = child[i].view;
                            break;
                        }
                    }
                }
            }
        }
    }

    return permission;
}

export function notifyToastr(title: string, message: string, type: string) {
    if (type === "error")
        abp.notify.error(message, title, { timeOut: 3000, preventDuplicates: true, preventOpenDuplicates: true });
    if (type === "success")
        abp.notify.success(message, title, { timeOut: 3000, preventDuplicates: true, preventOpenDuplicates: true });
    if (type === "warning")
        abp.notify.warn(message, title, { timeOut: 3000, preventDuplicates: true, preventOpenDuplicates: true });
}
