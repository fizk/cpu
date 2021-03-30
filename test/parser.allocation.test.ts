import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";
import Lexer from '../src/parser/Lexer.ts';
import Parser, { PseudoOperationAllocation } from '../src/parser/Parser.ts';

Deno.test("ALLOCATION - IDENTIFIER > '.block' > NUMBER", () => {
    const program = `
        ; This is a comment

        ID .block 2
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
    assertEquals((tree.statements[0] as PseudoOperationAllocation).data, null);
    assertEquals((tree.statements[0] as PseudoOperationAllocation).type, 'BLOCK');
    assertEquals((tree.statements[0] as PseudoOperationAllocation).value, [2]);
    assertEquals((tree.statements[0] as PseudoOperationAllocation).data, null);
    assertEquals((tree.statements[0] as PseudoOperationAllocation).label, 'ID');
});

Deno.test("ALLOCATION - IDENTIFIER > '.block' > STRING |> error", () => {
    const program = `
        ; This is a comment

        ID .block "2"
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
    assertEquals((tree.statements[0] as PseudoOperationAllocation).type, 'BLOCK');
});

Deno.test("ALLOCATION - IDENTIFIER > '.byte' > number", () => {
    const program = `
        ; This is a comment

        ID .byte $01
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
    assertEquals((tree.statements[0] as PseudoOperationAllocation).type, 'BYTE');
    assertEquals((tree.statements[0] as PseudoOperationAllocation).data, [0x1]);
    assertEquals((tree.statements[0] as PseudoOperationAllocation).value, ['$01']);
});

Deno.test("ALLOCATION - IDENTIFIER > '.byte' > NUMBER ',' NUMBER", () => {
    const program = `
        ; This is a comment

        ID .byte $01, $02
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
    assertEquals((tree.statements[0] as PseudoOperationAllocation).type, 'BYTE');
    assertEquals((tree.statements[0] as PseudoOperationAllocation).data, [0x1, 0x2]);
    assertEquals((tree.statements[0] as PseudoOperationAllocation).value, ['$01', '$02']);
});

Deno.test("ALLOCATION - IDENTIFIER > '.byte' > NUMBER ',' NUMBER '.byte' NUMBER ',' NUMBER", () => {
    const program = `
        ; This is a comment

        ID .byte $01, $02
           .byte $03, $04
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
    assertEquals((tree.statements[0] as PseudoOperationAllocation).type, 'BYTE');
    assertEquals((tree.statements[0] as PseudoOperationAllocation).data, [0x1, 0x2, 0x3, 0x4]);
    assertEquals((tree.statements[0] as PseudoOperationAllocation).value, ['$01', '$02', '$03', '$04']);
});

Deno.test("ALLOCATION - IDENTIFIER > '.byte' > NUMBER ',' NUMBER '.word' NUMBER ',' NUMBER |> error", () => {
    const program = `
        ; This is a comment

        ID .byte $01, $02
           .word $03, $04
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
});

Deno.test("ALLOCATION - IDENTIFIER > '.byte' > NUMBER |> error: number too big", () => {
    const program = `
        ; This is a comment

        ID .byte $ffff
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
    assertEquals(tree.statements[0].error[0].message, '{BYTE} can not contain value greater than 0xff');
});

Deno.test("ALLOCATION - IDENTIFIER > '.byte' > STRING > '.word' |> error", () => {
    const program = `
        ; This is a comment

        ID .byte '$ffff'
           .word  $ffff
    `;

    const lexer = new Lexer(program);
    const tokens = lexer.parse();
    const symbols = lexer.symbols;
    const parser = new Parser();
    const tree = parser.parse(tokens, symbols);

    // console.dir(tree, {depth: 10000});
    // console.dir(symbols, {depth: 10000});

    assertEquals(tree.statements.length, 1);
    assertEquals(tree.statements[0].error.length, 3);
    assertEquals(tree.statements[0].error[0].message, 'Expecting {NUMBER}, got "$ffff".');
    assertEquals(tree.statements[0].error[1].message, 'Expecting {BYTE}, got {WORD}.');
    assertEquals(tree.statements[0].error[2].message, '{BYTE} can not contain value greater than 0xff');
});

Deno.test("ALLOCATION - IDENTIFIER > '.dbyte' > NUMBER", () => {
    const program = `
        ; This is a comment

        ID .dbyte $aaff
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
    assertEquals((tree.statements[0] as PseudoOperationAllocation).type, 'DBYTE');
    assertEquals((tree.statements[0] as PseudoOperationAllocation).label, 'ID');
    assertEquals((tree.statements[0] as PseudoOperationAllocation).data, [0xaa, 0xff]);
    assertEquals((tree.statements[0] as PseudoOperationAllocation).value, ['$aaff']);
});

