import { escapeHandling, filterQuote } from "../helpers/helpers.js";
import { StringParams } from "../helpers/stringParams.js";
import { states } from "../helpers/constants.js";
/**
 * Deconstruct a string that would look similar to one passed into the CLI into a string array.
 * @param {string} str The string value to parse into an array.
 * @param {string} splitChar The character by which to split the string values.  By default this is set to ' '.
 * @returns {string[]}
 */
export function compileCliString(str, splitChar) {
    const result = [];
    str = str.trim();
    splitChar ??= ' ';
    // let txtCounter = 0;
    const escapes = ['"', "'", "\\"];
    escapes.push(splitChar);

    const prop = new StringParams();
    let valStarted = -1;

    const add = (val) => {
        result.push(val);
        prop.reset();
        valStarted = -1;
    }

    const removeQuotes = (startIdx, endIdx) =>{
        str = str.substring(0, startIdx) + str.substring(startIdx +1);
        endIdx--;
        str = str.substring(0, endIdx) + str.substring(endIdx + 1);
        endIdx--;
        return endIdx;
    }

    for(let i = 0; i<str.length; i++) {
        const char = str[i];      

        if (char === '\\') {
            str = escapeHandling(str, i, escapes);
            if (str[i] !== '\\' && prop.State === states.NotStarted) prop.Start = i;
            continue;
        }

        if (char === '"' || char === "'") {
            if (prop.State === states.NotStarted) prop.Start = i;
            const filter = filterQuote(str, i, char, escapes, true);
            str = filter.txt;
            const removeIdx = removeQuotes(i, filter.idx === i ? str.length : filter.idx);
            if (filter.idx === i) break; // no closing quote
            i = removeIdx;
            continue;
        }

        if (char === splitChar) {
            /* v8 ignore next - might be able to remove check later */
            if (prop.State !== states.Started) continue;
            prop.End = i-1;
            add(prop.parse(str, true));
            continue;
        }
        /* v8 ignore next - only applicable if , separation is used */
        if (char === ' ') continue;
        if ((char === '=' || char === ':') && valStarted < 0) valStarted = 0;
        else if (valStarted > -1) valStarted++;
        if (prop.State === states.Started) continue;
        prop.Start = i;
    }
    /* v8 ignore next - might be able to remove later? */
    if (prop.State !== states.Started) return result;

    prop.End = str.length - 1;
    add(prop.parse(str, true));

    return result;
}