import { describe, expect, it} from 'vitest';
import { argme } from '../index.js';

describe('argme - index.js', () => {
    it('should return empty object if no values is supplied', () => {
        const result = argme();
        expect(result).toMatchObject({_:[]});
    });
    it('should return an object with arguments passed from cli if no values is supplied', () => {
        process.argv.push('-abc');
        const result = argme();
        expect(result).toMatchObject({
            _: [],
            a: true,
            b: true,
            c: true 
        });
        process.argv.splice(2, process.argv.length - 2);
    });
    it('should accept a string as options variable', () => {
        process.argv.push('-abc');
        const result = argme(undefined, "~~map:'a: abc'");
        expect(result).toMatchObject({
            _: [],
            abc: true,
            b: true,
            c: true 
        });
        process.argv.splice(2, process.argv.length - 2);
    });
    it('should accept a string Array as options variable', () => {
        process.argv.push('-abc');
        const result = argme(["~~map:'a: abc'"]);
        expect(result).toMatchObject({
            _: [],
            abc: true,
            b: true,
            c: true 
        });
        process.argv.splice(2, process.argv.length - 2);
    });
    it('should accept a object as options', () => {
        process.argv.push('-abc');
        process.argv.push('def');
        const result = argme({map:{a: 'abc'}});
        expect(result).toMatchObject({
            _: ['def'],
            abc: true,
            b: true,
            c: true 
        });
        process.argv.splice(2, process.argv.length - 2);
    });
    it('should accept a string Array as object values if no cli parameters has been passed', () => {
        const result = argme(["~~map:'a: abc'"]);
        expect(result).toMatchObject({
            _: [],
            map: {a: 'abc'} 
        });
    });
    it('should accept a string values if no cli parameters has been passed', () => {
        const result = argme("~~map:'a: abc' def");
        expect(result).toMatchObject({
            _: ['def'],
            map: {a: 'abc'} 
        });
    });
    it('should accept a string options if cli parameters has been passed', () => {
        process.argv.push('-abc');
        const result = argme("~~map:'a: abc'");
        expect(result).toMatchObject({
            _: [],
            abc: true,
            b: true,
            c: true 
        });
        process.argv.splice(2, process.argv.length - 2);
    });
    it('should returned the passed variables as an object if it is similar to an options object and the supplied argv options is defective.', () => {
        process.argv.push('--');
        const result = argme("~~map:'a: abc'");
        expect(result).toMatchObject({
            _: [],
            map: {a: 'abc'} 
        });
        process.argv.splice(2, process.argv.length - 2);
    });
    it('should return the supplied object if cli parameters is set and supplied object is not a type of options object', () => {
        process.argv.push('-abc');
        const result = argme("~~def:'a: abc'");
        expect(result).toMatchObject({
            _: [],
            def: {a: 'abc'}
        });
        process.argv.splice(2, process.argv.length - 2);
    });
    it('should accept a string options and string args property', () => {
        const result = argme('-abc', "~~map:'a: abc'");
        expect(result).toMatchObject({
            _: [],
            abc: true,
            b: true,
            c: true 
        });
    });
    it('should accept a string array where * property is arg and ^ is options', () => {
        const result = argme(["--*=-abc", "--^=~~map='a: abc'"]);
        expect(result).toMatchObject({
            _: [],
            abc: true,
            b: true,
            c: true 
        });
    });
})