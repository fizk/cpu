import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";
import Lexer from '../src/Lexer.ts';
import Parser, { Definition } from '../src/Parser.ts';

Deno.test("DEFINITION - single line", () => {
    const program = `
        ; This is a comment

        SOME_TYPE1   .byte $00aaff
        SOME_TYPE2   .byte $00aa01, $00aa02, $00aa03
        SOME_TYPE3   .byte "this is my text"
        SOME_TYPE4   .byte 'this is another text'
    `;

    const lexer = new Lexer(program);
    const tokens = lexer.parse();
    const symbols = lexer.symbols;
    const parser = new Parser();
    const tree = parser.parse(tokens, symbols);

    // console.dir(tokens, {depth: 10000});
    // console.dir(tree, {depth: 10000});
    // console.dir(symbols, {depth: 10000});

    assertEquals(tree.statements.length, 4);

    assertEquals((tree.statements[0] as Definition).label, 'SOME_TYPE1');
    assertEquals((tree.statements[0] as Definition).type, 'BYTE');
    assertEquals((tree.statements[0] as Definition).data, [0x00aaff]);
    assertEquals((tree.statements[0] as Definition).rawData, ['$00aaff']);

    assertEquals((tree.statements[1] as Definition).label, 'SOME_TYPE2');
    assertEquals((tree.statements[1] as Definition).type, 'BYTE');
    assertEquals((tree.statements[1] as Definition).data, [0x00aa01, 0x00aa02, 0x00aa03]);
    assertEquals((tree.statements[1] as Definition).rawData, ['$00aa01', '$00aa02', '$00aa03']);

    assertEquals((tree.statements[2] as Definition).label, 'SOME_TYPE3');
    assertEquals((tree.statements[2] as Definition).type, 'BYTE');
    assertEquals((tree.statements[2] as Definition).data.length, 15);
    assertEquals((tree.statements[2] as Definition).rawData.length, 15);

    assertEquals((tree.statements[3] as Definition).label, 'SOME_TYPE4');
    assertEquals((tree.statements[3] as Definition).type, 'BYTE');
    assertEquals((tree.statements[3] as Definition).data.length, 20);
    assertEquals((tree.statements[3] as Definition).rawData.length, 20);
});

Deno.test("DEFINITION - single line |> missing comma", () => {
    const program = `
        ; This is a comment

        SOME_TYPE1   .byte $00aa01, $00aa02
        SOME_TYPE2   .byte $00aa01  $00aa02
    `;

    const lexer = new Lexer(program);
    const tokens = lexer.parse();
    const symbols = lexer.symbols;
    const parser = new Parser();
    const tree = parser.parse(tokens, symbols);

    // console.dir(tokens, {depth: 10000});
    // console.dir(tree, {depth: 10000});
    // console.dir(symbols, {depth: 10000});

    assertEquals(tree.statements.length, 2);

    assertEquals((tree.statements[0] as Definition).label, 'SOME_TYPE1');
    assertEquals((tree.statements[0] as Definition).type, 'BYTE');
    assertEquals((tree.statements[0] as Definition).data, [0x00aa01, 0x00aa02]);
    assertEquals((tree.statements[0] as Definition).rawData, ['$00aa01', '$00aa02']);

    assertEquals((tree.statements[1] as Definition).label, 'SOME_TYPE2');
    assertEquals((tree.statements[1] as Definition).type, 'BYTE');
    assertEquals((tree.statements[1] as Definition).data, [0x00aa01]);
    assertEquals((tree.statements[1] as Definition).rawData, ['$00aa01']);
});

Deno.test("DEFINITION - multy line", () => {
    const program = `
        ; This is a comment

        SOME_TYPE1  .byte $00aaff
                    .byte $00aa01, $00aa02, $00aa03
    `;

    const lexer = new Lexer(program);
    const tokens = lexer.parse();
    const symbols = lexer.symbols;
    const parser = new Parser();
    const tree = parser.parse(tokens, symbols);

    // console.dir(tokens, {depth: 10000});
    // console.dir(tree, {depth: 10000});
    // console.dir(symbols, {depth: 10000});

    assertEquals(tree.statements.length, 1);

    assertEquals((tree.statements[0] as Definition).label, 'SOME_TYPE1');
    assertEquals((tree.statements[0] as Definition).type, 'BYTE');
    assertEquals((tree.statements[0] as Definition).data, [0x00aaff, 0x00aa01, 0x00aa02, 0x00aa03]);
    assertEquals((tree.statements[0] as Definition).rawData, ['$00aaff', '$00aa01', '$00aa02', '$00aa03']);
});

Deno.test("DEFINITION - multy line with single type", () => {
    const program = `
        ; This is a comment

        SOME_TYPE1  .byte $00aaff,
                    $00aa01, $00aa02, $00aa03
    `;

    const lexer = new Lexer(program);
    const tokens = lexer.parse();
    const symbols = lexer.symbols;
    const parser = new Parser();
    const tree = parser.parse(tokens, symbols);

    // console.dir(tokens, {depth: 10000});
    // console.dir(tree, {depth: 10000});
    // console.dir(symbols, {depth: 10000});

    assertEquals(tree.statements.length, 1);

    assertEquals((tree.statements[0] as Definition).label, 'SOME_TYPE1');
    assertEquals((tree.statements[0] as Definition).type, 'BYTE');
    assertEquals((tree.statements[0] as Definition).data, [0x00aaff, 0x00aa01, 0x00aa02, 0x00aa03]);
    assertEquals((tree.statements[0] as Definition).rawData, ['$00aaff', '$00aa01', '$00aa02', '$00aa03']);
});

Deno.test("DEFINITION - single line |> failure - mixed types", () => {
    const program = `
        ; This is a comment

        SOME_TYPE1  .byte $00aaff, "hundur"
    `;

    const lexer = new Lexer(program);
    const tokens = lexer.parse();
    const symbols = lexer.symbols;
    const parser = new Parser();
    const tree = parser.parse(tokens, symbols);

    // console.dir(tokens, {depth: 10000});
    // console.dir(tree, {depth: 10000});
    // console.dir(symbols, {depth: 10000});

    assertEquals(tree.statements.length, 1);

    assertEquals((tree.statements[0] as Definition).label, 'SOME_TYPE1');
    assertEquals((tree.statements[0] as Definition).type, 'BYTE');
    assertEquals((tree.statements[0] as Definition).data, [0x00aaff]);
    assertEquals((tree.statements[0] as Definition).rawData, ['$00aaff']);
    assertEquals((tree.statements[0] as Definition).error.length, 1);
});
