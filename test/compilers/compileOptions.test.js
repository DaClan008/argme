import { describe, expect, it} from 'vitest';
import { compileRequiredProperties, buildMap, compileOptions } from '../../src/compilers/compileOptions';

describe("compileRequiredProperties", () => {
    it("Should return undefined if no required properties has been found", () =>{
        expect(compileRequiredProperties()).toBeFalsy();
        let result = {};
        expect(compileRequiredProperties(result)).toBeFalsy();
        result = {ignoreCase: false}
        expect(compileRequiredProperties(result)).toBeFalsy();
        result = {ignoreDuplicates: true}
        expect(compileRequiredProperties(result)).toBeFalsy();
        result = {duplicateOverride: true}
        expect(compileRequiredProperties(result)).toBeFalsy();
        result = {map: []}
        expect(compileRequiredProperties(result)).toBeFalsy();
    });
    it("Should be able to deal with a normal , separated string property", () =>{
        let result = compileRequiredProperties({ properties: "prop1, prop2, prop3"});
        expect(result).toMatchObject({
            prop1: true,
            prop2: true,
            prop3: true
        });
    });
    it("Should be able to deal with a cli type string string property", () =>{
        let result = compileRequiredProperties({ properties: "-ab --abc='value' --def=123 --xyz", parseString: true});
        expect(result).toMatchObject({
            a: true,
            b: true,
            abc: 'value',
            def: 123,
            xyz: true
        });
    });
    it("Should be able to take in an array of string values", () =>{
        let result = compileRequiredProperties({ properties: ["-ab", "--abc='value'", "--def=123", "--xyz"]});
        expect(result).toMatchObject({
            a: true,
            b: true,
            abc: 'value',
            def: 123,
            xyz: true
        });
    });
    it("Should be able to take in an array of string values and ignore non-string values", () =>{
        let result = compileRequiredProperties({ properties: ["-ab", "--abc='value'", true, 20, {}, "--def=123", "--xyz"]});
        expect(result).toMatchObject({
            a: true,
            b: true,
            abc: 'value',
            def: 123,
            xyz: true
        });
        expect(Object.keys(result).length).toEqual(5);
    });
    it("Should be able to take in an object as required properties", () =>{
        let result = compileRequiredProperties({ properties: {a: true, b: true, abc: 'value', def: 123, xyz:true }});
        expect(result).toMatchObject({
            a: true,
            b: true,
            abc: 'value',
            def: 123,
            xyz: true
        });
        expect(Object.keys(result).length).toEqual(5);
    });
    it("Should return undefined if an empty array or empty string is passed to it", () => {
        let result = compileRequiredProperties({properties: []});
        expect(result).toBeFalsy();
        result = compileRequiredProperties({properties: ""});
        expect(result).toBeFalsy();
        result = compileRequiredProperties({properties: "--abc=53"});
        expect(result).toMatchObject({abc:53});
    });
    it("Should return object with object for properties that is set to true and returnUndefinedObject set to true", () => {
        let result = compileRequiredProperties({properties: ["--someProperty", "underScoreProp", "someProperty"], returnUndefinedObject: true});
        expect(result).toMatchObject({
            someProperty: true,
            underScoreProp: {undefined: true}
        });
    });
});

describe("buildMap", () =>{
    it("should return undefined if supplied options is undefined", () => {
        const result = buildMap();
        expect(result).toBeFalsy();
    });
    it("should build map from comma separated string", () => {
        const result = buildMap("abc='some value', 'a'='def'");
        expect(result).toMatchObject( {
            abc: 'some value',
            a: 'def'
        });
    });
    it("should build map from comma separated json format string", () => {
        const result = buildMap("abc:'some value', 'a':'def'");
        expect(result).toMatchObject( {
            abc: 'some value',
            a: 'def'
        });
    });
    it("should build from array json format and none proper values", () => {
        const result = buildMap(["abc:'some value'", "'a':'def'"]);
        expect(result).toMatchObject( {
            abc: 'some value',
            a: 'def'
        });
        
    });
    it("should build from array normal format and none proper values", () => {
        const result = buildMap(["abc='some value'", "'a'='def'"]);
        expect(result).toMatchObject( {
            abc: 'some value',
            a: 'def'
        });
    });
    it("should build from array normal format and proper values", () => {
        const result = buildMap(["--abc='some value'", "-xyz='def'"]);
        expect(result).toMatchObject( {
            abc: 'some value',
            xyz: 'def'
        });
        // expect(result.a).toBeFalsy();
    });
    it("should build map from object", () => {
        const result = buildMap({abc:'some value', a:'def'});
        expect(result).toMatchObject( {
            abc: 'some value',
            a: 'def'
        });
    });
})

describe("compileOptions", () => {
    it("should return undefined if supplied options is undefined", () => {
        const result = compileOptions();
        expect(result).toBeFalsy();
    });
    it("should return undefined if supplied options is empty array or string", () => {
        let result = compileOptions([]);
        expect(result).toBeFalsy();
        result = compileOptions("");
        expect(result).toBeFalsy();
    });
    it("should return undefined if supplied options not a proper options object", () => {
        let result = compileOptions(["--abc=123", "--other=property"]);
        expect(result).toBeFalsy();
    });
    it("should be able to compile options from normal , separated string", () => {
        const result = compileOptions("abc=123, map='a=abc,b=def'");
        expect(result).toMatchObject({
            map: {
                a: 'abc',
                b: 'def'
            }
        })
    });
    it("should be able to compile options from jsonStyle , map normal properties", () => {
        const result = compileOptions("abc:123, map:'a=abc,b=def', strict:true");
        expect(result).toMatchObject({
            map: {
                a: 'abc',
                b: 'def'
            },
            strict: true
        })
    });
    it("should be able to compile options from jsonStyle , map json string", () => {
        const result = compileOptions("abc:123, map:'{a:abc,b:def}', strict:true");
        expect(result).toMatchObject({
            map: {
                a: 'abc',
                b: 'def'
            },
            strict: true
        })
    });
    it("should ignore Faulty Maps", () => {
        const result = compileOptions("--abc=123, --strict, ~map=[]");
        expect(result).toMatchObject({
            strict: true
        });
        expect(result.map).toBeFalsy();
    });
    it("should be able to compile options from string Array normal properties", () => {
        const result = compileOptions(["--abc=123", "--map='{a:abc,b:def}'", "~properties=[]"]);
        expect(result).toMatchObject({
            map: {
                a: 'abc',
                b: 'def'
            }
        })
    });
    it("should remove properties property if no value has been set", ()=> {
        const result = compileOptions({properties: {}, strict: true});
        expect(result).toMatchObject({
            strict: true
        });
        expect(result.properties).toBeFalsy();
    });
});