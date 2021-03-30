import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";
import Lexer from '../src/parser/Lexer.ts';
import Parser, { PseudoOperationAssignment} from '../src/parser/Parser.ts';

Deno.test("ASSIGNMENT - IDENTIFIER > '=' > NUMBER", () => {
    const program = `
        ; This is a comment

        ID = $aabbcc
    `;

    const lexer = new Lexer(program);
    const tokens = lexer.parse();
    const symbols = lexer.symbols;
    const parser = new Parser();
    const tree = parser.parse(tokens, symbols);

    // console.dir(tree, {depth: 10000});
    // console.dir(symbols, {depth: 10000});

    assertEquals(tree.statements.length, 1);
    assertEquals(tree.statements[0].error.length, 0);
    assertEquals((tree.statements[0] as PseudoOperationAssignment).data, 0xaabbcc);
    assertEquals((tree.statements[0] as PseudoOperationAssignment).operator, '=');
    assertEquals((tree.statements[0] as PseudoOperationAssignment).value, '$aabbcc');
    assertEquals((tree.statements[0] as PseudoOperationAssignment).label, 'ID');
});

Deno.test("ASSIGNMENT - IDENTIFIER > '=' > IDENTIFIER", () => {
    const program = `
        ; This is a comment

        ID1 = ID2
    `;

    const lexer = new Lexer(program);
    const tokens = lexer.parse();
    const symbols = lexer.symbols;
    const parser = new Parser();
    const tree = parser.parse(tokens, symbols);

    // console.dir(tree, {depth: 10000});
    // console.dir(symbols, {depth: 10000});

    assertEquals(tree.statements.length, 1);
    assertEquals(tree.statements[0].error.length, 0);
    assertEquals((tree.statements[0] as PseudoOperationAssignment).data, null);
    assertEquals((tree.statements[0] as PseudoOperationAssignment).operator, '=');
    assertEquals((tree.statements[0] as PseudoOperationAssignment).value, 'ID2');
    assertEquals((tree.statements[0] as PseudoOperationAssignment).label, 'ID1');
});

Deno.test("ASSIGNMENT - IDENTIFIER > '.equ' > IDENTIFIER", () => {
    const program = `
        ; This is a comment

        ID1 .equ ID2
    `;

    const lexer = new Lexer(program);
    const tokens = lexer.parse();
    const symbols = lexer.symbols;
    const parser = new Parser();
    const tree = parser.parse(tokens, symbols);

    // console.dir(tree, {depth: 10000});
    // console.dir(symbols, {depth: 10000});

    assertEquals(tree.statements.length, 1);
    assertEquals(tree.statements[0].error.length, 0);
    assertEquals((tree.statements[0] as PseudoOperationAssignment).data, null);
    assertEquals((tree.statements[0] as PseudoOperationAssignment).operator, 'EQU');
    assertEquals((tree.statements[0] as PseudoOperationAssignment).value, 'ID2');
    assertEquals((tree.statements[0] as PseudoOperationAssignment).label, 'ID1');
});

Deno.test("ASSIGNMENT - IDENTIFIER > '=' > '*'", () => {
    const program = `
        ; This is a comment

        ID = *
    `;

    const lexer = new Lexer(program);
    const tokens = lexer.parse();
    const symbols = lexer.symbols;
    const parser = new Parser();
    const tree = parser.parse(tokens, symbols);

    // console.dir(tree, {depth: 10000});
    // console.dir(symbols, {depth: 10000});

    assertEquals(tree.statements.length, 1);
    assertEquals(tree.statements[0].error.length, 0);
    assertEquals((tree.statements[0] as PseudoOperationAssignment).data, null);
    assertEquals((tree.statements[0] as PseudoOperationAssignment).operator, '=');
    assertEquals((tree.statements[0] as PseudoOperationAssignment).value, '*');
    assertEquals((tree.statements[0] as PseudoOperationAssignment).label, 'ID');
});

Deno.test("ASSIGNMENT - IDENTIFIER > '=' > '*' > '+8'", () => {
    const program = `
        ; This is a comment

        ID = *+8
    `;

    const lexer = new Lexer(program);
    const tokens = lexer.parse();
    const symbols = lexer.symbols;
    const parser = new Parser();
    const tree = parser.parse(tokens, symbols);

    // console.dir(tree, {depth: 10000});
    // console.dir(symbols, {depth: 10000});

    assertEquals(tree.statements.length, 1);
    assertEquals(tree.statements[0].error.length, 0);
    assertEquals((tree.statements[0] as PseudoOperationAssignment).data, null);
    assertEquals((tree.statements[0] as PseudoOperationAssignment).operator, '=');
    assertEquals((tree.statements[0] as PseudoOperationAssignment).value, '*');
    assertEquals((tree.statements[0] as PseudoOperationAssignment).label, 'ID');
    assertEquals((tree.statements[0] as PseudoOperationAssignment).modifier, '+');
    assertEquals((tree.statements[0] as PseudoOperationAssignment).modification, 8);
});

