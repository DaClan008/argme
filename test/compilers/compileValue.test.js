import { describe, expect, it} from 'vitest';
import { compileValue } from '../../src/compilers/compileValue.js';
import { propertyType } from '../../src/helpers/constants.js';

describe("compileValue - Arrays", () => {
    it("Should be able to compile a simple array object", () => {
        const result = compileValue("abc, def, xyz", propertyType.Array);
        expect(result).toMatchObject([
            "abc", "def", "xyz"
        ])
    });
    it('should return undefined if value is set to undefined', () => {
        expect(compileValue(undefined, propertyType.Array)).toBeFalsy();
    });
    it('should return an object array if value is set to an object', () => {
        expect(compileValue({test:true}, propertyType.Array)).toMatchObject([{test:true}]);
    });
    it("Should be able to compile empty array", () => {
        const result = compileValue("[]", propertyType.Array);
        expect(result).toMatchObject([])
        const result2 = compileValue("", propertyType.Array);
        expect(result2).toMatchObject([]);
    });
    it("Should be able to compile a simple array object without proper closing", () => {
        const result = compileValue("[abc, def, xyz", propertyType.Array);
        expect(result).toMatchObject([
            "abc", "def", "xyz"
        ])
    });
    it("Should be able to compile a simple array without the use of Brackets", () => {
        const result = compileValue("'abc', 'def', 'xyz'", propertyType.Array);
        expect(result).toMatchObject([
            "abc", "def", "xyz"
        ])
    });
    it("Should properly deal with quotes", () => {
        const result = compileValue("['abc, \"def', xyz", propertyType.Array);
        expect(result).toMatchObject([
            "abc, \"def", "xyz"
        ])
    });
    it("Should properly deal arrays within the array", () => {
        const result = compileValue("abc, [def], xyz, [], [", propertyType.Array);
        expect(result).toMatchObject([
            "abc", ["def"], "xyz",[], []
        ]);
    });
    
    it("Should ignore open brackets within strings", () => {
        const result = compileValue("abc, [def], x[yz, []", propertyType.Array);
        expect(result).toMatchObject([
            "abc", ["def"], "x[yz",[]
        ]);
    });
    it("Should properly deal objects within the array", () => {
        const result = compileValue("'{ignore: abc}', {def: true}, {", propertyType.Array);
        expect(result).toMatchObject([
            "{ignore: abc}", 
            {def:true},
            {}
        ])
    });
    it("Should add empty strings if no value is received", () => {
        const result = compileValue(",,,,", propertyType.Array);
        expect(result).toMatchObject([
            '', '', '', '', ''
        ])
    });
});

describe('compileValue - jsonParse', () =>{
    it('should be able to handle empty value objects {}', () => {
        expect(compileValue('{}', propertyType.JsonObject)).toMatchObject({});
        expect(compileValue('', propertyType.JsonObject)).toMatchObject({});
    });
    it('should return undefined if value is set to undefined', () => {
        expect(compileValue(undefined, propertyType.JsonObject)).toBeFalsy();
    });
    it('should be able to handle empty value objects without {}', () => {
        const test = "abc:"
        expect(compileValue(test, propertyType.JsonObject)).toMatchObject({
            abc: ''
        })
    });
    it('should be able to handle empty value objects without {}', () => {
        const test = "abc"
        expect(compileValue(test, propertyType.JsonObject)).toMatchObject({
            abc: true
        })
    });
    it('should ignore multiple brackets {}', () => {
        const test = "{{{abc: true}}}"
        expect(compileValue(test, propertyType.JsonObject)).toMatchObject({
            abc: true
        })
    });
    it('should ignore brackets within properties or value items', () => {
        const test = "{a{bc: t{rue}"
        expect(compileValue(test, propertyType.JsonObject)).toMatchObject({
            "a{bc": 't{rue'
        })
    });
    it('should be able to handle quotations', () => {
        const test = "{abc: 'true'}"
        expect(compileValue(test, propertyType.JsonObject)).toMatchObject({
            abc: 'true'
        })
    });
    it('should be able to handle multiple properties', () => {
        const test = "{abc: 'true', def: 1, 'bc': {}}"
        expect(compileValue(test, propertyType.JsonObject)).toMatchObject({
            abc: 'true', def: 1, bc: {}
        })
    });
    it('should be able to handle multiple objects', () => {
        const test = "{abc: 'true', def: {x:1, y:{z: 'deep'}, a: 1}, 'bc': false}"
        expect(compileValue(test, propertyType.JsonObject)).toMatchObject({ 
            abc: 'true', 
            def: { 
                x: 1, 
                y: { 
                    z: 'deep' 
                }, 
                a: 1 
            }, 
            bc: false })
    });
    it('should be able to handle array objects within quotes', () => {
        const test = "{abc: 'true', def: [one, two, three]"
        expect(compileValue(test, propertyType.JsonObject)).toMatchObject({ 
            abc: 'true', 
            def: [ 'one', 'two', 'three' ] 
        })
    });
    it('should deal with incomplete ending', () => {
        const test = "xyz: {x}, def,abc: 'true'"
        expect(compileValue(test, propertyType.JsonObject)).toMatchObject({ 
            abc: 'true', 
            def: true,
            xyz: { x: true }
        })
    });
    it('should deal with arrays ', () => {
        const test = "xyz: [], def,abc: 'true'"
        expect(compileValue(test, propertyType.JsonObject)).toMatchObject({ 
            abc: 'true', 
            def: true,
            xyz: []
        })
    });
});