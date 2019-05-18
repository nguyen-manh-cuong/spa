import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'indentation' })
export class IndentationPipe implements PipeTransform {
    constructor() { }
    transform(depth: number) {
        return '&nbsp;'.repeat((depth - 1) * 5);
    }
}

@Pipe({ name: 'stringToArray' })
export class StringToArrayPipe implements PipeTransform {
    constructor() { }
    transform(str: string, separator: string = '|', skip: number) {
        const obj = str.split(separator);
        if (skip !== undefined) {
            obj.splice(skip, 1);
        }
        return obj;
    }
}
