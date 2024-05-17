import { describe, expect, it} from 'vitest';
import { buildCliString } from '../lib/../../src/lib/helpers.js';
export {buildCliString} from '../lib/../../src/lib/helpers.js';


describe("cli string builder", () => {
    it("should be able to deconstruct an ordinary cli type input string", () => {
        const result = buildCliString('abc -pb --abc=234');

        expect(result).toMatchObject([
            'abc',
            '-pb',
            '--abc=234'
        ])
    });
    it("should be able to deconstruct cli and keep quotes together", () => {
        const result = buildCliString('"abc -pb" --abc=234 \'a b\'');

        expect(result).toMatchObject([
            'abc -pb',
            '--abc=234',
            'a b'
        ])
    });
    it("should be able to reconstruct cli and remove quotes in the middle of text", () => {
        const result = buildCliString('abc -pb --a"bc=234" a"b d"c a="bc" a=b"c d" ');

        expect(result).toMatchObject([
            'abc',
            '-pb',
            '--abc=234',
            'ab dc',
            'a="bc"',
            'a=bc d'
        ])
    });
    it("should be able to reconstruct cli text even if multiple quotes are used", () => {
        const result = buildCliString(' abc -pb --a"bc=234" a"b \'d"c a="b\'c" a=b"c\' d"');

        expect(result).toMatchObject([
            'abc',
            '-pb',
            '--abc=234',
            'ab \'dc',
            'a="b\'c"',
            'a=bc\' d'
        ])
    });

});