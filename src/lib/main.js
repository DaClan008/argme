import { compileArray } from "./compileArray.js";
import { sanitizeValue, isString, buildCliString } from "./helpers.js";
import { compileJson } from "./compileJson.js";
import { propertyType } from "./constants.js";

/**
 * 
 * @param {string} arg The full argument value (i.e. --prop=value).
 * @param {propertyType} type The propertyType of the argument.
 * @returns {{prop: string, value: string}[]}
 */
function propertySplit(arg, type) {
    const result = [];

    const isFull = type === propertyType.FullProperty || type === propertyType.JsonObject ;
    let i = isFull ? 2 : 1;
    let equalIndex = -1;
    let quoteIndex = -1;
    let quote = undefined;

    for (;i < arg.length; i++) {
        const char = arg[i];

        if(!isFull && (char === '"' || char === "'")) {
            if (quoteIndex < 0) {
                if (i === arg.length - 1) continue; // last character ignore
                quoteIndex = i;
                quote = char;
                continue;
            }
            if (char !== quote) continue;
            quote = void 0;
            result.push({prop: arg.substring(quoteIndex + 1, i), value: true});
            quoteIndex = -1;
            continue;
        }
        
        if (quote != void 0) continue;
        
        if (char === '=' && quote == void 0) {
            equalIndex = i;
            break;
        }
        
        if (isFull) continue;

        if (arg[i] === '-' || arg[i] === '_') continue;

        if (i > 1 && !isNaN(arg.substring(i))) {
            const val = parseFloat(arg.substring(i));
            for(let x = 0; x < result.length; x++) {
                result[x].value = val;
            }
            return result;
        }
        result.push({prop: arg[i], value: true});
    }
    if (quoteIndex > -1) {
        // ignore the quote ... will get here only if short prop.
        const tmp = propertySplit(arg.substring(quoteIndex), type);
        if (tmp.length === 0) return result;
        
        if (tmp.length > 1 || tmp[0].value === true) {
            result.push(...tmp);
            return result;
        }
        if (tmp[0].value !== true) {
            const tmpResult = result.reduce((prev, current) => {
                prev.prop += current.prop;
                return prev;
            },{prop: '', value: tmp[0].value});
            tmpResult.prop += tmp[0].prop;
            result.splice(0);
            result.push(tmpResult);
        }
        return result;
    }
    if (equalIndex < 0 && type === propertyType.ShortProperty) return result;

    const start = isFull ? 2 : 1;
    const startEnd = equalIndex < 0 ? undefined : equalIndex;
    let prop = type === propertyType.ShortProperty ?
                result.map(x=> x.prop).join('') :
                arg.substring(start, startEnd);
    result.splice(0, result.length);

    if (/^['"][^_]+['"]$/.test(prop)) prop = prop.substring(1, prop.length - 1);
    if (prop === '_') return [];
    
    result.push({
        prop,
        value: equalIndex < 0 ? true : arg.substring(equalIndex + 1)
    });

    return result;
}

function getPropertyType (value) {
    if (value == void 0 || /^[-~]{0,2}_?$/.test(value)) return propertyType.Undefined;
    if (value.length === 1) return propertyType.None;

    if (value[0] === '-') return value[1] === '-' ? propertyType.FullProperty : 
                                                    propertyType.ShortProperty;
    if (value[0] === '~') return value[1] === '~' ? propertyType.JsonObject : propertyType.Array;

    return propertyType.None;
}

/**
 * 
 * @param {Options | undefined} options 
 * @returns 
 */
function compileOptions(options) {
    if (options == void 0 || options.properties == void 0) return undefined;
    let required = {};

    const clearEmptyObject = () => {
        if (required._ != void 0 && required._.length > 0) {
            for(let i = 0; i< required._.length; i++) {
                required[required._[i]] = options.returnUndefinedObject ? {undefined: true} :  true;
            }
            delete required._;
        }
    }

    if (typeof options.properties === 'string') {
        if (options.parseString) {
            const reqPropsArr = buildCliString(options.properties);// options.properties.split(' ').map(x => x.trim());
            required = buildArgs(reqPropsArr);
            clearEmptyObject();
        } else {
            const splitProperties = options.properties.split(',');
            required = {};
            splitProperties.forEach(x => required[x] = options.returnUndefinedObject ? {undefined: true} :  true);
        }
    }
    else if(Array.isArray(options.properties)) {
        for(let i = options.properties.length-1; i >= 0; i--) {
            if(typeof options.properties[i] !== 'string') options.properties.splice(i,1);
        }
        required = buildArgs(options.properties);
        clearEmptyObject();
    }
    else if(typeof options.properties === 'object') {
        required = {...options.properties}
    }
    else return undefined;
    return required;
}

export function buildArgs(suppliedArgs, options) {
    const result = {
        _:[]
    }
    const args = suppliedArgs || process.argv.splice(2);

    const addProperty = (prop, val, type) => {
        if (type === propertyType.ShortProperty && options?.map != void 0) {
            prop = options.map[prop] ?? prop;
        }
        // adding to _ array (no valued item)
        if (val == void 0) {
            // duplicates not monitored in this array
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
        if (existingValue === val) return;
        
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

        if (type === propertyType.Undefined) continue;

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
/**
 * @typedef Options
 * @property {object | string} properties an object representing the current required property structure, else a string value (refer to parseString property).
 * @property {boolean} parseString If set to true the string will be parsed the same way as the arg parser, else a the string should be a comma separated string separating each required property.  This is ignored if properties value is object.
 * @property {boolean} returnUndefinedObject If set to true an object {undefined:true} will be added for all requiredProperties that there were no value of, else false will be used if set to false or no value set.
 * @property {boolean} strict if set to true and properties value is correctly set then the returned object will only include the properties as defined in the properties object.
 * @property {boolean} ignoreCase if set to true then the case of the property name in the argument list will be ignored when compared with the required list.  The value will default to required list's property value.
 * @property {boolean} ignoreDuplicates if set to true only the first item received for each property
 * @property {boolean} duplicateOverride if set to true, and ignoreDuplicate is set to true then the last value received for each property will be returned.
 * @property {object} map map short property values to long property values
 */

/** 
 * Compile the arguments result object.
 * @param {string[]} args An optional argument list to build an object with.
 * @param {Options|undefined} options An optional requiredProperties object.
 * @returns 
 */
export function composer(args, options) {
    const currentProps = buildArgs(args, options);

    let required = compileOptions(options);
    if (required == void 0) return currentProps;

    const result = {};
    const propertyMap = {};

    for(const prop in currentProps) {
        propertyMap[options.ignoreCase ? prop.toLowerCase() : prop ] = prop;
    }


    for(const prop in required) {
        const caseProp = options.ignoreCase? prop.toLowerCase() : prop;
        if (propertyMap[caseProp] != void 0) {
            result[prop] = currentProps[propertyMap[caseProp]];
            continue;
        }
        result[prop] = required[prop] === true ? 
            options.returnUndefinedObject ? 
                {undefined: true} :
                false : 
            required[prop];
    }

    if (options.strict) return result;

    for (const prop in currentProps) {
        if (result[prop] != void 0) continue;
        result[prop] = currentProps[prop];
    }

    return result;
}
