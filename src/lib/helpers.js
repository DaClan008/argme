import { states } from "./constants.js";
import { StringParams } from "./stringParamsObject.js";

export function isString(val) {
    return typeof val === 'string' && isNaN(val) && !/^(true|false)$/i.test(val);
}

export function sanitizeValue(val) {
    if (typeof val !== 'string') return val;
    if(isString(val)) return /^['"].*['"]$/.test(val) ? val.substring(1, val.length -1) : val;
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


export function buildCliString(str) {
    const result = [];
    let txtCounter = 0;
    const prop = new StringParams();
    let quote = undefined;
    let quoteIndex = -1;

    const add = (val) => {
        result.push(val);
        prop.reset();
    }

    const removeQuotes = (idx) =>{
        if (quoteIndex < 1) return idx;
        str = str.substring(0, quoteIndex) + str.substring(quoteIndex +1);
        idx--;
        str = str.substring(0, idx) + str.substring(idx + 1);
        idx--;
        quoteIndex = -1;
        return idx;
    }

    for(let i = 0; i<str.length; i++) {
        const char = str[i];      

        if (char === '"' || char === "'") {
            if (quote === char) {
                i = removeQuotes(i);
                quote = undefined;
                txtCounter++;
                continue;
            }
            if (quote != void 0) continue;
            quote = char;
            if (prop.State === states.NotStarted) prop.Start = i;
            if (txtCounter > 0) quoteIndex = i;
            txtCounter++;
            continue;
        }
        if (quote != void 0) continue;

        if (char === ' ') {
            txtCounter = 0;
            if (prop.State !== states.Started) continue;
            prop.End = i-1;
            add(prop.parse(str));
            continue;
        }
        if (prop.State !== states.Started) prop.Start = i;
        txtCounter = char === '=' ? 0 : txtCounter + 1;
    }

    if (prop.State !== states.Started) return result;

    prop.End = str.length
    add(prop.parse(str));

    return result;
}