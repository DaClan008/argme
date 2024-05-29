import { propertyType } from "./constants.js";
import { encapsulate, escapeHandling, sanitizeValue } from "./helpers.js";

/**
 * Split a string into a property component and a value component.
 * @param {string} arg The full argument value (i.e. --prop=value).
 * @param {propertyType} type The propertyType of the argument. (constants.propertyType)
 * @returns {{prop: string, value: string}[]}
 */
export function propertySplit(arg, type) {
    const result = [];

    const isFull = type === propertyType.FullProperty || type === propertyType.JsonObject;
    /* v8 ignore next - propertyType.None should not happen, but just in case. */
    const start = type === propertyType.None ? 0 : type === propertyType.FullProperty || type === propertyType.JsonObject ? 2 : 1;
    let i = start;
    let equalIndex = -1;
    let quoteIndex = -1;
    let quote = undefined;

    for (;i < arg.length; i++) {
        const char = arg[i];

        if(char === '\\') {
            arg = escapeHandling(arg, i, ['"', "'", "\\", ":", "="]);
            continue;
        }

        if(!isFull && (char === '"' || char === "'")) {
            if (quoteIndex < 0) {
                if (i === arg.length - 1) continue; // last character ignore
                quoteIndex = i;
                quote = char;
                continue;
            }
            if (char !== quote) continue;
            quote = void 0;
            result.push({prop: arg.substring(quoteIndex + 1, i), value: true});
            quoteIndex = -1;
            continue;
        }
        
        if (quote != void 0) continue;
        
        if (char === '=') {
            equalIndex = i;
            break;
        }
        if (char === ':' && type === propertyType.JsonObject) {
            equalIndex = i;
            break;
        }
        
        if (type !== propertyType.ShortProperty) continue;

        if (arg[i] === '-' || arg[i] === '_') continue;

        if (i > 1 && !isNaN(arg.substring(i))) {
            const val = parseFloat(arg.substring(i));
            for(let x = 0; x < result.length; x++) {
                result[x].value = val;
            }
            return result;
        }
        result.push({prop: arg[i], value: true});
    }
    if (quoteIndex > -1) {
        // ignore the quote ... will get here only if short prop.
        const tmp = propertySplit(arg.substring(quoteIndex), type);
        if (tmp.length === 0) return result;
        
        if (tmp.length > 1 || tmp[0].value === true) {
            result.push(...tmp);
            return result;
        }
        if (tmp[0].value !== true) {
            const tmpResult = result.reduce((prev, current) => {
                prev.prop += current.prop;
                return prev;
            },{prop: '', value: tmp[0].value});
            tmpResult.prop += tmp[0].prop;
            result.splice(0);
            result.push(tmpResult);
        }
        return result;
    }
    if (equalIndex < 0 && type === propertyType.ShortProperty) return result;

    const startEnd = equalIndex < 0 ? undefined : equalIndex;
    let prop = type === propertyType.ShortProperty ?
                result.map(x=> x.prop).join('') :
                arg.substring(start, startEnd);
    result.splice(0, result.length);

    if (encapsulate(prop, "'", '"') && type !== propertyType.Array) prop = prop.substring(1, prop.length - 1);
    if (prop === '_') return [];
    
    result.push({
        prop,
        value: equalIndex < 0 ? true : sanitizeValue(arg.substring(equalIndex + 1))
    });

    return result;
}