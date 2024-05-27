import { propertyType } from "../helpers/constants.js";
import { getPropertyType } from "../helpers/helpers.js";
import { compileArgs } from "./compileArgs.js";
import { compileCliString } from "./compileCliString.js";
import { compileJson } from "./compileJson.js";
/**
 * 
 * @param {import("../../main.js").Options | undefined} options 
 * @returns 
 */
export function compileRequiredProperties(options) {
    if (options?.properties == void 0) return undefined;
    const type = typeof options.properties;
    /* v8 ignore next - no need to test number and boolean property sets */
    if (type !== 'object' && type !== 'string') return undefined;

    let required = {};
    
    const cleanUp = () => {
        if (required._ == void 0) return;
        required._.forEach(prop => {
            if (required[prop] !== void 0) return;
            required[prop] = options.returnUndefinedObject ? {undefined: true} :  true 
        });
        delete required._;
    }
    const returnObject = () => Object.keys(required).length === 0 ? undefined : required;

    const opts = type === 'string' ?
                    compileCliString(options.properties, options.parseString ? ' ': ',') :
                    Array.isArray(options.properties) ?
                        options.properties.filter(x => typeof x === 'string') :
                        options.properties;
    
    required = Array.isArray(opts) ? compileArgs(opts) : opts;
    
    cleanUp();
    return returnObject();
}

function fromString(str, delegate) {
    let arr = compileCliString(str, ",");
    let test = fromArray(arr, delegate, true);
    if (test != void 0) return test;
    arr = compileJson(str);
    return delegate(arr);
}

function fromArray(arr, delegate, stop) {
    /* v8 ignore next - this should never be true */
    if (!Array.isArray(arr)) return delegate();
    let test = delegate(compileArgs(arr.map(makeProperty)));
    if (test != void 0 || stop) return test;
    return delegate(compileJson(arr.join(',')));
}

function makeProperty(str) {
    const type = getPropertyType(str);
    return type === propertyType.None ? '--' + str : str;
}

/**
 * 
 * @param {import("../../main.js").Options|string[]|string} [options] 
 */
export function compileOptions(options) {
    if (options == void 0) return undefined;

    if (typeof options === 'string') {
        return fromString(options, compileOptions);
    }

    /* v8 ignore next - not testing numbers and booleans etc */
    if (typeof options !== 'object') return undefined;

    if (Array.isArray(options))  {
        options = fromArray(options, compileOptions);
        if (options == void 0) return undefined;
    } 

    options = filterOptionKeys(options);
    if (options.map != void 0) {
        options.map = buildMap(options.map);
        if (options.map == void 0) delete options.map;
    }
    if (options.properties != void 0) {
        options.properties = compileRequiredProperties(options);
        if (options.properties == void 0) delete options.properties;
    }
    
    return Object.keys(options).length > 0 ? options : undefined;
}

function filterOptionKeys(options) {
    const removeKeys = Object.keys(options).filter(k => {
        if (typeof options[k] === 'boolean' && 
                (
                    k === 'parseString' ||
                    k === 'returnUndefinedObject' ||
                    k === 'strict' ||
                    k === 'ignoreCase' ||
                    k === 'ignoreDuplicates' ||
                    k === 'duplicateOverride' ||
                    k === 'ignoreBoolDuplicates'
                )
        ) return false;
        return k !== 'properties' && k !== 'map';
    })
    removeKeys.forEach(k => delete options[k]);
    return options;
}

/**
 * 
 * @param {string|string[]|{}} map 
 */
export function buildMap(map) {
    if (map == void 0) return undefined;
    if (typeof map === 'string') return fromString(map, buildMap);
    
    /* v8 ignore next - not testing number and booleans as map functions */
    if (typeof map !== 'object') return undefined;

    let result = Array.isArray(map) ?
                    compileArgs(map.map(makeProperty)) :
                    map;

    for(let key in result) {
        if (key === "_" || typeof result[key] !== "string") {
            delete result[key];
        }
    }
    if (Object.keys(result).length > 0) return result;
    if (!Array.isArray(map)) return undefined;
    return buildMap(compileJson(map.join(',')));
}
