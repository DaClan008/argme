import { compileRequiredProperties, compileOptions } from "./compilers/compileOptions.js";
import { compileArgs } from "./compilers/compileArgs.js";



/** 
 * Compile the arguments result object.
 * @param {string[]} [args] An optional argument list to build an object with.
 * @param {Options} [options] An optional requiredProperties object.
 * @returns 
 */
export function composer(args, options) {
    const currentProps = compileArgs(args, options);

    let required = compileRequiredProperties(options);
    if (required == void 0) return currentProps;

    const result = {};
    const propertyMap = {};

    for(const prop in currentProps) propertyMap[options?.ignoreCase ? prop.toLowerCase() : prop ] = prop;

    for(const prop in required) {
        const caseProp = options.ignoreCase? prop.toLowerCase() : prop;
        if (propertyMap[caseProp] != void 0) {
            result[prop] = currentProps[propertyMap[caseProp]];
            continue;
        }
        result[prop] = required[prop] === true ? 
            options.returnUndefinedObject ? 
                { undefined: true } :
                false : 
            required[prop];
    }

    if (options.strict) return result;

    const resultMap = {};
    for(const prop in result) resultMap[options?.ignoreCase ? prop.toLowerCase() : prop] = true;

    for (const prop in currentProps) {
        if (resultMap[options?.ignoreCase ? prop.toLowerCase() : prop]) continue;

        result[prop] = currentProps[prop];
    }

    return result;
}

/**
 * See if an object is a normal object or a type of an options object.  An option object will not have any properties under _ and will contain only 
 * option properties.  This should be used when it is uncertain if the object passed as args is an options object or not.  If it is then
 * the properties contained in process.argv will be used to build an object.
 * @param {Options, object} testObject The object that should be tested.
 * @returns {object} The object or options object.
 */
export function testOptions(testObject) {
    if ((testObject._ != void 0 && testObject._.length > 0) || process.argv.length <= 2) return testObject;
    const optTest = compileOptions({...testObject});
    if (optTest == void 0) return testObject;
    const resTest = composer(undefined, optTest);
    return resTest != void 0 && (resTest._?.length > 0 || Object.keys(resTest).length > 1) ?
        resTest :
        testObject;
}

/**
 * @typedef Options
 * @property {object|string|string[]} properties an object representing the current required property structure, else a string value (refer to parseString property).
 * @property {boolean} parseString If set to true the string will be parsed the same way as the arg parser, else a the string should be a comma separated string separating each required property.  This is ignored if properties value is object.
 * @property {boolean} returnUndefinedObject If set to true an object {undefined:true} will be added for all requiredProperties that there were no value of, else false will be used if set to false or no value set.
 * @property {boolean} strict if set to true and properties value is correctly set then the returned object will only include the properties as defined in the properties object.
 * @property {boolean} ignoreCase if set to true then the case of the property name in the argument list will be ignored when compared with the required list.  The value will default to required list's property value.
 * @property {boolean} ignoreDuplicates if set to true only the first item received for each property
 * @property {boolean} duplicateOverride if set to true, and ignoreDuplicate is set to true then the last value received for each property will be returned.
 * @property {boolean} ignoreBoolDuplicates if set to true, if a property is passed twice that contains a boolean value (either originally or later), the duplicate value will be ignored and the bool value will always be replaced with another type.
 * @property {object|string|string[]} map map short property values to long property values
 */