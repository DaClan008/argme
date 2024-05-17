import { compileArray } from "./compileArray.js";
import { StringParams } from './stringParamsObject.js';
import { findNextProperty, getReturnObject } from './helpers.js';
import { states } from './constants.js';

export function compileJson(val, original, objReturn) {
    val = val.trim();
    if (val === '') return getReturnObject(objReturn, {}, val, original, 0);
    if (/^\{.*\}$/.test(val)) return compileJson(val.substring(1, val.length - 1), val, objReturn);

    const openBracketAtStart = val[0] === '{';
    const prop = new StringParams();
    const value = new StringParams();
    let quote = undefined;

    const result = {};

    const reset = () => {
        prop.reset();
        value.reset();
    }
    const add = (key, val) => {
        if (key == void 0 || key === '') {
            reset();
            return;
        }
        val ??= '';
        if (typeof val !== 'object' && /^\[[\s\S]*\]$/.test(val)) 
            val = compileArray(val);

        result[key] = val;
        reset();
    }

    for(let i = openBracketAtStart ? 1 : 0; i < val.length; i++) {
        // skip white spaces
        if (/\s/.test(val[i])) continue;

        if ((val[i] === '"' || val[i] === "'") && prop.State === states.Finalized) {
            // we are dealing with value
            if (quote == void 0 && value.State === states.NotStarted) {
                quote = val[i];
                value.Start = i;
            }
            else if (val[i] === quote) {
                quote = undefined;
                value.End = i;
                add(prop.parse(val), value.parse(val, true));
            }
            continue;
        }
        if (quote != void 0) continue;
        
        // hit next property
        if (val[i] === ',') {
            if (prop.State === states.Started) {
                prop.End = i - 1;
                add(prop.parse(val), true);
                continue;
            }
            value.End = i - 1;
            add(prop.parse(val), value.parse(val, true));
            continue;
        }
        // hit end of property
        if (val[i] === ':' && prop.State === states.Started) {
            prop.End = i - 1;
            continue;
        }
        if ((val[i] === '{' ||val[i] === '[' )&& prop.State === states.Finalized && value.State === states.NotStarted) {
            const tmp = val[i] === '{' ? 
                        compileJson(val.substring(i), undefined, true) :
                        compileArray(val.substring(i), undefined, true);
            // prevent "next property" to be hit when finding another ,
            i = findNextProperty(val, val.length - tmp.remainder.length - tmp.difference -1);
            add(prop.parse(val), tmp.result);
            continue;
        }
        if (val[i] === '}' && openBracketAtStart) {
            if (value.State === states.Started) {
                value.End = i-1;
                add(prop.parse(val), value.parse(val, true));
            } else if (prop.State === states.Started) {
                prop.End = i-1;
                add(prop.parse(val), true);
            }
            return getReturnObject(objReturn, result, val, original, i);
            
        }

        if (prop.State === states.NotStarted) {
            prop.Start = i;
            continue;
        }
        if (prop.State === states.Finalized && value.State === states.NotStarted) {
            value.Start = i;
            continue;
        }
    }
    if (prop.State === states.Started) {
        prop.End = val.length - 1;
        add(prop.parse(val), true);
        return getReturnObject(objReturn, result, val, original, val.length -1)
    }
    if (value.State === states.Started) value.End = val.length - 1;
    
    add(prop.parse(val), value.parse(val, true));

    return getReturnObject(objReturn, result, val, original, val.length -1);
}