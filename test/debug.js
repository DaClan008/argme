import { compileValue } from "../src/compilers/compileValue.js";
import { propertyType } from "../src/helpers/constants.js";
import { compileArgs } from "../src/compilers/compileArgs.js";
import { argme } from "../index.js";
import { compileRequiredProperties, buildMap } from "../src/compilers/compileOptions.js";
import { compileCliString } from "../src/compilers/compileCliString.js";
import { propertySplit } from "../src/helpers/propertySplit.js";


const options = {
    properties: {a: true, b: true, c: 'yes'},
    strict: true
}
const args = [
    "-ab", 
    "--property=value", 
    "otherObject" 
]
const result = argme('~arr="\'a\', \'b\', \'c\'"');

console.log(result);

// const val = process.argv.slice(2);
// console.log(val);
// const a = compileArgs(val);
// const b =compileArgs([a["^"]]);
// console.log(a);

// console.log(b);
// // // console.log(compileCliString(' abc -pb --a"bc=234" a"b\\"d"c a="b\"c" a=b"c\" d"'))
// console.log(compileCliString("-abc  --^='~~map=\"{a: alpha, b: beta}\"'"));
// console.log(propertySplit('--^=~~map="{a: alpha, b: beta}"'))
// console.log(argme('~~map="{a: alpha, b: beta}"'));