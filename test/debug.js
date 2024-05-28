import { compileValue } from "../src/compilers/compileValue.js";
import { propertyType } from "../src/helpers/constants.js";
import { compileArgs } from "../src/compilers/compileArgs.js";
import { argme } from "../index.js";
import { compileRequiredProperties, buildMap } from "../src/compilers/compileOptions.js";

const result = compileArgs(["--'a\\'bc'=234", "-'a\"'"]);

console.log(result);

// console.log("abcd".substring(1, 3));