Deno.test("ALLOCATION - IDENTIFIER > '.dbyte' > NUMBER, ',' NUMBER", () => {
    const program = `
        ; This is a comment

        ID .dbyte $aaff, $bbcc
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
    assertEquals((tree.statements[0] as PseudoOperationAllocation).type, 'DBYTE');
    assertEquals((tree.statements[0] as PseudoOperationAllocation).label, 'ID');
    assertEquals((tree.statements[0] as PseudoOperationAllocation).data, [0xaa, 0xff, 0xbb, 0xcc]);
    assertEquals((tree.statements[0] as PseudoOperationAllocation).value, ['$aaff', '$bbcc']);
});

Deno.test("ALLOCATION - IDENTIFIER > '.dbyte' > NUMBER |> error: number too big", () => {
    const program = `
        ; This is a comment

        ID .dbyte $aaffcc
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
    assertEquals((tree.statements[0] as PseudoOperationAllocation).type, 'DBYTE');
    assertEquals((tree.statements[0] as PseudoOperationAllocation).label, 'ID');
    assertEquals((tree.statements[0] as PseudoOperationAllocation).data, [0xaaff, 0xcc]);
    assertEquals((tree.statements[0] as PseudoOperationAllocation).value, ['$aaffcc']);
});

Deno.test("ALLOCATION - IDENTIFIER > '.word' > NUMBER", () => {
    const program = `
        ; This is a comment

        ID .word $aaff
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
    assertEquals((tree.statements[0] as PseudoOperationAllocation).type, 'WORD');
    assertEquals((tree.statements[0] as PseudoOperationAllocation).label, 'ID');
    assertEquals((tree.statements[0] as PseudoOperationAllocation).data, [0xff, 0xaa]);
    assertEquals((tree.statements[0] as PseudoOperationAllocation).value, ['$aaff']);
});

Deno.test("ALLOCATION - IDENTIFIER > '.word' > NUMBER |> error: number too big", () => {
    const program = `
        ; This is a comment

        ID .word $aaffee
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
    assertEquals((tree.statements[0] as PseudoOperationAllocation).type, 'WORD');
    assertEquals((tree.statements[0] as PseudoOperationAllocation).label, 'ID');
    assertEquals((tree.statements[0] as PseudoOperationAllocation).data, [0xee, 0xaaff]);
    assertEquals((tree.statements[0] as PseudoOperationAllocation).value, ['$aaffee']);
});

Deno.test("ALLOCATION - IDENTIFIER > '.text' > DOUBLE_STRING", () => {
    const program = `
        ; This is a comment

        ID .text "hello"
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
    assertEquals((tree.statements[0] as PseudoOperationAllocation).type, 'TEXT');
    assertEquals((tree.statements[0] as PseudoOperationAllocation).label, 'ID');
    assertEquals((tree.statements[0] as PseudoOperationAllocation).data, [0x68, 0x65, 0x6c, 0x6c, 0x6f]);
    assertEquals((tree.statements[0] as PseudoOperationAllocation).value, ['h', 'e', 'l', 'l', 'o',]);
});

Deno.test("ALLOCATION - IDENTIFIER > '.text' > DOUBLE_STRING > '.text' > DOUBLE_STRING", () => {
    const program = `
        ; This is a comment

        ID .text "hello"
           .text "world"
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
    assertEquals((tree.statements[0] as PseudoOperationAllocation).type, 'TEXT');
    assertEquals((tree.statements[0] as PseudoOperationAllocation).label, 'ID');
    assertEquals((tree.statements[0] as PseudoOperationAllocation).data, [0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x77, 0x6f, 0x72, 0x6c, 0x64]);
    assertEquals((tree.statements[0] as PseudoOperationAllocation).value, ['h', 'e', 'l', 'l', 'o', 'w', 'o', 'r', 'l','d']);
});

