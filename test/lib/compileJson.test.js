import { describe, expect, it} from 'vitest';
import { compileJson } from '../../src/lib/compileJson';

describe('jsonParse', () =>{
    it('should be able to handle empty value objects without {}', () => {
        const test = "abc:"
        expect(compileJson(test)).toMatchObject({
            abc: ''
        })
    });
    it('should be able to handle empty value objects without {}', () => {
        const test = "abc"
        expect(compileJson(test)).toMatchObject({
            abc: true
        })
    });
    it('should ignore multiple brackets {}', () => {
        const test = "{{{abc: true}}}"
        expect(compileJson(test)).toMatchObject({
            abc: true
        })
    });
    it('should be able to handle quotations', () => {
        const test = "{abc: 'true'}"
        expect(compileJson(test)).toMatchObject({
            abc: 'true'
        })
    });
    it('should be able to handle multiple properties', () => {
        const test = "{abc: 'true', def: 1, 'bc': {}}"
        expect(compileJson(test)).toMatchObject({
            abc: 'true', def: 1, bc: {}
        })
    });
    it('should be able to handle multiple objects', () => {
        const test = "{abc: 'true', def: {x:1, y:{z: 'deep'}, a: 1}, 'bc': false}"
        expect(compileJson(test)).toMatchObject({ 
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
        const test = "{abc: 'true', def: '[one, two, three]'"
        expect(compileJson(test)).toMatchObject({ 
            abc: 'true', 
            def: [ 'one', 'two', 'three' ] 
        })
    });
    it('should deal with incomplete ending', () => {
        const test = "xyz: {x}, def,abc: 'true'"
        expect(compileJson(test)).toMatchObject({ 
            abc: 'true', 
            def: true,
            xyz: { x: true }
        })
    });
    it('should deal with arrays ', () => {
        const test = "xyz: [], def,abc: 'true'"
        expect(compileJson(test)).toMatchObject({ 
            abc: 'true', 
            def: true,
            xyz: []
        })
    });
})