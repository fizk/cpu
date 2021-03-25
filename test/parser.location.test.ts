import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";
import Lexer from '../src/Lexer.ts';
import Parser, { Location} from '../src/Parser.ts';

Deno.test("LOCATION - '*' > '=' > NUMBER", () => {
    const program = `
        ; This is a comment

        * = $8000
    `;

    const lexer = new Lexer(program);
    const tokens = lexer.parse();
    const symbols = lexer.symbols;
    const parser = new Parser();
    const tree = parser.parse(tokens, symbols);

    // console.dir(tree, {depth: 10000});
    // console.dir(symbols, {depth: 10000});

    assertEquals(tree.statements.length, 1);
});

Deno.test("LOCATION - '*' > '=' > IDENTIFIER", () => {
    const program = `
        ; This is a comment
        ID = $8000
        * = ID
    `;

    const lexer = new Lexer(program);
    const tokens = lexer.parse();
    const symbols = lexer.symbols;
    const parser = new Parser();
    const tree = parser.parse(tokens, symbols);

    // console.dir(tree, {depth: 10000});
    // console.dir(symbols, {depth: 10000});

    assertEquals(tree.statements.length, 2);
    assertEquals(tree.statements[0].data, 0x8000);
    assertEquals(tree.statements[1].rawData, 'ID');
    assertEquals(tree.statements[1].data, 0x8000);
});

Deno.test("LOCATION - '*' > '=' > LABEL |> error: found LABEL:", () => {
    const program = `
        ; This is a comment

        * = IDENTIFIER:
    `;

    const lexer = new Lexer(program);
    const tokens = lexer.parse();
    const symbols = lexer.symbols;
    const parser = new Parser();
    const tree = parser.parse(tokens, symbols);

    // console.dir(tree, {depth: 10000});
    // console.dir(symbols, {depth: 10000});

    assertEquals(tree.statements.length, 1);
    assertEquals(tree.statements[0].error.length, 1);
    assertEquals(tree.statements[0].data, null);
    assertEquals(tree.statements[0].rawData, '');
});

Deno.test("LOCATION - '*' >  LABEL |> error: missing '=' followed by a LABEL", () => {
    const program = `
        ; This is a comment

        * IDENTIFIER:
    `;

    const lexer = new Lexer(program);
    const tokens = lexer.parse();
    const symbols = lexer.symbols;
    const parser = new Parser();
    const tree = parser.parse(tokens, symbols);

    // console.dir(tree, {depth: 10000});
    // console.dir(symbols, {depth: 10000});

    assertEquals(tree.statements[0].error.length, 2);
});

Deno.test("LOCATION - '*' >  IDENTIFIER |> error: missing '=' ", () => {
    const program = `
        ; This is a comment

        * ID
    `;

    const lexer = new Lexer(program);
    const tokens = lexer.parse();
    const symbols = lexer.symbols;
    const parser = new Parser();
    const tree = parser.parse(tokens, symbols);

    // console.dir(tree, {depth: 10000});
    // console.dir(symbols, {depth: 10000});

    assertEquals(tree.statements[0].error.length, 1);
    assertEquals(tree.statements[0].data, null);
    assertEquals(tree.statements[0].rawData, 'ID');
});

Deno.test("LOCATION - '*' > '=' > NUMBER > '+' NUMBER", () => {
    const program = `
        ; This is a comment

        VALUE = $0001

        * = ID + 1
        * = $0001 + 1
    `;

    const lexer = new Lexer(program);
    const tokens = lexer.parse();
    const symbols = lexer.symbols;
    const parser = new Parser();
    const tree = parser.parse(tokens, symbols);

    // console.dir(tree, {depth: 10000});
    // console.dir(symbols, {depth: 10000});

    assertEquals(tree.statements.length, 3);

    assertEquals(tree.statements[1].error.length, 0);
    assertEquals(tree.statements[1].data, null);
    assertEquals((tree.statements[1] as Location).modifier, '+');
    assertEquals((tree.statements[1] as Location).modification, 1);
    assertEquals(tree.statements[1].rawData, 'ID');

    assertEquals(tree.statements[2].error.length, 0);
    assertEquals(tree.statements[2].data, 2);
    assertEquals((tree.statements[2] as Location).modifier, '+');
    assertEquals((tree.statements[2] as Location).modification, 1);
    assertEquals(tree.statements[2].rawData, '$0001');
});

