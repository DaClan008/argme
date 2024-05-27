import { composer } from "../main.js";
import { compileOptions } from "../compilers/compileOptions.js";
import { propertyType } from "./constants.js";
/**
 * Determine if a string is a number or boolean value.
 * @param {string} val The string value to evaluate.
 * @returns {boolean}
 */
export function isString(val) {
    return typeof val === 'string' && isNaN(val) && !/^(true|false)$/i.test(val);
}
/**
 * Sanitize a Value.  Turn 'true' into true and '123' into 123.
 * @param {string} val The string that needs to be sanitized.
 * @returns {string}
 */
export function sanitizeValue(val) {
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
 * @param {string} originalStr the original value string that was originally used to compile the property.
 * @param {number} idx the current index.
 * @returns {object} either a result object or the result only.
 */
export function getReturnObject(state, result, val, originalStr, idx) {
    if (!state) return result;
    return {
        result,
        remainder: val.substring(idx + 1),
        difference: originalStr == void 0 ? 0 : originalStr.length - val.length
    }
}
/**
 * Deal with the Escape char in a string.
 * @param {string} str The String value containing an escape char (\).
 * @param {number} idx The index where the escape char (\) can be found.
 * @param {string[]} escapeChars The type of escapeChars.  If undefined, this will be [',",\]
 * @returns {string}
 */
export function escapeHandling(str, idx, escapeChars) {
    /* v8 ignore next - should not enter this branch */
    if (str[idx] !== '\\') return  str;

    escapeChars ??= ['"', "'", "\\"];

    const next = str.length > idx + 1 ? str[idx + 1] : undefined;
    if (next == void 0 || escapeChars.indexOf(next) < 0)
         return str;

    // we have \\ or \" or \'    
    str = str.substring(0, idx) + str.substring(idx + 1);

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
export function testResult(result) {
    if (result._ != void 0 && result._.length > 0) return result;
    const optTest = compileOptions({...result});
    if (optTest == void 0) return result;
    const resTest = composer(undefined, optTest);
    return resTest != void 0 && (resTest._?.length > 0 || Object.keys(resTest).length > 1) ?
        resTest :
        result;
}
/**
 * 
 * @param {string[] | string[][]} options 
 * @param {string} value
 */
export function encapsulate(value, ...args) {
    /* v8 ignore next - no need to test any of these as it is logical conclusion */
    if (args == void 0 || value == void 0 || value === '' ||  args.length === 0) return false;
    const vLength = value.length;
    const aLength = args.length;
    for (let i = 0; i < aLength; i++) {
        const isArr = Array.isArray(args[i]);
        /* v8 ignore next - empty strings should be ignored */
        if (args[i].length === 0) continue;
        const start = isArr ? args[i][0] : args[i];
        const end = isArr && args[i].length > 1 ?
                        args[i][1] :
                        start;

        if (vLength >= start.length + end.length && value[0] === start && value[vLength - 1] === end) return true;
    }
    return false;
}