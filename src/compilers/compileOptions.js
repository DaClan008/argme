import { propertyType } from "../helpers/constants.js";
import { getPropertyType } from "../helpers/helpers.js";
import { compileArgs } from "./compileArgs.js";
import { compileCliString } from "./compileCliString.js";
import { compileValue } from "./compileValue.js";
/**
 * Compile an object that resemble the required properties that a argme object should contain.
 * This will only work if the "properties" value on the options object is set.
 * @param {import("../../main.js").Options} [options] The options to consider when compiling the required properties object.
 * @returns {object|undefined}
 */
export function compileRequiredProperties(options) {
    if (options?.properties == void 0) return undefined;
    const type = typeof options.properties;
    /* v8 ignore next - no need to test number and boolean property sets */
    if (type !== 'object' && type !== 'string') return undefined;

    let required = {};
    
    const returnObject = () => {
        if (required._ == void 0) return Object.keys(required).length === 0 ? undefined : required;
        required._.forEach(prop => {
            if (required[prop] !== void 0) return;
            required[prop] = options.returnUndefinedObject ? {undefined: true} :  true 
        });
        delete required._;
        return Object.keys(required).length === 0 ? undefined : required;
    }

    if (type === 'object' && !Array.isArray(options.properties)) {
        required = options.properties;
        return returnObject();
    }

    const opts = type === 'string' ?
                    compileCliString(options.properties, options.parseString ? ' ': ',') :
                    options.properties.filter(x => typeof x === 'string');
    
    required = compileArgs(opts);
    
    return returnObject();
}

/**
 * Compile an options object.
 * @param {import("../../main.js").Options|string[]|string} [options] The options to parse through and ensure it is proper options object.
 * @returns {import("../main.js").Options|undefined} Undefined will be returned if the supplied variables does not resemble a proper Options object.
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

/**
 * Converts a the supplied variable into a proper map Object
 * @param {string|string[]|{}} [map] The map item to compile.
 * @returns {{[charKey:string]:string} | undefined} 
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
    return buildMap(compileValue(map.join(','), propertyType.JsonObject));
}

/**
 * Filter through an Options object and remove properties that does not correspond to an Options object.
 * @param {import("../main.js").Options} options The Options object to filter properties of.
 * @returns {import("../main.js").Options}
 */
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
 * Attempt to build the required item (buildMap / options) from a string value.
 * @param {string} str The string to compile into an object.
 * @param {function(object):{}} delegate A delegate that is responsible for compiling the object at the end.
 * @returns {object | undefined} The required buildMap or Options object.
 */
function fromString(str, delegate) {
    let arr = compileCliString(str, ",");
    let test = fromArray(arr, delegate, true);
    if (test != void 0) return test;
    arr = compileValue(str, propertyType.JsonObject);
    return delegate(arr);
}
/**
 * Attempt to build the required item (buildMap / options) from an array of strings.
 * @param {string[]} arr The string array to compile an object from
 * @param {function(object):object|undefined} delegate A delegate that is responsible for compiling the end product.
 * @param {boolean} stop If set to true, will stop at the first check and will not reattempt on Json format compilation.
 * @returns {object | undefined} The required buildMap or Options object, alternatively undefined.
 */
function fromArray(arr, delegate, stop) {
    /* v8 ignore next - this should never be true */
    if (!Array.isArray(arr)) return delegate();
    let test = delegate(compileArgs(arr.map(makeProperty)));
    if (test != void 0 || stop) return test;
    return delegate(compileValue(arr.join(','), propertyType.JsonObject));
}
/**
 * Converts a string to a string that is represented as a property string.
 * @param {string} str The string value to convert to a property type string.
 * @returns {string}
 */
function makeProperty(str) {
    const type = getPropertyType(str);
    return type === propertyType.None ? '--' + str : str;
}