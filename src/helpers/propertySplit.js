import { propertyType } from "./constants.js";
import { encapsulate, escapeHandling, filterQuote, sanitizeValue } from "./helpers.js";

/**
 * Split a string into a property component and a value component.
 * @param {string} arg The full argument value (i.e. --prop=value).
 * @param {propertyType} type The propertyType of the argument. (constants.propertyType)
 * @returns {{prop: string, value: string}[]}
 */
export function propertySplit(arg, type) {
    const result = [];
    /* v8 ignore next - propertyType.None should not happen, but just in case. */
    const start = type === propertyType.None ? 0 : type === propertyType.FullProperty || type === propertyType.JsonObject ? 2 : 1;
    let i = start;
    let equalIndex = -1;

    for (;i < arg.length; i++) {
        const char = arg[i];

        if(char === '\\') {
            arg = escapeHandling(arg, i, ['"', "'", "\\", ":", "="]);
            continue;
        }

        if(type === propertyType.ShortProperty && (char === '"' || char === "'")) {
            const tmpI = filterQuote(arg, i, char);
            if (tmpI === i || i === arg.length -1) return shortPropReturn(result, arg, i);
            result.push({prop: arg.substring(i + 1, tmpI), value: true});
            i = tmpI;
            continue;
        }
                
        if (char === '=') {
            equalIndex = i;
            break;
        }
        if (char === ':' && type === propertyType.JsonObject) {
            equalIndex = i;
            break;
        }
        
        if (type !== propertyType.ShortProperty) continue;

        if (char === '-' || char === '_') continue;

        if (i > 1 && !isNaN(arg.substring(i))) {
            const val = parseFloat(arg.substring(i));
            for(let x = 0; x < result.length; x++) {
                result[x].value = val;
            }
            return result;
        }
        result.push({prop: char, value: true});
    }
   
    if (equalIndex < 0 && type === propertyType.ShortProperty) return result;

    const startEnd = equalIndex < 0 ? undefined : equalIndex;
    let prop = type === propertyType.ShortProperty ?
                result.reduce((prev, x) => prev + x.prop, '') :
                arg.substring(start, startEnd);
    result.splice(0);

    if (encapsulate(prop, "'", '"')) prop = prop.substring(1, prop.length - 1);
    if (prop === '_') return [];
    
    const value = arg.substring(equalIndex + 1);

    result.push({
        prop,
        value: equalIndex < 0 ? true : (type === propertyType.Array ? value : sanitizeValue(value))
    });

    return result;
}
/**
 * Get the result of a short property type that has an open ended quote value.
 * @param {{prop:string, value: string}[]} result The current result item
 * @param {string} arg The current text argument that contains the open ended quote.
 * @param {number} quoteIndex The index where the quote starts from
 * @returns {{prop:string, value: string}[]}
 */
function shortPropReturn(result, arg, quoteIndex) {
    if (quoteIndex < 0) return result;
    
    const tmp = propertySplit(arg.substring(quoteIndex), propertyType.ShortProperty);
    if (tmp.length === 0) return result;
    
    result.push(...tmp);
    if (tmp.length > 1 || tmp[0].value === true) return result;
            
    return [result.reduce((prev, current) => {
        prev.prop += current.prop;
        return prev;
    },{prop: '', value: tmp[0].value})];
}