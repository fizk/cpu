import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";
import Lexer from '../src/Lexer.ts';
import Parser from '../src/Parser.ts';

Deno.test("PARSER - comment", () => {
    const program = `
        ; This is a comment
    `;

    const lexer = new Lexer(program);
    const tokens = lexer.parse();
    const symbols = lexer.symbols;
    const parser = new Parser();
    const tree = parser.parse(tokens, symbols);

    // console.dir(tree, {depth: 10000});
    // console.dir(symbols, {depth: 10000});

    assertEquals(tree.statements.length, 0);
});

// Deno.test("LDA - Immediate", () => {
//     const program = `
//         ; Immediate
//         LDA #$10

//         ; Absolute
//         LDA $10

//         ; Absolute,X
//         LDA $10, X

//         ; Absolute,Y
//         LDA $10, Y
//     `;

//     const parser = new Parser();
//     const lexer = new Lexer(program);
//     const tokens = lexer.parse();
//     const symbols = lexer.symbols;
//     parser.parse(tokens, symbols);

//     console.dir(parser.error);
//     assertEquals(parser.error.length, 0);
// });
