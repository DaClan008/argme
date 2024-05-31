import { getPropertyType, sanitizeValue, isString } from "../helpers/helpers.js";
import { propertyType } from "../helpers/constants.js";
import { propertySplit } from "../helpers/propertySplit.js";
import { compileValue } from "./compileValue.js";

/**
 * Convert an array of string values into an object.  The supplied strings should be in the following format:
 * [optional type][property]=[value] (i.e. --prop=value)
 * @param {string[]} [suppliedArgs] The array of string values.  If a string starts with -- the value of the string will be a normal property.
 * If a string starts with - the value of the string indicates a short property.  If a string starts with ~~ the value will be considered a json object.
 * If a string starts with ~ the value will be considered an array.  All other instances it will be added to the _ property on the return object.
 * @param {import("../main.js").Options} options 
 * @returns {object}
 */
export function compileArgs(suppliedArgs, options) {
    const result = {
        _:[]
    }
    /* v8 ignore next - process.arv test here for the moment. */
    const args = suppliedArgs || process.argv.slice(2);

    const addProperty = (prop, val, type) => {
        
        if (type === propertyType.ShortProperty && options?.map != void 0) {
            prop = options.map[prop] || prop;
        }
        // adding to _ array (no valued item)
        if (val == void 0) {
            // duplicates not monitored in this array
            if (options?.ignoreDuplicates && result._.indexOf(prop) > -1) return;
            result._.push(prop);
            return;
        }
        const existingValue = result[prop];
        // first time adding property
        if (existingValue == void 0 || options?.duplicateOverride) {
            result[prop] = val;
            return;
        }

        if (options?.ignoreDuplicates) return;

        // duplicates - ignore
        if (existingValue === val || (typeof val === 'boolean' && options?.ignoreBoolDuplicates)) return;
        
        if (typeof existingValue === 'boolean' && options?.ignoreBoolDuplicates) {
            result[prop] = val;
            return;
        }

        // object and arrays
        if (Array.isArray(existingValue)) {
            result[prop].push(val);
            return;
        }
        result[prop] = [];
        result[prop].push(existingValue);
        result[prop].push(val);
    }

    for (let i = 0; i < args.length;i++) {
        const current = args[i];
        const type = getPropertyType(current);

        if (type === propertyType.Undefined || 
            ((type === propertyType.ShortProperty || type === propertyType.Array) && current.length === 1) ||
            ((type === propertyType.FullProperty || type === propertyType.JsonObject) && current.length === 2)) continue;

        if (type === propertyType.None) {
            addProperty(current);
            continue;
        }
        
        const next = args.length > i+1 && !isString(args[i+1]) ? sanitizeValue(args[i + 1]) : undefined;

        const props = type === propertyType.ShortProperty && current.length === 2 ?
                        [{prop: current.substring(1),value: true}] :
                        propertySplit(args[i], type);
                        
        if (props.length === 0) continue;
        
        if (next != void 0 && props.length === 1 && props[0].value === true) {
            addProperty(props[0].prop, next, type);
            i++;
            continue;
        }

        for(let x = 0; x< props.length; x++) {
            props[x].value = compileValue(props[x].value, type);
            addProperty(props[x].prop, props[x].value, type);
        }
    };
    return result;
}