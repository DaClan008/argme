import { describe, expect, it} from 'vitest';
import { argme, parse, parseArgs } from '../index.js';
import { compileCliString } from '../src/compilers/compileCliString.js';

describe("integration test", () => {
    it('Should work for default examples.', () => {
        const options = {
            properties: {a: true, b: true, c: 'yes'},
            strict: true
        }
        process.argv.push(...["-a", 5, "-def=value"]);
        let result = argme();
        expect(result).toMatchObject({
            "_": [],
            "a": 5,
            "def": "value"
        });

        result = argme(options);
        expect(result).toMatchObject({
            "a": 5,
            "b": false,
            "c": "yes"
        });

        const args = [
            "-ab", 
            "--property=value", 
            "otherObject" 
        ]
        result = argme(args);
        expect(result).toMatchObject({
            "_": ["otherObject"],
            "a": true,
            "b": true,
            "property": "value"
        })
        result = argme(args, options);
        expect(result).toMatchObject({
            "a": true,
            "b": true,
            "c": "yes"
        })
        process.argv.splice(2);
    });
    it('Should work for string options', () => {
        const valueString = "-a --abc=yes";
        const options = "~~map=a:alternative";

        let result = argme(valueString, options);

        expect(result).toMatchObject({
            _:[],
            alternative: true,
            abc: 'yes'
        });

        process.argv.push("-a", "--abc=yes");

        result = argme(options);
        expect(result).toMatchObject({
            "_":[],
            "alternative": true,
            "abc": 'yes'
        });
        process.argv.slice(2);
    });
    it('Should work for string Arrays', () => {
        const valueArray = ["-a", "--abc=yes"];
        const options = ["~~map=a:alternative"];

        let result = argme(valueArray, options);

        expect(result).toMatchObject({
            _:[],
            alternative: true,
            abc: 'yes'
        });

        process.argv.push("-a", "--abc=yes");

        result = argme(options);
        expect(result).toMatchObject({
            "_":[],
            "alternative": true,
            "abc": 'yes'
        });
        process.argv.slice(2);
    });
    it('Should work for Normal Properties', () => {
        let result = argme("--property=value");

        expect(result).toMatchObject({
            _:[],
            property: 'value'
        });
        result = argme("--property= value");

        expect(result).toMatchObject({
            _:["value"],
            property: ''
        });
        
        result = argme("--property=some long value");

        expect(result).toMatchObject({
            _:["long", "value"],
            property: 'some'
        });
        
        result = argme("--property=\"some long value\"");

        expect(result).toMatchObject({
            _:[],
            property: 'some long value'
        });

        result = argme("--property");
        expect(result).toMatchObject({
            _:[],
            property:true
        })
    });
    it("should work for short properties", () => {
        let result = argme('-ab5');

        expect(result).toMatchObject({
            "_": [], "a": 5, "b": 5
        })

        
        result = argme('-a 200 -b false');

        expect(result).toMatchObject({
            "_": [], "a": 200, "b": false
        })
        
        result = argme('-abc="some value"');

        expect(result).toMatchObject({
            "_": [], "abc": "some value"
        })
    });
    it("should work for json properties", () => {
        let result = argme('~~prop="{a: true, b: false, c: \'other\'}"');

        expect(result).toMatchObject({
            "_": [], "prop": { "a": true, "b": false, "c": "other" }
        })

        result = argme('~~prop="a: true, b: false, c: \'other\'"');

        expect(result).toMatchObject({
            "_": [], "prop": { "a": true, "b": false, "c": "other" }
        })
        
        result = argme('~~prop="a: true, b: [\'some value\', \'other value\'], d:{ obj: true}"');

        expect(result).toMatchObject({
            "_": [],
            "prop": { "a": true, "b": [ "some value", "other value" ], "d": { "obj": true } }
        })
    });
    it("should work for array properties", () => {
        let result = argme('~arr="[\'a\', \'b\', \'c\']"');

        expect(result).toMatchObject({
            "_": [], "arr": [ "a", "b", "c" ] 
        });

        result = argme('~arr="\'a\', \'b\', \'c\'"');

        expect(result).toMatchObject({
            "_": [], "arr": [ "a", "b", "c" ] 
        });
        
        result = argme('~arr="a, b, c"');

        expect(result).toMatchObject({
            "_": [], "arr": [ "a", "b", "c" ] 
        });
        
        result = argme('~arr="a, {b: obj}, [c, d]"');

        expect(result).toMatchObject({
            "_": [], 
            "arr": [ 
                "a", 
                { 
                    "b": "obj" 
                }, 
                [ "c", "d" ] 
            ] 
        });
        
        result = argme('--a=first --a=second -a 5  ~a=\'\' ~~a=');

        expect(result).toMatchObject({
            "_": [], 
            "a": [ 
                "first", 
                "second", 
                5, 
                [], 
                {} 
            ] 
        });
    })
    it("should work with passing no values", () => {
        let result = argme('--a --b=');

        expect(result).toMatchObject({
            "_": [], "a": true, b: "" 
        });
    })
    it("should conform to cli type strings", () => {
        let result = compileCliString('"-a\"b"');

        expect(result).toMatchObject([
            '-ab'
        ]);

        result = compileCliString('"-a\\""b"');

        expect(result).toMatchObject([
            '-a"b'
        ]);

        result = compileCliString('"-a\\"" b"');

        expect(result).toMatchObject([
            '-a"', 'b'
        ]);

        result = compileCliString('"-a\\""b cd"');

        expect(result).toMatchObject([
            '-a"b', 'cd'
        ]);

        result = compileCliString('"-a \\""b cd"');

        expect(result).toMatchObject([
            '-a "b cd'
        ]);

        result = compileCliString('"-a \\"" b cd"');

        expect(result).toMatchObject([
            '-a " b cd'
        ]);

        result = compileCliString('-a"b"=\'cd e\'');

        expect(result).toMatchObject([
            '-ab=cd e'
        ]);

        result = compileCliString('"ab\'cd\' \'ef\' \'g\'"');

        expect(result).toMatchObject([
            "ab'cd' 'ef' 'g'"
        ]);
    });
    it("should be able to deal with special properties", () => {
        let result = argme('-abc  --^=\'~~map="{a: alpha, b: beta}"\'');

        expect(result).toMatchObject({
            "_": [],
            "alpha": true,
            "beta": true,
            "c": true,
            "^": "~~map=\"{a: alpha, b: beta}\""
        });

        result = argme('-abc ~~^:"{map:{a: alpha, b: beta}}"');

        expect(result).toMatchObject({
            "_": [],
            "alpha": true,
            "beta": true,
            "c": true,
            "^": {map:{a: "alpha", b: "beta"}}
        });
    });

    it("should be ble to use old parse functions", () => {
        process.argv.push("-a");

        expect(parse()).toMatchObject(argme());
        expect(parse({properties: 'a'})).toMatchObject(argme({properties: 'a'}));

        expect(parseArgs(["--prop=value"])).toMatchObject(argme(["--prop=value"]))
        expect(parseArgs(["--prop=value"], {properties: "prop"})).toMatchObject(argme(["--prop=value"], {properties: "prop"}))

        process.argv.slice(2);
    })
})