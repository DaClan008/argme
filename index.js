import { composer, testOptions } from './src/main.js';
import { compileCliString } from './src/compilers/compileCliString.js';
import { compileOptions } from './src/compilers/compileOptions.js';
import { compileArgs } from './src/compilers/compileArgs.js';

/**
 * Parse the arguments as provided by user
 * @param {import('./src/main.js').options|string|string[]} [args] The arguments to filter through.
 * @param {import('./src/main.js').options|string|string[]} [options] An optional required properties object.
 * @returns {object|undefined}
 */
export function argme(args, options) {
    let result;

    if (typeof args === 'string') args = compileCliString(args);

    if (args != void 0 && !Array.isArray(args)) result = composer(undefined, compileOptions(args));
    else if (args == void 0 || options != void 0) result = composer(args, compileOptions(options));
    else {
        // args should be a string array at this point, but it could also have come from a string originally
        result = composer(args);
        result = testOptions(result);
    }

    if (result == void 0 || result['^'] == void 0 || options != void 0 || (args != void 0 && !Array.isArray(args))) return result;
    options = compileOptions(typeof result['^'] === 'string' ? compileArgs([result['^']]) : result['^']);
    return options == void 0 ? result : argme(args, options);
};
/**
 * @deprecated at version 2.  Should use argme([args], [options]) instead
 * Parse the arguments as provided by user
 * @param {string[]} args the arguments to filter through.
 * @param {import('./src/main.js').options|object|string|undefined} options An optional required properties object.
 * @returns 
 */
export function parseArgs(args, options) {
    return argme(args, options)
};
/**
 * @deprecated at version 2.  Should use argme([options]) instead
 * Parse the arguments as received by a cli
 * @param {import('./src/main.js').options|object|string|undefined} options An optional required properties object.
 * @returns 
 */
export function parse(options) {
    return argme(options);
};