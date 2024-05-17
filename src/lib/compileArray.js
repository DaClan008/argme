import { StringParams} from './stringParamsObject.js';
import { states } from './constants.js';
import { findNextProperty, getReturnObject } from './helpers.js';
import { compileJson } from './compileJson.js';



export function compileArray(val, original, objReturn) {
    val = val.trim();
    if (val === '') return getReturnObject(objReturn, [], val, original, 0);
    if (/^\[.*\]$/.test(val)) return compileArray(val.substring(1, val.length - 1), val);

    const prop = new StringParams();
    const openBracketAtStart = val[0] === '[';
    const result = [];
    let quote = undefined;

    function add(val) {
        result.push(val);
        prop.reset();
    }

    for(let i = openBracketAtStart ? 1 : 0; i < val.length; i++){
        // skip spaces
        if (/\s/.test(val[i])) continue;

        if(val[i] === '"' || val[i] === "'") {
            if(prop.State === states.NotStarted) {
                quote = val[i];
                prop.Start = i;
                continue;
            }
            if (quote = val[i]) quote = undefined;
            continue;
        }
        if (quote != void 0) continue;
        if ((val[i] === '[' || val[i] === '{') && prop.State === states.NotStarted) {
            const tmp = val[i] === '[' ?
                compileArray(val.substring(i), undefined, true) :
                compileJson(val.substring(i), undefined, true);
            /* v8 ignore next - this should never really be hit at the moment (just precaution) */ 
            if (tmp.result == void 0) continue;
            // find start of next property
            i = findNextProperty(val, val.length - tmp.remainder.length - tmp.difference -1);
            add(tmp.result);
            continue;
        }
        if (val[i] === ']' && openBracketAtStart) {
            if (prop.State === states.Started) {
                prop.End = i - 1;
                add(prop.parse(val, true));
            }
            return getReturnObject(objReturn, result, val, original, i);
        }
        if (val[i] === ',') {
            if (prop.State === states.NotStarted) {
                add('');
                continue;
            }

            prop.End = i - 1;
            add(prop.parse(val, true));
            continue;
        }

        if (prop.State === states.NotStarted) prop.Start = i;
        
    }

    if (prop.State === states.Started) prop.End = val.length - 1;
    if (prop.State === states.Finalized) add(prop.parse(val, true));
    else if(val[val.length - 1] === ',') add('');

    return getReturnObject(objReturn, result, val, original, val.length - 1);
}