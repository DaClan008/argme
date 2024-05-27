import { describe, expect, it} from 'vitest';
import { compileArray } from '../../src/compilers/compileArray.js';

describe("compileArray", () => {
    it("Should be able to compile a simple array object", () => {
        const result = compileArray("abc, def, xyz");
        expect(result).toMatchObject([
            "abc", "def", "xyz"
        ])
    });
    it("Should be able to compile empty array", () => {
        const result = compileArray("[]");
        expect(result).toMatchObject([])
    });
    it("Should be able to compile a simple array object without proper closing", () => {
        const result = compileArray("[abc, def, xyz");
        expect(result).toMatchObject([
            "abc", "def", "xyz"
        ])
    });
    it("Should properly deal with quotes", () => {
        const result = compileArray("['abc, def', xyz");
        expect(result).toMatchObject([
            "abc, def", "xyz"
        ])
    });
    it("Should properly deal arrays within the array", () => {
        const result = compileArray("abc, [def], xyz, [], [");
        expect(result).toMatchObject([
            "abc", ["def"], "xyz",[], []
        ]);
    });
    it("Should properly deal objects within the array", () => {
        const result = compileArray("'{ignore: abc}', {def: true}, {");
        expect(result).toMatchObject([
            "{ignore: abc}", 
            {def:true},
            {}
        ])
    });
    it("Should add empty strings if no value is received", () => {
        const result = compileArray(",,,,");
        expect(result).toMatchObject([
            '', '', '', '', ''
        ])
    });
})