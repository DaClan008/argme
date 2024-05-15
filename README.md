[![Unit Tests](https://github.com/DaClan008/argme/actions/workflows/testing.yml/badge.svg)](https://github.com/DaClan008/argme/actions/workflows/testing.yml)
[![npm](https://img.shields.io/npm/v/argme)](https://img.shields.io/npm/v/argme)
![npm](https://img.shields.io/npm/dw/argme)
![NPM](https://img.shields.io/npm/l/argme)

# aragme
An argument parser for process.argv in node.js with optional settings.

By default, if any node app is started with some arguments i.e
```
node [myapp] -abc -d 5 -e true --property=value alternativeValues
```

U should be able to get a json object back that looks as follows, when using the aragme parser.

```json
{
    "_": ["alternativeValues"],
    "a": true,
    "b": true,
    "c": true,
    "d": 5,
    "e": true,
    "property": "value"
   
}
```

## Install

Install the module through the console, and in the desired folder containing a package.json file as follows.

```
npm install argme
```

## Usage

General Usage

```js
import {parse} from "argme";

const args = parse();

// or

const options = {
    properties: {a: true, b: true, c: 'yes'},
    strict: true
}
const argOptions = parse(options);

console.log(args);
console.log(argOptions);
```

The result if the program was started with the following arguments:
```
    -a -def=value
```

will deliver the following result:

```json
// console.log(args)
{
    "_": [],
    "a": true,
    "def": "value"
}
// console.log(argOptions)
{
    "a": true,
    "b": false,
    "c": "yes"
}
```

An alternative method will be to use **parseArgs** instead of **parse**.  By using this method you are able to pass through any array of arguments and options.


### parse method

If the parse method is passed without options, all the properties provided will be returned.  An example is set out above.

### parseArgs

parseArgs is very similar to parse method, however you can provide any string array as a starting argument set and the process.argv will be ignored.

```js
import {parseArgs} from "argme";

const args = [
    "-ab", 
    "--property=value", 
    "otherObject" 
]

const parsed = parseArgs(args);

// or

const options = {
    properties: {a: true, b: true, c: 'yes'},
    strict: true
}
const parsedOptions = parse(args, options);

console.log(args);
console.log(argOptions);

```
the output of the above will be

```json
// on parsed(args);
{
    "_": ["otherObject"],
    "a": true,
    "b": true,
    "property": "value"
}
// on parsedOptions(args)
{
    "a": true,
    "b": true, 
    "c": "yes"
}
```
## Options

Options are there to ensure that the returned object contain a minimum set of "required" properties.  The available options are as follows

Property | Type | Description |
---------|------|-------|
properties | string \| object \| string[] | This sets out the minimum properties a result should have.  This is **required** property.  The **string** can be a comma separated list of properties, or it can be a similar string as what would be provided for in a cli call (i.e. -a --ab=123...),.  The array should be strictly a string array and the values can be similar to that which can be found in *process.argv*.  The object can be any type of object that is one level deep.
parseString | boolean | This is only applicable if properties is a type of **string**.  If set to true, the string composition looks similar to a string provided through a cli application (i.e. -a  -ab=123...) and will therefore have no '**,**'.  If not set, the string will be assumed to be a comma separated string.
ignoreCase | boolean | If set the name as specified in the properties object will always be used even if the supplied argument property is spelled the same but with different casing.  Therefore, if a property called "Abc" is required in terms of the properties option and the arguments passed has a property called "abc", the the property name returned will be "Abc" wit the value provided for by the arguments under property "abc".
strict | boolean | If set to true, the returned object's properties will be limited to those provided for by the options` properties property.
returnUndefinedObject | boolean | This is used when the required property in terms of properties option above is a type of boolean.  If no value is supplied in the arguments the default value returned will be false, unless this option is set to true, then a { undefined: true } object will be returned.

All options except the properties option is optional.  Therefore the default values of all is set to false.
