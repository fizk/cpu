import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";
import Lexer from '../src/Lexer.ts';
import Parser, {Assignment} from '../src/Parser.ts';

Deno.test("ASSIGNMENT - IDENTIFIER >  '=' NUMBER", () => {
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
    assertEquals(tree.statements[0].data, 0xaabbcc);
    assertEquals(tree.statements[0].rawData, '$aabbcc');
    assertEquals((tree.statements[0] as Assignment).label, 'ID');
});

Deno.test("ASSIGNMENT - IDENTIFIER >  '=' LABEL |> error", () => {
    const program = `
        ; This is a comment

        ID = LABEL:
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

Deno.test("ASSIGNMENT - IDENTIFIER >  '=' OPCODE |> error", () => {
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

Deno.test("ASSIGNMENT - IDENTIFIER >  '=' NUMBER (three times)", () => {
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
    assertEquals(tree.statements[0].data, 0x000001);
    assertEquals(tree.statements[0].rawData, '$000001');
    assertEquals((tree.statements[0] as Assignment).label, 'ID1');

    assertEquals(tree.statements[1].error.length, 0);
    assertEquals(tree.statements[1].data, 0x000002);
    assertEquals(tree.statements[1].rawData, '$000002');
    assertEquals((tree.statements[1] as Assignment).label, 'ID2');

    assertEquals(tree.statements[2].error.length, 0);
    assertEquals(tree.statements[2].data, 0x000003);
    assertEquals(tree.statements[2].rawData, '$000003');
    assertEquals((tree.statements[2] as Assignment).label, 'ID3');
});