Deno.test("ASSIGNMENT - IDENTIFIER > '=' > OPCODE |> error", () => {
    const program = `
        ; This is a comment

        ID = LDA
    `;

    const lexer = new Lexer(program);
    const tokens = lexer.parse();
    const symbols = lexer.symbols;
    const parser = new Parser();
    const tree = parser.parse(tokens, symbols);

    // console.dir(tree, {depth: 10000});
    // console.dir(symbols, {depth: 10000});

    assertEquals(tree.statements[0].error.length, 1);
});

Deno.test("ASSIGNMENT - IDENTIFIER > '=' > NUMBER (three times)", () => {
    const program = `
        ; This is a comment

        ID1 = $000001
        ID2 = $000002
        ID3 = $000003
    `;

    const lexer = new Lexer(program);
    const tokens = lexer.parse();
    const symbols = lexer.symbols;
    const parser = new Parser();
    const tree = parser.parse(tokens, symbols);

    // console.dir(tree, {depth: 10000});
    // console.dir(symbols, {depth: 10000});

    assertEquals(tree.statements.length, 3);
    assertEquals(tree.statements[0].error.length, 0);
    assertEquals((tree.statements[0] as PseudoOperationAssignment).data, 0x000001);
    assertEquals((tree.statements[0] as PseudoOperationAssignment).value, '$000001');
    assertEquals((tree.statements[0] as PseudoOperationAssignment).label, 'ID1');

    assertEquals(tree.statements[1].error.length, 0);
    assertEquals((tree.statements[1] as PseudoOperationAssignment).data, 0x000002);
    assertEquals((tree.statements[1] as PseudoOperationAssignment).value, '$000002');
    assertEquals((tree.statements[1] as PseudoOperationAssignment).label, 'ID2');

    assertEquals(tree.statements[2].error.length, 0);
    assertEquals((tree.statements[2] as PseudoOperationAssignment).data, 0x000003);
    assertEquals((tree.statements[2] as PseudoOperationAssignment).value, '$000003');
    assertEquals((tree.statements[2] as PseudoOperationAssignment).label, 'ID3');
});

Deno.test("ASSIGNMENT - '*=' > NUMBER", () => {
    const program = `
        ; This is a comment

        *= $1234
    `;

    const lexer = new Lexer(program);
    const tokens = lexer.parse();
    const symbols = lexer.symbols;
    const parser = new Parser();
    const tree = parser.parse(tokens, symbols);

    // console.dir(tree, {depth: 10000});
    // console.dir(symbols, {depth: 10000});

    assertEquals(tree.statements.length, 1);
    assertEquals(tree.statements[0].error.length, 0);
    assertEquals((tree.statements[0] as PseudoOperationAssignment).data, 0x1234);
    assertEquals((tree.statements[0] as PseudoOperationAssignment).operator, '*=');
    assertEquals((tree.statements[0] as PseudoOperationAssignment).value, '$1234');
    assertEquals((tree.statements[0] as PseudoOperationAssignment).label, null);
});

Deno.test("ASSIGNMENT - '*=' > NUMBER > '+ 3'", () => {
    const program = `
        ; This is a comment

        *= $1234 + 3
    `;

    const lexer = new Lexer(program);
    const tokens = lexer.parse();
    const symbols = lexer.symbols;
    const parser = new Parser();
    const tree = parser.parse(tokens, symbols);

    // console.dir(tree, {depth: 10000});
    // console.dir(symbols, {depth: 10000});

    assertEquals(tree.statements.length, 1);
    assertEquals(tree.statements[0].error.length, 0);
    assertEquals((tree.statements[0] as PseudoOperationAssignment).data, 0x1234);
    assertEquals((tree.statements[0] as PseudoOperationAssignment).operator, '*=');
    assertEquals((tree.statements[0] as PseudoOperationAssignment).value, '$1234');
    assertEquals((tree.statements[0] as PseudoOperationAssignment).label, null);
    assertEquals((tree.statements[0] as PseudoOperationAssignment).modifier, '+');
    assertEquals((tree.statements[0] as PseudoOperationAssignment).modification, 3);
});

