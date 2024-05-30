import { propertyType } from "./constants.js";
/**
 * Determine if a string is a number or boolean value.
 * @param {string} val The string value to evaluate.
 * @returns {boolean}
 */
export function isString(val) {
    if (val === '') return true;
    return typeof val === 'string' && isNaN(val) && val.toLowerCase() !== 'true' && val.toLowerCase() !== 'false';
}
/**
 * Sanitize a Value.  Turn 'true' into true and '123' into 123.
 * @param {string} val The string that needs to be sanitized.
 * @returns {string}
 */
export function sanitizeValue(val) {
    /* v8 ignore next - no need to test evaluation */
    if (typeof val !== 'string') return val;
    if(isString(val)) return encapsulate(val, '"', "'") ? val.substring(1, val.length -1) : val;
    return isNaN(val) ? val.toLowerCase() === 'true' : parseFloat(val);
}
/**
 * finding the next occurence of a ,
 * @param {string} val the string value to addd
 * @param {number} idx the index to start from
 * @returns {number} the index of the next property start indicator
 */
export function findNextProperty(val, idx) {
    for (let i = idx; i < val.length; i++) {
        if (val[i] === ',') return i;
    }
    return idx;
}
/**
 * Compile a return object for the Json and Array compile functions.
 * This is used when there is an array or a json string within another array or json object.
 * @param {boolean} state set whether a return object should be returned or just the result on its own. 
 * @param {object} result the result to return.
 * @param {string} val the current value string that compiled the property.
 * @param {number} idx the current index.
 * @returns {object} either a result object or the result only.
 */
export function getReturnObject(state, result, val, idx) {
    if (!state) return result;
    return {
        result,
        remainder: val.substring(idx + 1)
    }
}
/**
 * Deal with the Escape char in a string.
 * @param {string} str The String value containing an escape char (\).
 * @param {number} idx The index where the escape char (\) can be found.
 * @param {string[]} escapeChars The type of escapeChars.  If undefined, this will be [',",\]
 * @returns {string}
 */
export function escapeHandling(str, idx, escapeChars, currentQuote) {
    /* v8 ignore next - should not enter this branch */
    if (str[idx] !== '\\') return  str;

    escapeChars ??= ['"', "'", "\\"];

    const next = str.length > idx + 1 ? str[idx + 1] : undefined;
    if (next == void 0 || escapeChars.indexOf(next) < 0)
         return str;
    
    let count = 1;
    if (currentQuote != void 0) {
        // we are dealing with cliCompilation
        /* v8 ignore next 2 - no need to test the undefined options */
        const after = str.length > idx + 2 ? str[idx + 2] : undefined;
        const prev = idx > 0 ? str[idx-1] : undefined;
        if (currentQuote === next && currentQuote === after) count = prev !== ' ' ? 1 : 2;
    }

    // we have \\ or \" or \'    
    str = str.substring(0, idx) + str.substring(idx + count);

    return str;
}
/**
 * Determine the propertyType (constants.propertyType) of a string value.
 * @param {string} value The string value to get the type from.
 * @returns {propertyType.FullProperty | propertyType.ShortProperty | propertyType.JsonObject | propertyType.Array | propertyType.None | propertyType.Undefined} 
 */
export function getPropertyType (value) {
    /* v8 ignore next - this line should never be hit */
    if (value == void 0 || value === '') return propertyType.Undefined;

    if (value[0] === '-') return value[1] === '-' ? propertyType.FullProperty : 
                                                    propertyType.ShortProperty;
    if (value[0] === '~') return value[1] === '~' ? propertyType.JsonObject : propertyType.Array;

    return propertyType.None;
}
/**
 * Confirm wether a string value is completely encapsulated within 2 other characters.
 * @param {*} value The string value to confirm against.
 * @param  {...(string|string[])} args If a string value is supplied, the string value will be a the first and last characters.  Else
 * an array can be supplied with the first string value representing the start value, and second value the endValue.
 * @returns {boolean} True if the any character argument set encapsulates the string value, else false.
 */
export function encapsulate(value, ...args) {
    /* v8 ignore next - no need to test any of these as it is logical conclusion */
    if (args == void 0 || value == void 0 || value.trim().length <= 1 ||  args.length === 0) return false;
    const vLength = value.length;
    
    for (let i = 0; i < args.length; i++) {
        const isArr = Array.isArray(args[i]);
        /* v8 ignore next 2 - no need to test array of objects here */
        const start = isArr ? args[i][0] : args[i];
        const end = isArr && args[i].length > 1 ? args[i][1] : start;
        
        if (vLength < start.length + end.length || value[0] !== start || value[vLength - 1] !== end) continue;
        return true;
    }
    return false;
}
export function filterQuote(txt, idx, quote, escapes, includeQuote, ignore) {
    const result = {
        start:txt.length,
        end: txt.length,
        txt,
        idx: idx + 1
    };
    for(; result.idx < result.txt.length; result.idx++) {
        if (!ignore && result.txt[result.idx] === '\\') {
            result.txt = escapeHandling(txt, result.idx, escapes, includeQuote ? quote : undefined);
            result.end = result.txt.length;
            continue;
        }
        if (result.txt[result.idx] === quote) return result;
    }
    result.idx = idx;
    return result;
}