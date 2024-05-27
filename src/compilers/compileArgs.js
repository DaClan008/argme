import { getPropertyType, sanitizeValue, isString } from "../helpers/helpers.js";
import { compileJson } from "./compileJson.js";
import { compileArray } from "./compileArray.js";
import { propertyType } from "../helpers/constants.js";
import { propertySplit } from "../helpers/propertySplit.js";

/**
 * 
 * @param {string[]} [suppliedArgs] 
 * @param {import("./compileOptions.js").Options} [options] 
 * @returns 
 */
export function compileArgs(suppliedArgs, options) {
    const result = {
        _:[]
    }
    /* v8 ignore next - process.arv test here for the moment. */
    const args = suppliedArgs || process.argv.splice(2);

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
        
        if (type === propertyType.ShortProperty && current.length === 2) {
            if (args.length === i + 1 || getPropertyType(args[i+1][0]) !== propertyType.None || isString(args[i + 1])) {
                addProperty(current.substring(1), true, type);
                continue;
            }

            addProperty(current.substring(1), sanitizeValue(args[i+1]), type);
            i++;
            continue;
        }

        const props = propertySplit(args[i], type);
        if (props.length === 0) continue;

        if (props.length === 1 && props[0].value === true && args.length > i + 1 && !isString(args[i+1])) {
            addProperty(props[0].prop, sanitizeValue(args[i+1]), type);
            i++;
            continue;
        }
        if (type === propertyType.FullProperty || type === propertyType.ShortProperty) {
            for(let i = 0; i < props.length; i++) {
                addProperty(props[i].prop, sanitizeValue(props[i].value), type);
            }
            continue;
        }
        // now left with array / json object
        if (type === propertyType.JsonObject) {
            addProperty(props[0].prop, compileJson(props[0].value));
            continue;
        }
        addProperty(props[0].prop, compileArray(props[0].value));
    };
    return result;
}