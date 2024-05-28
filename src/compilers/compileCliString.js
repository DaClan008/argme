import { escapeHandling } from "../helpers/helpers.js";
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
    splitChar ??= ' ';
    // let txtCounter = 0;
    const escapes = ['"', "'", "\\"];
    escapes.push(splitChar);

    const prop = new StringParams();
    let quote = undefined;
    let quoteIndex = -1;
    let valStarted = -1;

    const add = (val) => {
        result.push(val);
        prop.reset();
        valStarted = -1;
    }

    const removeQuotes = (idx) =>{
        if (quoteIndex < 0 || valStarted === 0) {
            quoteIndex = -1;
            quote = undefined;
            return idx;
        }
        str = str.substring(0, quoteIndex) + str.substring(quoteIndex +1);
        idx--;
        str = str.substring(0, idx) + str.substring(idx + 1);
        idx--;
        quoteIndex = -1;
        quote = undefined;
        return idx;
    }

    for(let i = 0; i<str.length; i++) {
        const char = str[i];      

        if (char === '"' || char === "'") {
            if (quote === char) {
                i = removeQuotes(i);
                continue;
            }
            if (quote != void 0) continue;
            quote = char;
            quoteIndex = i;
            if (prop.State === states.NotStarted) prop.Start = i;
            continue;
        }
        if (quote != void 0) continue;

        if (char === '\\') {
            str = escapeHandling(str, i, escapes);
            if (str[i] !== '\\' && prop.State === states.NotStarted) prop.Start = i;
            continue;
        }

        if (char === splitChar) {
            if (prop.State !== states.Started) continue;
            prop.End = i-1;
            add(prop.parse(str, true));
            continue;
        }
        if (char === ' ') continue;
        if ((char === '=' || char === ':') && valStarted < 0) valStarted = 0;
        else if (valStarted > -1) valStarted++;
        if (prop.State === states.Started) continue;
        prop.Start = i;
    }
    if (prop.State !== states.Started) return result;

    prop.End = str.length
    add(prop.parse(str, true));

    return result;
}