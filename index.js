import { composer, testOptions } from './src/main.js';
import { compileCliString } from './src/compilers/compileCliString.js';
import { compileOptions } from './src/compilers/compileOptions.js';

/**
 * @deprecated at version 2.  Should use argme([options]) instead
 * Parse the arguments as received by a cli
 * @param {import('./src/main.js').options|object|string|undefined} options An optional required properties object.
 * @returns 
 */
/* v8 ignore next 3 - depricated function */
export function parse(options) {
    return argme(options);
};
/**
 * @deprecated at version 2.  Should use argme([args], [options]) instead
 * Parse the arguments as provided by user
 * @param {string[]} args the arguments to filter through.
 * @param {import('./src/main.js').options|object|string|undefined} options An optional required properties object.
 * @returns 
 */
/* v8 ignore next 3 - depricated function */
export function parseArgs(args, options) {
    return argme(args, options)
};
/**
 * Parse the arguments as provided by user
 * @param {import('./src/main.js').options|string|string[]} [args] the arguments to filter through.
 * @param {import('./src/main.js').options|string|string[]} [options] An optional required properties object.
 * @returns {object|undefined}
 */
export function argme(args, options) {
    let result;
    
    if (args != void 0 && typeof args === 'string') args = compileCliString(args);

    if(args == void 0) result = composer(undefined, compileOptions(options));
    else if (options != void 0) result = composer(args, compileOptions(options));
    else if (typeof args === 'object' && !Array.isArray(args)) result = composer(undefined, compileOptions(args));
    else {
        // args should be a string array at this point, but it could also have come from a string originally
        result = composer(args);
        result = testOptions(result);
    }

    if (result == void 0 || result['^'] == void 0 || result['*'] == void 0) return result;
    
    return argme(result['*'], compileOptions(result['^']));
};