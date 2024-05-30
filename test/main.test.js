import { describe, expect, it} from 'vitest';
import { composer } from '../src/main.js';

describe('composer', () => {
    // possible breaking change.  previously returned abc as string
    it('should just return normal buildArgs if no provided parameters.', () =>{
        process['argv'] = ['..', '..', '--abc=123'];
        expect(composer()).toMatchObject({
            _:[],
            abc: 123
        })

    });
    // possible breaking change.  previously returned abc as string
    it('should just return normal buildingArgs if only args is provided', () => {
        expect(composer(['--abc=456'], undefined)).toMatchObject({
            _:[],
            abc: 456
        })
    })
    // possible breaking change.  previously returned abc as string
    it('should include missing properties provided through options', () => {
        const options = {properties: {bde: 'yes'}};
        expect(composer(['--abc=456'], options)).toMatchObject({
            _:[],
            abc: 456,
            bde: 'yes'
        })
    })
    // possible breaking change.  previously xy was number, yet provided was a string.
    it('should override properties provided through options', () => {
        const options = {properties: {bde: 'yes', abc: '123', xy: '321'}};
        expect(composer(['--abc=456'], options)).toMatchObject({
            _:[],
            abc: 456,
            bde: 'yes',
            xy: '321'
        })
    });
    it('should strictly include only properties provided through options', () => {
        const options = {properties: {bde: 'yes', efg: true }, strict: true};
        const result = composer(['--abc=456'], options)
        expect(result).toMatchObject({
            bde: 'yes',
            efg: false
        })
        expect(result.abc).toBeUndefined();
        expect(result._).toBeUndefined();
    });
    // possible breaking change.  previously Abc was a string.
    it('should be able to ignore Case of the provided options', () => {
        const options = {properties: {Bde: 'yes', Abc: true }, strict: true, ignoreCase: true };
        const result = composer(['--abc=456'], options)
        expect(result).toMatchObject({
            Bde: 'yes',
            Abc: 456
        })
        expect(result.abc).toBeUndefined();
        expect(result._).toBeUndefined();
    });
    it('should be able to ignore Case of the provided options and add additional properties if strict is not defined.', () => {
        const options = {properties: {Bde: 'yes', Abc: true }, ignoreCase: true };
        const result = composer(['--abc=456', '--def=123'], options)
        expect(result).toMatchObject({
            _:[],
            def: 123,
            Bde: 'yes',
            Abc: 456
        })
        expect(result.abc).toBeUndefined();
    });
    it('should returnUndefinedObject if properties does not exist', () => {
        const options = {properties: {Bde: 'yes', Abc: true }, returnUndefinedObject: true };
        const result = composer(['--Bde=no'], options);
        expect(result).toMatchObject({
            Bde: 'no',
            Abc: {undefined: true}
        });
    });
    it('should include properties provided by means of a comma separated string', () =>{
        const options = { properties: 'abc, def'  };
        const result = composer(['--Bde=no', '--def'], options);
        expect(result).toMatchObject({
            Bde: 'no',
            abc: false,
            def: true
        });
    });
    it('should include properties provided by means of a comma separated string and returnUndefinedObject if set to true', () =>{
        const options = { properties: 'abc, def', returnUndefinedObject: true  };
        const result = composer(['--Bde=no', '--def'], options);
        expect(result).toMatchObject({
            Bde: 'no',
            abc: {undefined: true},
            def: true
        });
    });
    it('should include properties provided by means of a comma separated string that can be parsed the same way it will be parsed when provided through cli', () =>{
        const options = { properties: '-abc --def normalProperty', parseString: true, strict: true  };
        const result = composer(['--Bde=no', '--def', '-ac'], options);
        expect(result).toMatchObject({
            a: true,
            b: false,
            c: true,
            def: true,
            normalProperty: false
        });
        expect(result._).toBeUndefined();
    });
    it('should work with cli type string and returnUndefinedObject set to true', () =>{
        const options = { properties: '-abc --def normalProperty', returnUndefinedObject: true, parseString: true, strict: true  };
        const result = composer(['--Bde=no', '--def', '-ac'], options);
        expect(result).toMatchObject({
            a: true,
            b: {undefined: true},
            c: true,
            def: true,
            normalProperty: {undefined: true}
        });
        expect(result._).toBeUndefined();
    });
    it('should be able to receive an array of strings as option properties', () =>{
        const options = { properties: ['-abc', {}, [], true, '--def', 'normalProperty'], strict: true  };
        const result = composer(['--Bde=no', '--def', '-ac'], options);

        expect(result).toMatchObject({
            a: true,
            c: true,
            b: false,
            def: true,
            normalProperty: false
        });
        expect(result._).toBeUndefined();
    });
    it('should ignore option restriction if properties is set to boolean', () =>{
        const options = { properties: false, strict: true  };
        const result = composer(['--Bde=no', '--def', '-ac'], options);

        expect(result).toMatchObject({
            _:[],
            Bde: 'no',
            def: true,
            a: true,
            c: true
        });
        expect(result._).toBeDefined();
    });
    it('should ignore option restriction if properties is not properly set', () =>{
        const options = { properties: {}, strict: true  };
        const result = composer(['--Bde=no', '--def', '-ac'], options);

        expect(result).toMatchObject({
            _:[],
            Bde: 'no',
            def: true,
            a: true,
            c: true
        });
        expect(result._).toBeDefined();
    });
    // new
    it('should be able to pass a map for short properties only', () =>{
        const options = { map: {a: 'aProp', b: 'bProp'} };
        const result = composer(["-abc", "--a=123"], options);

        expect(result).toMatchObject({
            _:[],
            aProp: true,
            bProp: true,
            c: true,
            a:123
        });
    });
});