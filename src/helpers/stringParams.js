import { sanitizeValue } from "./helpers.js";
import { states } from './constants.js';
export class StringParams{
    #start = -1;
    #end = -1;
    /* v8 ignore next 3 */
    get Start() {
        return this.#start;
    }
    set Start(val) {
        this.#start = val;
    }
    /* v8 ignore next 3 */
    get End() {
        return this.#end;
    }
    set End(val) {
        this.#end = val;
    }

    get State() {
        if (this.#start < 0) return states.NotStarted;
        if (this.#end < 0) return states.Started;
        /* v8 ignore next */
        if (this.#end < this.#start) return states.Faulted;
        return states.Finalized;
    }
    reset() {
        this.#start = -1;
        this.#end = -1;
    }
    parse(val, valueCheck) {
        if(this.#start < 0 || this.#end < 0) return undefined;
        let result = val.substring(this.#start, val.length === this.#end + 1 ? undefined : this.#end + 1);
        result = result.trim();
        if (valueCheck) {
            result = sanitizeValue(result);
        }
        if (/^('.*'|".*")$/.test(result)) result = result.substring(1, result.length - 1);
        return result;
    }
}


// module.exports = StringParams;