Deno.test("LOCATION - '*' > '=' > IDENTIFIER > '+' NUMBER", () => {
    const program = `
        ; This is a comment

        VALUE = $0001

        * = ID + 1
        * = VALUE + 1
    `;

    const lexer = new Lexer(program);
    const tokens = lexer.parse();
    const symbols = lexer.symbols;
    const parser = new Parser();
    const tree = parser.parse(tokens, symbols);

    // console.dir(tree, {depth: 10000});
    // console.dir(symbols, {depth: 10000});

    assertEquals(tree.statements.length, 3);

    assertEquals(tree.statements[1].error.length, 0);
    assertEquals(tree.statements[1].data, null);
    assertEquals((tree.statements[1] as Location).modifier, '+');
    assertEquals((tree.statements[1] as Location).modification, 1);
    assertEquals(tree.statements[1].rawData, 'ID');

    assertEquals(tree.statements[2].error.length, 0);
    assertEquals(tree.statements[2].data, 2);
    assertEquals((tree.statements[2] as Location).modifier, '+');
    assertEquals((tree.statements[2] as Location).modification, 1);
    assertEquals(tree.statements[2].rawData, 'VALUE');
});

Deno.test("LOCATION - '*' > '=' > NUMBER > '-' NUMBER", () => {
    const program = `
        ; This is a comment

        VALUE = $0002

        * = ID - 1
        * = $0002 - 1
    `;

    const lexer = new Lexer(program);
    const tokens = lexer.parse();
    const symbols = lexer.symbols;
    const parser = new Parser();
    const tree = parser.parse(tokens, symbols);

    // console.dir(tree, {depth: 10000});
    // console.dir(symbols, {depth: 10000});

    assertEquals(tree.statements.length, 3);

    assertEquals(tree.statements[1].error.length, 0);
    assertEquals(tree.statements[1].data, null);
    assertEquals((tree.statements[1] as Location).modifier, '-');
    assertEquals((tree.statements[1] as Location).modification, 1);
    assertEquals(tree.statements[1].rawData, 'ID');

    assertEquals(tree.statements[2].error.length, 0);
    assertEquals(tree.statements[2].data, 1);
    assertEquals((tree.statements[2] as Location).modifier, '-');
    assertEquals((tree.statements[2] as Location).modification, 1);
    assertEquals(tree.statements[2].rawData, '$0002');
});

Deno.test("LOCATION - '*' > '=' > IDENTIFIER > '-' NUMBER", () => {
    const program = `
        ; This is a comment

        VALUE = $0002

        * = ID - 1
        * = VALUE - 1
    `;

    const lexer = new Lexer(program);
    const tokens = lexer.parse();
    const symbols = lexer.symbols;
    const parser = new Parser();
    const tree = parser.parse(tokens, symbols);

    // console.dir(tree, {depth: 10000});
    // console.dir(symbols, {depth: 10000});

    assertEquals(tree.statements.length, 3);

    assertEquals(tree.statements[1].error.length, 0);
    assertEquals(tree.statements[1].data, null);
    assertEquals((tree.statements[1] as Location).modifier, '-');
    assertEquals((tree.statements[1] as Location).modification, 1);
    assertEquals(tree.statements[1].rawData, 'ID');

    assertEquals(tree.statements[2].error.length, 0);
    assertEquals(tree.statements[2].data, 1);
    assertEquals((tree.statements[2] as Location).modifier, '-');
    assertEquals((tree.statements[2] as Location).modification, 1);
    assertEquals(tree.statements[2].rawData, 'VALUE');
});
