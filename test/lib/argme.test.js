import { describe, expect, it} from 'vitest';
import { buildArgs, composer } from '../../src/lib/main';

describe('buildArgs', () => {
    it('should set short name values to the following provided number or boolean', () => {
        const result = buildArgs(['-a', '4', '-b', '0.3', '-c', 'someOtherText', '-y', 'true', '-z', 'false']);
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
        const result = buildArgs(['-abc520.2', '-de', '6']);
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
        const result = buildArgs(['-abc=SomeValue', 'someOtherText'])
        expect(result).toMatchObject({
            _:['someOtherText'],
            abc: 'SomeValue'
        })
    });
    it('should add non property indicated values to array', () => {
        const result = buildArgs(['-a', '5', '-b', 'value', 'value2']);
        expect(result).toMatchObject({
            _:['value', 'value2'],
            a: 5, 
            b: true
        });

    });
    // possible breaking chang - previous def returned a string value
    it('should be able to add proper long properties', () => {
        const result = buildArgs(['--abc=baz', '--def=true']);
        expect(result).toMatchObject({
            _:[],
            abc: 'baz',
            def: true
        })
    });
    it('should be able to add booleans and numbers following property names', () => {
        const result = buildArgs(['--abc', 'FaLse', '--d', '6.2', '--e']);
        expect(result).toMatchObject({
            _:[],
            abc: false,
            d: 6.2,
            e: true
        });
    });
    it('should disallow _ to be used as full property', () => {
        const result = buildArgs(['--_=3', '--a' ]);
        expect(result).toMatchObject({
            _:[],
            a: true
        });
    });
    it('should ignore _ or - inside short properties', () => {
        const result = buildArgs(['-a-b', '-d_e']);
        expect(result).toMatchObject({
            _:[],
            a: true,
            b: true,
            d: true,
            e: true
        })
    });
    it('should ignore empty standing -', () => {
        const result = buildArgs(['-a', '5', '-b', '-', '7.5', '-c', '--', 'true', '-d', 'TrUe']);
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
        const result = buildArgs(["--'abc'=234", "-'a\"'"]);
        expect(result).toMatchObject({
            _:[],
            abc: 234,
            'a"': true
        })
    });
    it('should deal with quotes at odd places within short properties', () => {
        const result = buildArgs(["-a'bc=234", "-xy'z", '-d\"', "-a'_"]);
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
        const result = buildArgs(["~~abc={a:true, b: 'someVal', c: { x: 123 }}"]);
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
        const result = buildArgs(["~abc=abc, def, {x:2}, xyz"]);
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
        const result = buildArgs(["-a", "-a", "-a", "prop", "prop", "prop"]);
        expect(result).toMatchObject({
            _: ["prop", "prop", "prop"],
            a: true
        })
    });
    it('should add an array by adding duplicate items with value', () => {
        const result = buildArgs(["-a", "-a=1", "-a=2", "-a='true'", "--b='true'", "--b=5", "--b='someval'"]);
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
        const result = buildArgs(["-a", "-a=1", "-a=2", "-a='true'", "--b='true'", "--b=5", "--b='someval'"], {ignoreDuplicates: true});
        expect(result).toMatchObject({
            _: [],
            a: true,
            b: 'true'
        })
    });
    it('should keep last set value if duplicateOverride option is used', () => {
        const result = buildArgs(["-a", "-a=1", "-a=2", "-a='true'", "--b='true'", "--b=5", "--b='someval'"], {duplicateOverride: true});
        expect(result).toMatchObject({
            _: [],
            a: 'true',
            b: 'someval'
        })
    });
});
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
        console.log(result);
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
        console.log(result);
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