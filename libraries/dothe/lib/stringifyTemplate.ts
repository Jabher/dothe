import {zip} from "ramda";

export function stringifyTemplate(_strings: string | TemplateStringsArray, ...substitutions: string[]) {
    if (typeof _strings === 'string') {
        return [_strings, ...substitutions].join(' ')
    }
    const strings = Array.from(_strings);
    return strings.shift() + zip(strings, substitutions).map(([string, substitution]) => `${substitution}${string}`).join('')
}
