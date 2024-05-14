
function isNotString(val) {
    return !isNaN(val) || /^(true|false)$/i.test(val);
}

function propertySplit(arg) {
    const result = [];

    const isFull = arg.length >2 && arg[1] === '-';
    let i = isFull? 2 : 1;
    let equalIndex = -1;

    for (;i < arg.length; i++) {
        if (arg[i] === '=') {
            equalIndex = i;
            break;
        }
        
        if (isFull) continue;
        if (arg[i] === '-' || arg[i] === '_') continue;

        if (i > 1 && !isNaN(arg.substr(i))) {
            const val = parseFloat(arg.substr(i));
            for(let x = 0; x < result.length; x++) {
                result[x].value = val;
            }
            return result;
        }
        result.push({prop: arg[i], value: true});
    }

    if (equalIndex < 0 && !isFull) return result;
    result.splice(0, result.length);

    const start = isFull ? 2 : 1;
    const propLength = equalIndex < 0 ? undefined : equalIndex - start;
    const prop = arg.substr(start, propLength);

    if (prop === '_') return [];
    
    result.push({
        prop,
        value: equalIndex < 0 ? true : arg.substr(equalIndex + 1)
    });

    return result;
}

/**
 * 
 * @param {requiredPropOptions | undefined} requiredProps 
 * @returns 
 */
function compileRequiredProperties(requiredProps) {
    if (requiredProps == void 0 || requiredProps.properties == void 0) return undefined;
    let required = {};

    const clearEmptyObject = () => {
        if (required._ != void 0 && required._.length > 0) {
            for(let i = 0; i< required._.length; i++) {
                required[required._[i]] = requiredProps.returnUndefinedObject ? {undefined: true} :  true;
            }
            delete required._;
        }
    }

    if (typeof requiredProps.properties === 'string') {
        if (requiredProps.parseString) {
            const reqPropsArr = requiredProps.properties.split(' ').map(x => x.trim());
            required = buildArgs(reqPropsArr);
            clearEmptyObject();
        } else {
            const splitProperties = requiredProps.properties.split(',');
            required = {};
            splitProperties.forEach(x => required[x] = requiredProps.returnUndefinedObject ? {undefined: true} :  true);
        }
    }
    else if(Array.isArray(requiredProps.properties)) {
        for(let i = requiredProps.properties.length-1; i >= 0; i--) {
            if(typeof requiredProps.properties[i] !== 'string') requiredProps.properties.splice(i,1);
        }
        required = buildArgs(requiredProps.properties);
        clearEmptyObject();
    }
    else if(typeof requiredProps.properties === 'object') {
        required = {...requiredProps.properties}
    }
    else return undefined;
    return required;
}


export function buildArgs(suppliedArgs) {
    const result = {
        _:[]
    }
    const args = suppliedArgs || process.argv.splice(2);

    for (let i = 0; i < args.length;i++) {
        const current = args[i];
        if (current[0] !== '-') {
            result._.push(current);
            continue;
        }
        
        if (current.length === 1) continue;
        
        if (current.length === 2) {
            if (current[1] === '-' || current[1] === '_') continue;
            if (args.length === i + 1 || args[i+1][0] === '-' || !isNotString(args[i+1])) {
                result[current.substr(1)] = true;
                continue;
            }
            
            result[current.substr(1)] = isNaN(args[i + 1]) ? args[i + 1].toLowerCase() === "true" : parseFloat(args[i + 1]);
            i++;
            continue;
        }

        const props = propertySplit(args[i]);
        if (props.length === 1 && props[0].value === true && args.length > i + 1 && isNotString(args[i+1])) {
            result[props[0].prop] = isNaN(args[i+1]) ? args[i+1].toLowerCase() === "true": parseFloat(args[i+1]);
            i++;
            continue;
        }
        props.forEach(x => {
            result[x.prop] = x.value;
        })
        
    };
    return result;
}
/**
 * @typedef requiredPropOptions
 * @property {object | string} properties an object representing the current required property structure, else a string value (refer to parseString property).
 * @property {boolean} parseString If set to true the string will be parsed the same way as the arg parser, else a the string should be a comma separated string separating each required property.  This is ignored if properties value is object.
 * @property {boolean} returnUndefinedObject If set to true an object {undefined:true} will be added for all requiredProperties that there were no value of, else false will be used if set to false or no value set.
 * @property {boolean} strict if set to true and properties value is correctly set then the returned object will only include the properties as defined in the properties object.
 * @property {boolean} ignoreCase if set to true then the case of the property name in the argument list will be ignored when compared with the required list.  The value will default to required list's property value.
 */

/** 
 * Compile the arguments result object.
 * @param {requiredPropOptions|undefined} options An optional requiredProperties object.
 * @param {string[]} args An optional argument list to build an object with.
 * @returns 
 */
export function parseArgs(options, args) {
    const currentProps = buildArgs(args);

    let required = compileRequiredProperties(options);
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
