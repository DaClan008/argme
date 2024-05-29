# aragme
[![Unit Tests](https://github.com/DaClan008/argme/actions/workflows/testing.yml/badge.svg)](https://github.com/DaClan008/argme/actions/workflows/testing.yml)
![Coverage](https://img.shields.io/badge/code--coverage-20%-brightgreen?style=flat-square&logo=github)
[![npm](https://img.shields.io/npm/v/argme)](https://img.shields.io/npm/v/argme)
![npm](https://img.shields.io/npm/dw/argme)
![NPM](https://img.shields.io/npm/l/argme)

An argument parser for process.argv in node.js with optional settings.

By default, if any node app is started with some arguments i.e
```
node [myapp] -abc -d 5 -e true --property=value alternativeValues
```

U should be able to get a json object back that looks as follows, when calling the argme parser from [myapp].

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

### Conlsole log

The argme function is able to handle 2 optional parameters.  
- The first parameter can be undefined | [string](#passing-string-as-options) | [string[]](#passing-a-string-array) | [Options Object](#options)
- The second parameter can be undefined | [string](#passing-string-as-options) | [string[]](#passing-a-string-array)  | [Options Object](#options)

General Usage:

```js
import {argme} from "argme";

const args = argme();

// or

const options = {
    properties: {a: true, b: true, c: 'yes'},
    strict: true
}
const argOptions = argme(options);

console.log(args);
console.log(argOptions);
```

The result if the javascript initiated through the console with the following arguments:
```
    -a 5 -def=value
```

will produce the following result:

*console.log(args)*
```json
{
    "_": [],
    "a": 5,
    "def": "value"
}
```
and *console.log(argOptions)*
```json
{
    "a": 5,
    "b": false,
    "c": "yes"
}
```

You are also able to pass your own custom string array of options to the argme function in order to build a custom object.  For example:

```js
import {argme} from "argme";

const args = [
    "-ab", 
    "--property=value", 
    "otherObject" 
]

const parsed = argme(args);

// or

const options = {
    properties: {a: true, b: true, c: 'yes'},
    strict: true
}
const parsedOptions = argme(args, options);

console.log(args);
console.log(argOptions);

```
the output of the above will be

*parsed(args);*
```json
{
    "_": ["otherObject"],
    "a": true,
    "b": true,
    "property": "value"
}
```
*on parsedOptions(args)*
```json
{
    "a": true,
    "b": true, 
    "c": "yes"
}
```

### Passing String as Options

The string supplied should be in the same format as it would be to pass it on the cli.  e.g.
```js
import {argme} from 'argme';

const valueString = "-a --abc=yes";
const options = "~~map=a:alternative";

const result = argme(valueString, options);
console.log(result);

```

The result should output the following object:

```json
{
    "_":[],
    "alternative": true,
    "abc": 'yes'
}

```

Please note that one could use the options string value in place of the valueString in the above example if you would like to capture the cli provided variables.  For example (if "-a --abc=yes") was passed through the console when the javascript file was initiated, you could use:

```js
const result = argme(options);
console.log(result);
```

which will output the same as in the first example above under this sub-section.

### Passing a String Array

Similarly a string array can either be passed as the arguments set or as the options value.  For instance:

```js
import {argme} from 'argme';

const valueArray = ["-a", "--abc=yes"];
const options = ["~~map=a:alternative"];

const result = argme(valueArray, options);
console.log(result);

```

The result should output the following object:

```js
{
    _:[],
    alternative: true,
    abc: 'yes'
}

```
Please note that one could use the options Array in place of the valueString in the above example if you would like to capture the cli provided variables. For example (if "-a --abc=yes") was passed through the console when the javascript file was initiated, you could use:
```js
const result = argme(options);
console.log(result);
```
The above should render the same result as in the first example under this sub-section.

## Options

### Required property sets

The following set of options are available to ensure that a minimum set of ("required") properties is returned.  The available options are as follows

Property | Type | Description |
---------|------|-------|
properties | string \| object \| string[] | This sets out the **required** properties a result should have.  The **string** can be a comma separated list of properties, or it can be a similar string as what would be provided for in a cli call (i.e. -a --ab=123...),.  The array should be strictly a string array and the values can be similar to that which can be found in *process.argv*.  The object can be any type of object that is one level deep.
parseString | boolean | This is only applicable if properties is a type of **string**.  If set to true, the string composition looks similar to a string provided through a cli application (i.e. -a  -ab=123...) and will therefore have no '**,**'.  If not set, the string will be assumed to be a comma separated string.
ignoreCase | boolean | If set the name as specified in the properties object will always be used even if the supplied argument property is spelled the same but with different casing.  Therefore, if a property called "Abc" is required in terms of the properties option and the arguments passed has a property called "abc", the the property name returned will be "Abc" wit the value provided for by the arguments under property "abc".
strict | boolean | If set to true, the returned object's properties will be limited to those provided for by the options` properties property.
returnUndefinedObject | boolean | This is used when the required property in terms of properties option above is a type of boolean.  If no value is supplied in the arguments the default value returned will be false, unless this option is set to true, then a { undefined: true } object will be returned.

### Other Options

Additional to the above are the follwing:

Property | Type | Description |
---------|------|-------------|
ignoreDuplicates | boolean | If set  to true and a property is passed twice only the first encounter's value of that property will be logged to the returned object.  If set to false an array of values will be created.
duplicateOverride | boolean | If set to true and there are duplicate properties in a provided object, the last received value will replace the first received.  Similar to "ignoreDuplicates" above, if set to false an array of values will be created.
ignoreBooleanDuplicates | boolean | If set to true and there are duplicate properties in, the property whose value is a type of boolean will be ignored.
map | object \| string \| string[] | If set and short properties are used (i.e. -abc) which may produce an object for instance as {a: true, b: true, c: true}, the property names will be altered to what is provided for in the "map".  For instance in this example, if the map is set to {a: "alpha", b: "beta"} the result will be {alpha: true, beta: true, c: true}

## Expected Behavior

The following set of behaviors should be taken into consideration when using the argme function.

### Normal Properties

In string form this is represented by "--" prefix in-front of the item.  It usually is combined with an equal sign and the following is an example:

```
--property=value
```
if spaces are required to be used with the value object wrap the value within " or '.

The above example will render 
```json
{ property: "value" }
```
as an object passing it through the argme function.

#### -- Spaces --

Be cautious about spaces when providing properties.  For example:

```
--property=value
```
will produce 
```json
{ "_": [], "property": "value" }
```
while:
```
--property= value
```
will produce 
```json
{ "_": [ "value" ], "property": ""}
```

If there needs to be spaces all included as part of the value.  this should be wrapped in either ' or ".

For example
```
--property=some long value
```
will produce 
```json 
{ "_": ["long", "value"], "property": "some" }
```
while
```
--property="some long value"
```
will deliver
```json
{ "_": [], "property": "some long value" }
```

#### -- Equal --

If no equal is used with a normal property, e.g.:

```
--property
```
the return value will be 
```json
{"_": ["value"], "property": true}
```

### Short Properties

Short properties are indicated by a single -.  The general behavior is that a property will be created for each letter in that is combined with the - sing.  Therefore:

```
-abc
```
will deliver
```json
{ "a": true, "b": true, "c": true }
```

there are a few exceptions:

#### -- Bool or Number exception --

If a short property is followed by a number, the number will be attributed to each property in that set.  For example

```
-ab5
```
will deliver:
```json
{ "_": [], "a": 5, "b": 5 }
```

If a short property only exist of 1 property and is followed by a space and a number or a boolean.  The number or boolean is attributed to that short property.  For example:

```
-a 200 -b false
```
will deliver:
```json
{ "_": [], "a": 200, "b": false }
```

#### -- Equal Exception --

If a short property is followed by an equal sign without any spaces, this short property is treated as an normal property.  For example:

```
-abc="some value"
```
will deliver:
```json
{ "_": [], "abc": "some value" }
```

### Json Properties

If the value of any object is in Json format, such value should be indicated by prefixing the property name with ~~.  For example:
```
~~prop="{a: true, b: false, c: 'other'}"
```
will deliver
```json
{ "_": [], "prop": { "a": true, "b": false, "c": "other" } }
```

Remember to wrap the text in " or ' if it is produced through the cli, else the property will be split up with every space.

You can also ignore the starting and ending brackets if the property is specified as a jsonObject.  Therefore the following should produce the sme result

```
~~prop="a: true, b: false, c: 'other'"
```
You should also be able to add additional jsonObjects or arrays within the property set.  However we advise to be cautious and test each result as this is suppose to be a more flat structure.  You should therefore be able to do the following:
```
~~prop="a: true, b: ['some value', 'other value'], d:{ obj: true}"
```
The above should produce an object similar to:

```json
{  
    "_": [],
    "prop": { "a": true, "b": [ "some value", "other value" ], "d": { "obj": true } }
}
```

### Array Properties

If the value of any object should be an array, there are 2 solutions to follow.  The first is to use an Array Property as in the following example:
```
~arr="['a', 'b', 'c']"
```
This should produce the following result.
```json
{
    "_": [], "arr": [ "a", "b", "c" ] 
}
```
In the above example one could also remove the opening and closing brackets from the value, for example:
```
~arr="'a','b','c'"
```
OR
```
~arr="a, b, c"
```
The above 2 examples should all produce the same result.

You should also be able to add jsonObject and or other Arrays withing the array object.  For example:

```
~arr="a, {b: obj}, [c, d]"
```
Should render the following result:
```json
{ 
    "_": [], 
    "arr": [ 
        "a", 
        { 
            "b": "obj" 
        }, 
        [ "c", "d" ] 
    ] 
}
```

Another way to add arrays to an object is by repeating property names.  For instance:

```
--a=first --a=second -a 5  ~a='' ~~a=
```
should produce the following:

```json
{ 
    "_": [], 
    "a": [ 
        "first", 
        "second", 
        5, 
        [], 
        {} 
    ] 
}
```

This behavior can be overridden by adding [Options](#options) object.

### Passing String Array

The string array is a compilation of the above values.  Please note that none of the strings in the string array will go through the cli string compiler and should resemble a property set as a whole.  Therefore it should be in the form of [type][property]=[value].  or [property].  Where type is as explained above either - or -- or ~ or ~~ or NONE.  if no type is supplied, the argme function will not attempt to determine if there is a = or not.

The only exceptoin to the above rule is if the type is set to be a jsonObject by the use of ~~.  In this you could use ~~[property]:[value].  However within the value section only : is used as property value separators.

### Passing No Value

Should you pass --[property] with no equal and no value, the result will be a property with the value set to true.

Should you pass --[property]= with no value, the result will be a property with an empty string as value.  Therefore:

```
--a --b=
```
will produce:
```json
{ 
    "_": [], "a": true, b: "" 
}
```

### Working with Strings

In order to create a consistent experience between entering string values to the argme function from javascript and from receiving arguments from the CLI we have created a CLI string compiler.  Please note the CLI string compiler is only applicable when strings are passed to the argme function and not when an array of strings is passed.

The purpose of the CLI string compiler is to split each string up between different property sets ([property]=[value]) and will produce a string array of such values.  The string is usually split between every use of a space (' ') unless such space is encapsulated between quotes (' or ").  The obvious problem occurs when one needs to use a quote (either ' or ") within another quote.  First of, if a quote starts with " then all " is removed from that string segment, therefore ' should be used inside ".  So also when a quote starts with ' then all ' is removed from that string segment, therefore " should be used inside '.

There are some odd behaviors when it comes to these quotes that are used within the cli.  For instance:

- One should think that escaping a quote **"-a\"b"** should be allowed but it is **not allowed** using cli tool, however in Javascript this will return **"-ab"**.
- What is however allowed is **"-a\""b"**.  This delivers the expected **-a"bc** value.
- However the above is only the case if there are no space between the last " and the b in the above example.  If one would type **-a\"" b"** the result will be **['-a"', 'b' ]**.  Therefore the general rule will apply that if there are no spaces then it is considered one and the same string.  So the last quote, after the b can be ignored.
- The above also mean that **"-a\""b cd"** will produce **['-a"b', 'cd']** i.e. not as one value set.
- However, should the escape be preceded by a space, the behavior is different.  **"-a \""b cd"** will produce **-a "b cd** or **"-a \"" b cd"** will produce **-a "b cd**.

As explained above, all quotes that are similar to the starting quote is removed from a string.  Therefore in **-a"b"='cd e'**  will produce the following result:  **-ab=cd e**.  But **"ab'cd' 'ef' 'g'"** will produce: **ab'cd' 'ef' 'g'**.

It is for this reason that should one pass from javascript a string representing a similar instance as above, the same behavior should be expected.

** Please Note**:  When using escapes in javascript, a double escape need to be supplied in the above examples to have a similar result.

### Special Properties

Should you wish to add an Options object from a single line entry, this can be done by using the --^ property type as follows:
```
-abc  --^='~~map="{a: alpha, b: beta}"'
```
This should produce the following result:
```json
{
  "_": [],
  "alpha": true,
  "beta": true,
  "c": true,
  "^": "~~map=\"{a: alpha, b: beta}\""
}
```

You should take care to set the quotes properly on each "value" portion of each property.  Passing any string to argme function will either go through the node cli compiler that will convert it to a string array, or alternatively through our build in cli string compiler which attempts to create a similar experience to that of the node CLI compiler.  Please refer to [working with strings](#working-with-strings) above for more details.  One should also bear in mind that in our example above the "options property will go through the cli compiler twice.  First to get the options property --^... and then to get the options object (string currently represented by ~~map=....). 

It might therefore be better and easier to pass pass the options variable as a jsonObject and prevent over complicating the use of quotes.  The following is therefore a better solution:

```
-abc ~~^:"{map:{a: alpha, b: beta}}"
```

This should deliver the same result as shown above.

## CLI vs JS strings

Please note that the argme function will attempt to match the behavior of the node cli when passing a string value from Javascript.  Please refer to [working with strings](#working-with-strings) above for more details.

Furthermore note that where single escapes may be used on the cli, in javascript a double \\ is necessary to match the behavior.

## Deprecated Methods

The following methods are depricated from Version 2 onwards and internally calls the "argme" function.

### parse

**parse** function was previously used when no value would be passed to the function, or alternatively an options object. e.g.

```js
import {parse} from 'argme';

const noParams = parse();
const withOptions = parse({properties: 'a'});
```

This has now been replaced by argme and both these options can be called as follows:

```js
import {argme} from 'argme';

const noParams = argme();
const withOptions = argme({properties: 'a'});
```


### parseArgs

The **parsArgs** method was previously used when a different property set is supplied with or without an optoins object.  Therefore it is a method that one could use to pass through your own set of values instead of those provided for through the cli (*process.argv*).  e.g.

```js
import {parseArgs} from 'argme';

const customProps = parseArgs(["--prop=value"]);
// or
const customPropsOptions = parseArgs(["--prop=value"], {properties: "prop"});

```

This has now been replaced by argme and both these options can be called as follows:

```js
import {argme} from 'argme';

const customProps = argme(["--prop=value"]);
// or
const customPropsOptions = argme(["--prop=value"], {properties: "prop"});

```


