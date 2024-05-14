import {parseArgs as parser} from './src/lib/argme.js';

/**
 * Parse the arguments as received by a cli
 * @param {import('./src/lib/argme.js').requiredPropOptions|object|string|undefined} options An optional required properties object.
 * @returns 
 */
export function parse(options) {
    return parser(options);
};
/**
 * Parse the arguments as provided by user
 * @param {string[]} args the arguments to filter through.
 * @param {import('./src/lib/argme.js').requiredPropOptions|object|string|undefined} options An optional required properties object.
 * @returns 
 */
export function parseArgs(args, options) {
    return parser(options, args);
};