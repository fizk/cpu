// import { strict as assert } from 'assert';
// import PATTERNS from './patterns.js';

// const tests = [
//     ['PATTERNS.LABEL', () => {
//         const one = 'label:';
//         assert.ok(one.match(PATTERNS.LABEL));

//         const two = '_label:';
//         assert.ok(two.match(PATTERNS.LABEL));

//         const three = '_label:';
//         assert.ok(three.match(PATTERNS.LABEL));

//         const four = '_label1:';
//         assert.ok(four.match(PATTERNS.LABEL));

//         const five = '_label2_:';
//         assert.ok(five.match(PATTERNS.LABEL));

//         // - - - - - - - - - - - - - - - - - -
//         const six = '1label:';
//         assert.ok(!six.match(PATTERNS.LABEL));

//         const seven = 'label';
//         assert.ok(!seven.match(PATTERNS.LABEL));

//     }],
//     ['PATTERNS.LABEL', () => {
//         const _01 = 'label: LDA';
//         assert.ok(_01.match(PATTERNS.INSTRUCTION));

//         const _02 = 'label:     LDA';
//         assert.ok(_02.match(PATTERNS.INSTRUCTION));

//         const _03 = 'label: LDA another_label'; //label
//         assert.ok(_03.match(PATTERNS.INSTRUCTION));

//         const _04 = 'label: LDA #100'; //value
//         assert.ok(_04.match(PATTERNS.INSTRUCTION));

//         const _05 = 'label: LDA #100'; //value
//         assert.ok(_05.match(PATTERNS.INSTRUCTION));

//         const _06 = 'label: LDA $123'; //hex
//         assert.ok(_06.match(PATTERNS.INSTRUCTION));

//         const _07 = 'label: LDA 123H'; //hex
//         assert.ok(_07.match(PATTERNS.INSTRUCTION));

//         const _08 = 'LDA TMP+2'; //add to label
//         assert.ok(_08.match(PATTERNS.INSTRUCTION));

//         // const _09 = 'LDA $AF00+2'; // add to number
//         // assert.ok(_09.match(PATTERNS.OPCODE));

//         const _10 = 'LDA subrutine'; // jump
//         assert.ok(_10.match(PATTERNS.INSTRUCTION));

//         // - - - - - - - - - - - - - - - - - -
//         const __01 = 'label LDA';
//         assert.ok(!__01.match(PATTERNS.INSTRUCTION));

//         const __02 = 'label:';
//         assert.ok(!__02.match(PATTERNS.INSTRUCTION));

//     }],
//     ['stuff', () => {
//         console.log('label: LDA #123'.match(PATTERNS.INSTRUCTION));
//     }]
// ];


// tests.forEach(([name, test]) => {
//     try {
//         test();
//         console.log(`- - - ${name} - - - - - OK`);
//     } catch (e) {
//         console.log(`- - - ${name} - - - - - ERROR`);
//         console.log(`- expected`);
//         console.log(e.expected);
//         console.log(`- actual`);
//         console.log(e.actual);
//         console.log(e);
//     }
// })