Deno.test("ASSIGNMENT - '*=' > IDENTIFIER", () => {
    const program = `
        ; This is a comment

        *= ID
    `;

    const lexer = new Lexer(program);
    const tokens = lexer.parse();
    const symbols = lexer.symbols;
    const parser = new Parser();
    const tree = parser.parse(tokens, symbols);

    // console.dir(tree, {depth: 10000});
    // console.dir(symbols, {depth: 10000});

    assertEquals(tree.statements.length, 1);
    assertEquals(tree.statements[0].error.length, 0);
    assertEquals((tree.statements[0] as PseudoOperationAssignment).data, null);
    assertEquals((tree.statements[0] as PseudoOperationAssignment).operator, '*=');
    assertEquals((tree.statements[0] as PseudoOperationAssignment).value, 'ID');
    assertEquals((tree.statements[0] as PseudoOperationAssignment).label, null);
});

Deno.test("ASSIGNMENT - '*=' > IDENTIFIER > '+ 2'", () => {
    const program = `
        ; This is a comment

        *= ID + 2
    `;

    const lexer = new Lexer(program);
    const tokens = lexer.parse();
    const symbols = lexer.symbols;
    const parser = new Parser();
    const tree = parser.parse(tokens, symbols);

    // console.dir(tree, {depth: 10000});
    // console.dir(symbols, {depth: 10000});

    assertEquals(tree.statements.length, 1);
    assertEquals(tree.statements[0].error.length, 0);
    assertEquals((tree.statements[0] as PseudoOperationAssignment).data, null);
    assertEquals((tree.statements[0] as PseudoOperationAssignment).operator, '*=');
    assertEquals((tree.statements[0] as PseudoOperationAssignment).value, 'ID');
    assertEquals((tree.statements[0] as PseudoOperationAssignment).label, null);
    assertEquals((tree.statements[0] as PseudoOperationAssignment).modifier, '+');
    assertEquals((tree.statements[0] as PseudoOperationAssignment).modification, 2);
});

Deno.test("ASSIGNMENT - '*=' > '*' > '+ 2'", () => {
    const program = `*= * + 2
    `;

    const lexer = new Lexer(program);
    const tokens = lexer.parse();
    const symbols = lexer.symbols;
    const parser = new Parser();
    const tree = parser.parse(tokens, symbols);

    // console.dir(tree, {depth: 10000});
    // console.dir(symbols, {depth: 10000});

    assertEquals(tree.statements.length, 1);
    assertEquals(tree.statements[0].error.length, 0);
    assertEquals((tree.statements[0] as PseudoOperationAssignment).data, null);
    assertEquals((tree.statements[0] as PseudoOperationAssignment).operator, '*=');
    assertEquals((tree.statements[0] as PseudoOperationAssignment).value, '*');
    assertEquals((tree.statements[0] as PseudoOperationAssignment).label, null);
    assertEquals((tree.statements[0] as PseudoOperationAssignment).modifier, '+');
    assertEquals((tree.statements[0] as PseudoOperationAssignment).modification, 2);
});

Deno.test("ASSIGNMENT - '*=' > '*' > '- 5'", () => {
    const program = `*= * - 5`;

    const lexer = new Lexer(program);
    const tokens = lexer.parse();
    const symbols = lexer.symbols;
    const parser = new Parser();
    const tree = parser.parse(tokens, symbols);

    // console.dir(tree, {depth: 10000});
    // console.dir(symbols, {depth: 10000});

    assertEquals(tree.statements.length, 1);
    assertEquals(tree.statements[0].error.length, 0);
    assertEquals((tree.statements[0] as PseudoOperationAssignment).data, null);
    assertEquals((tree.statements[0] as PseudoOperationAssignment).operator, '*=');
    assertEquals((tree.statements[0] as PseudoOperationAssignment).value, '*');
    assertEquals((tree.statements[0] as PseudoOperationAssignment).label, null);
    assertEquals((tree.statements[0] as PseudoOperationAssignment).modifier, '-');
    assertEquals((tree.statements[0] as PseudoOperationAssignment).modification, 5);
});

Deno.test("ASSIGNMENT - '*=' > '*' > '-' > IDENTIFIER |> error", () => {
    const program = `*= * - ID`;

    const lexer = new Lexer(program);
    const tokens = lexer.parse();
    const symbols = lexer.symbols;
    const parser = new Parser();
    const tree = parser.parse(tokens, symbols);

    // console.dir(tree, {depth: 10000});
    // console.dir(symbols, {depth: 10000});

    assertEquals(tree.statements.length, 1);
    assertEquals(tree.statements[0].error.length, 1);
});
