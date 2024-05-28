

import { StringParams } from '../helpers/stringParams.js';
import { encapsulate, findNextProperty, getReturnObject } from '../helpers/helpers.js';
import { propertyType as propT, states } from '../helpers/constants.js';

export function compileValue(val, type, objReturn) {
    /* v8 ignore next - we do not have to test no value returns */
    if (type !== propT.Array && type !== propT.JsonObject) return val;
    if (val == void 0 || typeof val !== 'string') return (type === propT.JsonObject || val === void 0) ? undefined : [val];
    val = val.trim();
    if (val === '') return getReturnObject(objReturn, type === propT.JsonObject ? {} : [], val, 0);

    const startBrackets = type === propT.Array ? "[" : "{";
    const closeBrackets = type === propT.Array ? "]" : "}";

    const openBracketAtStart = val[0] === startBrackets;
    const prop = new StringParams();
    const value = new StringParams();
    let quote = undefined;

    const result = type === propT.Array ? [] : {};

    const reset = () => {
        prop.reset();
        value.reset();
    }
    const add = (v, openProp) => {
        let key = type === propT.Array && v != void 0 ?  v : undefined;
        key ??= prop.parse(val, type === propT.Array);
        if (type === propT.Array) {
            if (key != void 0 || prop.State !== states.NotStarted || result.length !== 0) result.push(key || '');
            reset();
            return;
        }
        if (key != void 0 && key !== '') {
            v = v ?? value.parse(val, true) ?? (openProp ? true : '');
            result[key] = v;
        }
        reset();
    }

    for(let i = openBracketAtStart ? 1 : 0; i < val.length; i++) {
        const char = val[i];
        // skip white spaces
        if (char === ' ') continue;

        if (char === '"' || char === "'") {
            if (char === quote) {
                quote = undefined;
                continue;
            }
            if (quote != void 0) continue;
            if (prop.State === states.NotStarted) prop.Start =i;
            else if (type === propT.JsonObject && prop.State === states.Finalized && value.State === states.NotStarted) value.Start = i;
            quote = char;
            continue;
        }
        if (quote != void 0) continue;
        
        // hit next property
        if (char === ',') {
            if (prop.State === states.Started) {
                prop.End = i - 1;
                add(undefined, true);
                continue;
            }
            if (type === propT.Array) {
                add('');
                continue;
            }
            value.End = i - 1;
            add();
            continue;
        }
        if ((char === '{' || char === '[' )) {
            if (type === propT.JsonObject && (prop.State !== states.Finalized || value.State !== states.NotStarted)) continue;
            if (type === propT.Array && prop.State !== states.NotStarted) continue;
            
            const tmp = compileValue(val.substring(i), char === "{" ? propT.JsonObject : propT.Array, true);
            // prevent "next property" to be hit when finding another ,
            i = findNextProperty(val, val.length - tmp.remainder.length);
            add(tmp.result);
            continue;
        }
        if (char === closeBrackets && openBracketAtStart) { 
            let propOpen = false;
            if (prop.State === states.Started) {
                prop.End = i-1;
                propOpen = true;
            }
            else if (value.State === states.Started) value.End = i-1;
            add(undefined, propOpen);
            return getReturnObject(objReturn, result, val, i);
        }
        // hit end of property
        if (char === ':' && type === propT.JsonObject && prop.State === states.Started) {
            prop.End = i - 1;
            continue;
        }

        if (prop.State === states.NotStarted) {
            prop.Start = i;
            continue;
        }
        if (prop.State === states.Finalized && value.State === states.NotStarted) value.Start = i;
    }
    let openP = false;
    if (prop.State === states.Started) {
        prop.End = val.length - 1;
        openP = true;
    }
    if (value.State === states.Started) value.End = val.length - 1;
    
    if (prop.State !== states.NotStarted || value.State !== states.NotStarted) add(undefined, openP);
    else if (prop.State === states.NotStarted && type === propT.Array && val[val.length - 1] === ',') add('');

    return getReturnObject(objReturn, result, val, val.length -1);
}