Deno.test("ALLOCATION - IDENTIFIER > '.text' > SINGLE_STRING", () => {
    const program = `
        ; This is a comment

        ID .text 'hello'
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
    assertEquals((tree.statements[0] as PseudoOperationAllocation).type, 'TEXT');
    assertEquals((tree.statements[0] as PseudoOperationAllocation).label, 'ID');
    assertEquals((tree.statements[0] as PseudoOperationAllocation).data, [0x68, 0x65, 0x6c, 0x6c, 0x6f]);
    assertEquals((tree.statements[0] as PseudoOperationAllocation).value, ['h', 'e', 'l', 'l', 'o',]);
});

Deno.test("ALLOCATION - IDENTIFIER > '.text' > SINGLE_STRING > '.text' > SINGLE_STRING", () => {
    const program = `
        ; This is a comment

        ID .text 'hello'
           .text 'world'
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
    assertEquals((tree.statements[0] as PseudoOperationAllocation).type, 'TEXT');
    assertEquals((tree.statements[0] as PseudoOperationAllocation).label, 'ID');
    assertEquals((tree.statements[0] as PseudoOperationAllocation).data, [0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x77, 0x6f, 0x72, 0x6c, 0x64]);
    assertEquals((tree.statements[0] as PseudoOperationAllocation).value, ['h', 'e', 'l', 'l', 'o', 'w', 'o', 'r', 'l', 'd']);
});

Deno.test("ALLOCATION - IDENTIFIER > '.text' > DOUBLE_STRING > ',' NUMBER |> error", () => {
    const program = `
        ; This is a comment

        ID .text "hello", $ff
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
    assertEquals(tree.statements[0].error[0].message, 'Expecting {DOUBLE_STRING} or {SINGLE_STRING}, got {NUMBER}.');
    assertEquals((tree.statements[0] as PseudoOperationAllocation).type, 'TEXT');
    assertEquals((tree.statements[0] as PseudoOperationAllocation).label, 'ID');
    assertEquals((tree.statements[0] as PseudoOperationAllocation).data, [0x68, 0x65, 0x6c, 0x6c, 0x6f]);
    assertEquals((tree.statements[0] as PseudoOperationAllocation).value, ['h', 'e', 'l', 'l', 'o',]);
});

Deno.test("ALLOCATION - IDENTIFIER > '.text' > NUMBER |> error", () => {
    const program = `
        ; This is a comment

        ID .text $ff
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
    assertEquals(tree.statements[0].error[0].message, 'Expecting {DOUBLE_STRING} or {SINGLE_STRING}, got {NUMBER}.');
    assertEquals((tree.statements[0] as PseudoOperationAllocation).type, 'TEXT');
    assertEquals((tree.statements[0] as PseudoOperationAllocation).label, 'ID');
    assertEquals((tree.statements[0] as PseudoOperationAllocation).data, []);
    assertEquals((tree.statements[0] as PseudoOperationAllocation).value, []);
});

Deno.test("ALLOCATION - IDENTIFIER > '.text' > DOUBLE_STRING > '.word' SINGLE_STRING |> error", () => {
    const program = `
        ; This is a comment

        ID .text "hello"
           .word 'world'
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
    assertEquals(tree.statements[0].error[0].message, 'Expecting {TEXT}, got {WORD}.');
    assertEquals((tree.statements[0] as PseudoOperationAllocation).type, 'TEXT');
    assertEquals((tree.statements[0] as PseudoOperationAllocation).label, 'ID');
    assertEquals((tree.statements[0] as PseudoOperationAllocation).data, [0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x77, 0x6f, 0x72, 0x6c, 0x64]);
    assertEquals((tree.statements[0] as PseudoOperationAllocation).value, ['h', 'e', 'l', 'l', 'o', 'w', 'o', 'r', 'l', 'd']);
});
