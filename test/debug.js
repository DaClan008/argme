import { argme } from "../index.js";
import { compileArgs } from "../src/compilers/compileArgs.js";
import { compileCliString } from "../src/compilers/compileCliString.js";

const result = compileArgs(["--'abc'=234", "-'a\"'"]);

console.log(result);