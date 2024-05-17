import {composer} from './src/lib/argme.js';
import { buildCliString } from './src/lib/helpers.js';

/**
 * @deprecated at version 2.  Should use argme([options]) instead
 * Parse the arguments as received by a cli
 * @param {import('./src/lib/main.js').options|object|string|undefined} options An optional required properties object.
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
 * @param {import('./src/lib/main.js').options|object|string|undefined} options An optional required properties object.
 * @returns 
 */
/* v8 ignore next 3 - depricated function */
export function parseArgs(args, options) {
    return argme(args, optoins)
};
/**
 * Parse the arguments as provided by user
 * @param {string[]|object|string|import('./src/lib/main.js').options} [args] the arguments to filter through.
 * @param {import('./src/lib/main.js').options|object|string} [options] An optional required properties object.
 * @returns {object|undefined}
 */
export function argme(args, options) {
    if (args == void 0) return composer(undefined, options);
    if (Array.isArray(args)) return composer(args, options);
    if (typeof args === 'object') return composer(undefined, options);
    if (typeof args === 'string') return composer(buildCliString(args), options);
    /* v8 ignore next - should not get here */
    return undefined;
};