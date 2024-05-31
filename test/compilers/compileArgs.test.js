import { describe, expect, it} from 'vitest';
import { compileArgs } from "../../src/compilers/compileArgs.js";

describe('compileArgs', () => {
    it('should set short name values to the following provided number or boolean', () => {
        const result = compileArgs(['-a', '4', '-b', '0.3', '-c', 'someOtherText', '-y', 'true', '-z', 'false']);
        expect(result).toMatchObject({
            _: ['someOtherText'],
            a: 4,
            b: 0.3,
            c: true,
            y: true,
            z: false
        })
    });
    it('should set short concatenated values to true unless it is followed directly by a number', () => {
        const result = compileArgs(['-abc520.2', '-de', '6']);
        expect(result).toMatchObject( {
            _: ['6'],
            a: 520.2,
            b: 520.2,
            c: 520.2,
            d: true,
            e: true
        })
    });
    it('should allow for mistakes using short property indicator when full property is present', () => {
        const result = compileArgs(['-abc=SomeValue', 'someOtherText'])
        expect(result).toMatchObject({
            _:['someOtherText'],
            abc: 'SomeValue'
        })
    });
    it('should add non property indicated values to array', () => {
        const result = compileArgs(['-a', '5', '-b', 'value', 'value2']);
        expect(result).toMatchObject({
            _:['value', 'value2'],
            a: 5, 
            b: true
        });

    });
    it('should be able to add proper long properties', () => {
        const result = compileArgs(['--abc=baz', '--def=true']);
        expect(result).toMatchObject({
            _:[],
            abc: 'baz',
            def: true
        })
    });
    it('should be able to add booleans and numbers following property names', () => {
        const result = compileArgs(['--abc', 'FaLse', '--d', '6.2', '--e']);
        expect(result).toMatchObject({
            _:[],
            abc: false,
            d: 6.2,
            e: true
        });
    });
    it('should disallow _ to be used as full property', () => {
        const result = compileArgs(['--_=3', '--a' ]);
        expect(result).toMatchObject({
            _:[],
            a: true
        });
    });
    it('should ignore _ or - inside short properties', () => {
        const result = compileArgs(['-a-b', '-d_e']);
        expect(result).toMatchObject({
            _:[],
            a: true,
            b: true,
            d: true,
            e: true
        })
    });
    it('should ignore empty standing -', () => {
        const result = compileArgs(['-a', '5', '-b', '-', '7.5', '-c', '--', 'true', '-d', 'TrUe']);
        expect(result).toMatchObject({
            _:['7.5', 'true'],
            a: 5,
            b: true,
            c: true,
            d: true
        })
    });
    // new
    it('should ignore quotes surrounding property values', () => {
        const result = compileArgs(["--'abc'=234", "-'a\"'"]);
        expect(result).toMatchObject({
            _:[],
            abc: 234,
            'a"': true
        })
    });
    it('should ignore quotes surrounding property values that include escapes characters', () => {
        const result = compileArgs(["--'a\\'bc'=234", "-'a\"'"]);
        expect(result).toMatchObject({
            _:[],
            "a'bc": 234,
            'a"': true
        })
    });
    it('should deal with quotes at odd places within short properties', () => {
        const result = compileArgs(["-a'bc=234", "-xy'z", '-d\"', "-a'_"]);
        expect(result).toMatchObject({ 
            _: [], 
            abc: 234, 
            x: true, 
            y: true, 
            z: true, 
            d: true,
            a: true })
    });
    it('should deal with jsonObjects with ~~ prefix', () => {
        const result = compileArgs(["~~abc={a:true, b: 'someVal', c: { x: 123 }}"]);
        expect(result).toMatchObject({
            _: [],
            abc: {
                a:true, 
                b: 'someVal', 
                c: { 
                    x: 123 
                }
            }
        })
    });
    it('should deal with jsonArray using ~ prefix', () => {
        const result = compileArgs(["~abc=abc, def, {x:2}, xyz"]);
        expect(result).toMatchObject({
            _: [],
            abc: [
                'abc', 
                'def', 
                {
                    x:2
                }, 
                'xyz'
            ]
        })
    });
    it('should not add an array by adding duplicate items with no value', () => {
        const result = compileArgs(["-a", "-a", "-a", "prop", "prop", "prop"]);
        expect(result).toMatchObject({
            _: ["prop", "prop", "prop"],
            a: true
        })
    });
    it('should add an array by adding duplicate items with value', () => {
        const result = compileArgs(["-a", "-a=1", "-a=2", "-a='true'", "--b='true'", "--b=5", "--b='someval'"]);
        expect(result).toMatchObject({
            _: [],
            a: [
                true, 1,2, 'true'
            ],
            b: [
                'true',
                5,
                'someval'
            ]
        })
    });
    it('should keep first set value if ignoreDuplicates option is used', () => {
        const result = compileArgs(["-a", "-a=1", "-a=2", "-a='true'", "--b='true'", "--b=5", "--b='someval'"], {ignoreDuplicates: true});
        expect(result).toMatchObject({
            _: [],
            a: true,
            b: 'true'
        })
    });
    it('should keep last set value if duplicateOverride option is used', () => {
        const result = compileArgs(["-a", "-a=1", "-a=2", "-a='true'", "--b='true'", "--b=5", "--b='someval'"], {duplicateOverride: true});
        expect(result).toMatchObject({
            _: [],
            a: 'true',
            b: 'someval'
        })
    });
    it('should map property names to correct options', () => {
        const result = compileArgs(["-ab", "-a=1"], {map: {a: 'alpha', b: 'bravo'}});
        expect(result).toMatchObject({
            _: [],
            alpha: [true, 1],
            bravo: true
        });
        expect(result.a).toBeFalsy();
        expect(result.b).toBeFalsy();
    });
    it('should map property names to correct options', () => {
        const result = compileArgs(["-ab", "-a=1"], {map: {a: 'alpha', b: 'bravo'}});
        expect(result).toMatchObject({
            _: [],
            alpha: [true, 1],
            bravo: true
        });
        expect(result.a).toBeFalsy();
        expect(result.b).toBeFalsy();
    });
    it('should ignore boolean duplicates with ignoreBoolDuplicates option', () => {
        const result = compileArgs(["-abc", "-a=1", '--bravo=false'], {map: {a: 'alpha', b: 'bravo'}, ignoreBoolDuplicates: true});
        expect(result).toMatchObject({
            _: [],
            c: true,
            alpha: 1,
            bravo: true
        });
        expect(result.a).toBeFalsy();
        expect(result.b).toBeFalsy();
    });
    it('should ignore properties without a value set if ignoreDuplicates option is set', () => {
        const result = compileArgs(["alpha", 'bravo', 'alpha', 'bravo'], { ignoreDuplicates: true});
        expect(result).toMatchObject({
            _: ['alpha', 'bravo']
        });
    });
    it('should be able to deal with ignore values in property strings.', () => {
        const result = compileArgs(["--a\\=b=123", "~~d\\:e:a:b", "~z\\\\y=123"]);
        expect(result).toMatchObject({
            _: [],
            'a=b':123,
            'd:e':{a:'b'},
            'z\\y':[123]
        });
    });
});