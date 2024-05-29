import { describe, expect, it} from 'vitest';
import { compileCliString } from '../../src/compilers/compileCliString.js';


describe("cli string builder", () => {
    it("should be able to deconstruct an ordinary cli type input string", () => {
        const result = compileCliString('abc -pb --abc=234');

        expect(result).toMatchObject([
            'abc',
            '-pb',
            '--abc=234'
        ])
    });
    it("should be able to deconstruct cli type input string and keep quotes together", () => {
        const result = compileCliString('"abc -pb" --abc=234 \'a b\'');

        expect(result).toMatchObject([
            'abc -pb',
            '--abc=234',
            'a b'
        ])
    });
    it("should be able to deconstruct cli type input string and remove quotes in the middle of text", () => {
        const result = compileCliString('abc "-pb" --a"bc=234" a"b d"c a="bc" a=b"c d" ');

        expect(result).toMatchObject([
            'abc',
            '-pb',
            '--abc=234',
            'ab dc',
            'a=bc',
            'a=bc d'
        ])
    });
    it("should be able to reconstruct cli type input string even if multiple quotes are used", () => {
        const result = compileCliString(' abc -pb --a"bc=234" a"b \'d"c a="b\'c" a=b"c\' d"');

        expect(result).toMatchObject([
            'abc',
            '-pb',
            '--abc=234',
            "ab 'dc",
            "a=b'c",
            "a=bc' d"
        ])
    });
    it("should ignore single escapes for quotes.  This is perceived the same as no escapes.", () => {
        const result = compileCliString(' abc -pb --a"bc=234" a"b \"d"c a="b\"c" a\"=b"c\" d"');

        expect(result).toMatchObject([
            'abc', '-pb', '--abc=234', 'ab dc a=bc', 'a=bc d'
        ])
    });
    it("should be able to escape certain quotes if needs be", () => {
        const result = compileCliString(` abc --a\\"bc=234" a"b \\'d"c a="b\\'c a=b\\"c' d"`);

        expect(result).toMatchObject([
            'abc',
            '--a"bc=234 ab',
            "'dc a=b'c",
            "a=b\"c' d\""
        ])
    });
    it("should be able to handle non-escapes ", ()=> {
        const result = compileCliString('--a="b\\cd" --a=bcd\\');

        expect(result).toMatchObject([
            '--a=b\\cd', '--a=bcd\\'
        ])
    });
    it("should be able to deal with double escapes as per cli (no leading space)", () => {
        const result = compileCliString('a"b\\"" asdf jkl"');

        expect(result).toMatchObject([
            'ab"', "asdf", "jkl"
        ]);
    });
    it("should be able to deal with double escapes as per cli (with leading space)", () => {
        const result = compileCliString('a"b \\"" asdf jkl"');

        expect(result).toMatchObject([
            'ab " asdf jkl'
        ]);
    });
});