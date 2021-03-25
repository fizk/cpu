import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";
import Lexer, {TOKENS} from '../src/Lexer.ts';

Deno.test("LEXER - line begins with comment", () => {
    const tokens = new Lexer(`
        ; This is a comment
    `).parse();
    assertEquals(tokens, []);
});

Deno.test("LEXER - many lines comment", () => {
    const tokens = new Lexer(`
        ; This is a comment
        ; This is another one
    `).parse();
    assertEquals(tokens, []);
});

Deno.test("LEXER - op-code", () => {
    const tokens = new Lexer(`
        LDA
    `).parse();
    assertEquals(tokens, [
        { token: TOKENS.OPCODE, value: 'LDA', line: 1, from: 8, to: 10 },
    ]);
});

Deno.test("LEXER - comment > op-code", () => {
    const tokens = new Lexer(`
        ; this is some comment
        LDA
    `).parse();
    assertEquals(tokens, [
        { token: TOKENS.OPCODE, value: 'LDA', line: 2, from: 8, to: 10 },
    ]);
});

Deno.test("LEXER - label > op-code", () => {
    const tokens = new Lexer(`
        label: LDA`
    ).parse();
    assertEquals(tokens, [
        { token: TOKENS.LABEL, value: 'label', line: 1, from: 8, to: 13 },
        { token: TOKENS.OPCODE, value: 'LDA', line: 1, from: 15, to: 17 },
    ]);
});

Deno.test("LEXER - label > break > op-code", () => {
    const tokens = new Lexer(`
        label:
            LDA
    `).parse();
    assertEquals(tokens, [
        { token: TOKENS.LABEL, value: 'label', line: 1, from: 8, to: 13 },
        { token: TOKENS.OPCODE, value: 'LDA', line: 2, from: 12, to: 14 },
    ]);
});

Deno.test("LEXER - op-code > $hex-number", () => {
    const tokens = new Lexer(`
        LDA $1234
    `).parse();
    assertEquals(tokens, [
        { token: TOKENS.OPCODE, value: 'LDA', line: 1, from: 8, to: 10 },
        { token: TOKENS.NUMBER, value: '$1234', line: 1, from: 12, to: 16 },
    ]);
});

Deno.test("LEXER - op-code > $hex-number", () => {
    const tokens = new Lexer(`
        LDA $ff00aa
    `).parse();
    assertEquals(tokens, [
        { token: TOKENS.OPCODE, value: 'LDA', line: 1, from: 8, to: 10 },
        { token: TOKENS.NUMBER, value: '$ff00aa', line: 1, from: 12, to: 18 },
    ]);
});

Deno.test("LEXER - op-code > %binary-number", () => {
    const tokens = new Lexer(`
        LDA %101001
    `).parse();
    assertEquals(tokens, [
        { token: TOKENS.OPCODE, value: 'LDA', line: 1, from: 8, to: 10 },
        { token: TOKENS.NUMBER, value: '%101001', line: 1, from: 12, to: 18 },
    ]);
});

Deno.test("LEXER - op-code > immediate > hex-number", () => {
    const tokens = new Lexer(`
        LDA #$ffffff
    `).parse();
    assertEquals(tokens, [
        { token: TOKENS.OPCODE, value: 'LDA', line: 1, from: 8, to: 10 },
        { token: '#', value: null, line: 1, from: 12, to: 12 },
        { token: TOKENS.NUMBER, value: '$ffffff', line: 1, from: 13, to: 19 },
    ]);
});

Deno.test("LEXER - op-code > immediate > binary-number", () => {
    const tokens = new Lexer(`
        LDA #%101001
    `).parse();
    assertEquals(tokens, [
        { token: TOKENS.OPCODE, value: 'LDA', line: 1, from: 8, to: 10 },
        { token: '#', value: null, line: 1, from: 12, to: 12 },
        { token: TOKENS.NUMBER, value: '%101001', line: 1, from: 13, to: 19 },
    ]);
});

Deno.test("LEXER - assignment", () => {
    const tokens = new Lexer(`
        BOARD   =    $50
    `).parse();
    assertEquals(tokens, [
        { token: TOKENS.IDENTIFIER, value: 'BOARD', line: 1, from: 8, to: 12 },
        { token: '=', value: null, line: 1, from: 16, to: 16 },
        { token: TOKENS.NUMBER, value: '$50', line: 1, from: 21, to: 23 },
    ]);
});

Deno.test("LEXER - parentheses > number > parentheses", () => {
    const tokens = new Lexer(`
        LDA  ($1234)
    `).parse();
    assertEquals(tokens, [
        { token: TOKENS.OPCODE, value: 'LDA', line: 1, from: 8, to: 10 },
        { token: '(', value: null, line: 1, from: 13, to: 13 },
        { token: TOKENS.NUMBER, value: '$1234', line: 1, from: 14, to: 18 },
        { token: ')', value: null, line: 1, from: 19, to: 19 },
    ]);
});

Deno.test("LEXER - parentheses > space > number > space > parentheses", () => {
    const tokens = new Lexer(`
        LDA  ( $1234 )
    `).parse();
    assertEquals(tokens, [
        { token: TOKENS.OPCODE, value: 'LDA', line: 1, from: 8, to: 10 },
        { token: '(', value: null, line: 1, from: 13, to: 13 },
        { token: TOKENS.NUMBER, value: '$1234', line: 1, from: 15, to: 19 },
        { token: ')', value: null, line: 1, from: 21, to: 21 },
    ]);
});

Deno.test("LEXER - parentheses > space > number > , > identifier > parentheses", () => {
    const tokens = new Lexer(`
        LDA  ( $1234, X )
    `).parse();
    assertEquals(tokens, [
        { token: TOKENS.OPCODE, value: 'LDA', line: 1, from: 8, to: 10 },
        { token: '(', value: null, line: 1, from: 13, to: 13 },
        { token: TOKENS.NUMBER, value: '$1234', line: 1, from: 15, to: 19 },
        { token: ',', value: null, line: 1, from: 20, to: 20 },
        { token: TOKENS.IDENTIFIER, value: 'X', line: 1, from: 22, to: 22 },
        { token: ')', value: null, line: 1, from: 24, to: 24 },
    ]);
});

Deno.test("LEXER - parentheses > space > number > space > , > identifier > parentheses", () => {
    const tokens = new Lexer(`
        LDA  ( $1234 , X )
    `).parse();
    assertEquals(tokens, [
        { token: TOKENS.OPCODE, value: 'LDA', line: 1, from: 8, to: 10 },
        { token: '(', value: null, line: 1, from: 13, to: 13 },
        { token: TOKENS.NUMBER, value: '$1234', line: 1, from: 15, to: 19 },
        { token: ',', value: null, line: 1, from: 21, to: 21 },
        { token: TOKENS.IDENTIFIER, value: 'X', line: 1, from: 23, to: 23 },
        { token: ')', value: null, line: 1, from: 25, to: 25 },
    ]);
});

Deno.test("LEXER - parentheses > number > parentheses > , > identifier", () => {
    const tokens = new Lexer(`
        LDA  ($1234), X
    `).parse();
    assertEquals(tokens, [
        { token: TOKENS.OPCODE, value: 'LDA', line: 1, from: 8, to: 10 },
        { token: '(', value: null, line: 1, from: 13, to: 13 },
        { token: TOKENS.NUMBER, value: '$1234', line: 1, from: 14, to: 18 },
        { token: ')', value: null, line: 1, from: 19, to: 19 },
        { token: ',', value: null, line: 1, from: 20, to: 20 },
        { token: TOKENS.IDENTIFIER, value: 'X', line: 1, from: 22, to: 22 },
    ]);
});

Deno.test("LEXER - parentheses > number > parentheses > , > identifier", () => {
    const tokens = new Lexer(`
        LDA  ($1234) , X
    `).parse();
    assertEquals(tokens, [
        { token: TOKENS.OPCODE, value: 'LDA', line: 1, from: 8, to: 10 },
        { token: '(', value: null, line: 1, from: 13, to: 13 },
        { token: TOKENS.NUMBER, value: '$1234', line: 1, from: 14, to: 18 },
        { token: ')', value: null, line: 1, from: 19, to: 19 },
        { token: ',', value: null, line: 1, from: 21, to: 21 },
        { token: TOKENS.IDENTIFIER, value: 'X', line: 1, from: 23, to: 23 },
    ]);
});

Deno.test("LEXER - * > assignment > number", () => {
    const tokens = new Lexer(`
        *=$50
    `).parse();
    assertEquals(tokens, [
        { token: '*', value: null, line: 1, from: 8, to: 8 },
        { token: '=', value: null, line: 1, from: 9, to: 9 },
        { token: TOKENS.NUMBER, value: '$50', line: 1, from: 10, to: 12 },
    ]);
});

Deno.test("LEXER - type > number", () => {
    const tokens = new Lexer(`
        .byte $10
    `).parse();
    assertEquals(tokens, [
        { token: TOKENS.TYPE, value: 'byte', line: 1, from: 8, to: 12 },
        { token: TOKENS.NUMBER, value: '$10', line: 1, from: 14, to: 16 },
    ]);
});

Deno.test("LEXER - label > type > number", () => {
    const tokens = new Lexer(`
        label: .byte $10
    `).parse();
    assertEquals(tokens, [
        { token: TOKENS.LABEL, value: 'label', line: 1, from: 8, to: 13 },
        { token: TOKENS.TYPE, value: 'byte', line: 1, from: 15, to: 19 },
        { token: TOKENS.NUMBER, value: '$10', line: 1, from: 21, to: 23 },
    ]);
});

Deno.test("LEXER - label > type > number, number", () => {
    const tokens = new Lexer(`
        label: .byte $10, $EE
    `).parse();
    assertEquals(tokens, [
        { token: TOKENS.LABEL, value: 'label', line: 1, from: 8, to: 13 },
        { token: TOKENS.TYPE, value: 'byte', line: 1, from: 15, to: 19 },
        { token: TOKENS.NUMBER, value: '$10', line: 1, from: 21, to: 23 },
        { token: ',', value: null, line: 1, from: 24, to: 24 },
        { token: TOKENS.NUMBER, value: '$EE', line: 1, from: 26, to: 28 },
    ]);
});

Deno.test("LEXER - label > type > double-string", () => {
    const tokens = new Lexer(`
        label: .byte "word"
    `).parse();
    assertEquals(tokens, [
        { token: TOKENS.LABEL, value: 'label', line: 1, from: 8, to: 13 },
        { token: TOKENS.TYPE, value: 'byte', line: 1, from: 15, to: 19 },
        { token: TOKENS.DOUBLE_STRING, value: 'word', line: 1, from: 21, to: 26 },
    ]);
});

Deno.test("LEXER - label > type > single-string", () => {
    const tokens = new Lexer(`
        label: .byte 'word'
    `).parse();
    assertEquals(tokens, [
        { token: TOKENS.LABEL, value: 'label', line: 1, from: 8, to: 13 },
        { token: TOKENS.TYPE, value: 'byte', line: 1, from: 15, to: 19 },
        { token: TOKENS.SINGLE_STRING, value: 'word', line: 1, from: 21, to: 26 },
    ]);
});

Deno.test("LEXER - label > type > single-string with double", () => {
    const tokens = new Lexer(`
        label: .byte 'wo"rd'
    `).parse();
    assertEquals(tokens, [
        { token: TOKENS.LABEL, value: 'label', line: 1, from: 8, to: 13 },
        { token: TOKENS.TYPE, value: 'byte', line: 1, from: 15, to: 19 },
        { token: TOKENS.SINGLE_STRING, value: "wo\"rd", line: 1, from: 21, to: 27 },
    ]);
});

Deno.test("LEXER - label > type > double-string with single", () => {
    const tokens = new Lexer(`
        label: .byte "wo'rd"
    `).parse();
    assertEquals(tokens, [
        { token: TOKENS.LABEL, value: 'label', line: 1, from: 8, to: 13 },
        { token: TOKENS.TYPE, value: 'byte', line: 1, from: 15, to: 19 },
        { token: TOKENS.DOUBLE_STRING, value: "wo'rd", line: 1, from: 21, to: 27 },
    ]);
});

Deno.test("LEXER - label > type > double-string special char", () => {
    const tokens = new Lexer(`
        label: .byte "word:#"
    `).parse();
    assertEquals(tokens, [
        { token: TOKENS.LABEL, value: 'label', line: 1, from: 8, to: 13 },
        { token: TOKENS.TYPE, value: 'byte', line: 1, from: 15, to: 19 },
        { token: TOKENS.DOUBLE_STRING, value: "word:#", line: 1, from: 21, to: 28 },
    ]);
});

Deno.test("LEXER - label > type > double-string more special char", () => {
    const tokens = new Lexer(`
        label: .byte "@^&*!*%$="
    `).parse();
    assertEquals(tokens, [
        { token: TOKENS.LABEL, value: 'label', line: 1, from: 8, to: 13 },
        { token: TOKENS.TYPE, value: 'byte', line: 1, from: 15, to: 19 },
        { token: TOKENS.DOUBLE_STRING, value: "@^&*!*%$=", line: 1, from: 21, to: 31 },
    ]);
});

Deno.test("LEXER - increment", () => {
    const tokens = new Lexer(`
        LDA label+1
    `).parse();
    assertEquals(tokens, [
        { token: TOKENS.OPCODE, value: 'LDA', line: 1, from: 8, to: 10 },
        { token: TOKENS.IDENTIFIER, value: 'label', line: 1, from: 12, to: 16 },
        { token: '+', value: null, line: 1, from: 17, to: 17 },
        { token: TOKENS.NUMBER, value: '1', line: 1, from: 18, to: 18 },
    ]);
});

Deno.test("LEXER - decrement", () => {
    const tokens = new Lexer(`
        LDA label-123
    `).parse();
    assertEquals(tokens, [
        { token: TOKENS.OPCODE, value: 'LDA', line: 1, from: 8, to: 10 },
        { token: TOKENS.IDENTIFIER, value: 'label', line: 1, from: 12, to: 16 },
        { token: '-', value: null, line: 1, from: 17, to: 17 },
        { token: TOKENS.NUMBER, value: '123', line: 1, from: 18, to: 20 },
    ]);
});

Deno.test("LEXER - increment space", () => {
    const tokens = new Lexer(`
        LDA label + 1321
    `).parse();
    assertEquals(tokens, [
        { token: TOKENS.OPCODE, value: 'LDA', line: 1, from: 8, to: 10 },
        { token: TOKENS.IDENTIFIER, value: 'label', line: 1, from: 12, to: 16 },
        { token: '+', value: null, line: 1, from: 18, to: 18 },
        { token: TOKENS.NUMBER, value: '1321', line: 1, from: 20, to: 23 },
    ]);
});

Deno.test("LEXER - increment location", () => {
    const tokens = new Lexer(`
        BNE *+4
    `).parse();
    assertEquals(tokens, [
        { token: TOKENS.OPCODE, value: 'BNE', line: 1, from: 8, to: 10 },
        { token: '*', value: null, line: 1, from: 12, to: 12 },
        { token: '+', value: null, line: 1, from: 13, to: 13 },
        { token: TOKENS.NUMBER, value: '4', line: 1, from: 14, to: 14 },
    ]);
});

Deno.test("LEXER - decrement space", () => {
    const tokens = new Lexer(`
        LDA label - 1
    `).parse();
    assertEquals(tokens, [
        { token: TOKENS.OPCODE, value: 'LDA', line: 1, from: 8, to: 10 },
        { token: TOKENS.IDENTIFIER, value: 'label', line: 1, from: 12, to: 16 },
        { token: '-', value: null, line: 1, from: 18, to: 18 },
        { token: TOKENS.NUMBER, value: '1', line: 1, from: 20, to: 20 },
    ]);
});

Deno.test("LEXER - snippet", () => {
    const list = new Lexer(`
        ; modified by Daryl Rictor to work over a serial terminal connection, August 2002.
        ;
        ; 6551 I/O Port Addresses
        ;
        ACIADat	= 	$7F70
        ACIASta	=	$7F71
        ;
        ; page zero variables
        ;
        BOARD=$50
        ;
    `).parse()

    const tokens = list.map(item => item.token);

    assertEquals(tokens, [
        TOKENS.IDENTIFIER, '=', TOKENS.NUMBER,
        TOKENS.IDENTIFIER, '=', TOKENS.NUMBER,
        TOKENS.IDENTIFIER, '=', TOKENS.NUMBER,
    ])
});

Deno.test("LEXER - program", () => {
    const lexer = new Lexer(`
        ; modified by Daryl Rictor to work over a serial terminal connection, August 2002.
        ;
        ; 6551 I/O Port Addresses
        ;
        ACIADat	= 	$7F70
        ACIASta	=	$7F71
        ;
        ; page zero variables
        ;
        BOARD=$50
        ;
            *=$1000                 ; load into RAM @ $1000-$15FF
        ;
                LDA     #$00        ; REVERSE TOGGLE
                STA     REV
        FOUNX:  LDA	    POINTS,Y    ; BEST CAP
                CMP	    BCAP0,X     ; AT THIS
        POUT1:  lDA     #"|"        ; print vert edge
        match:
                CMP	    BOARD,X		; match found?
        ;
                *= $1580
        SETW:       .byte 	$03, $04, $00
                    .byte 	$10, $17, $11
    `);

    const tokens = lexer.parse().map(item => item.token);

    assertEquals(tokens, [
        TOKENS.IDENTIFIER, '=', TOKENS.NUMBER,                                      // ACIADat	= 	$7F70
        TOKENS.IDENTIFIER, '=', TOKENS.NUMBER,                                      // ACIASta	=	$7F71
        TOKENS.IDENTIFIER, '=', TOKENS.NUMBER,                                      // BOARD=$50
        '*', '=', TOKENS.NUMBER,                                                    // *=$1000
        TOKENS.OPCODE, '#', TOKENS.NUMBER,                                          // LDA     #$00
        TOKENS.OPCODE, TOKENS.IDENTIFIER,                                           // STA     REV
        TOKENS.LABEL, TOKENS.OPCODE, TOKENS.IDENTIFIER, ',', TOKENS.IDENTIFIER,     // FOUNX:  LDA	    POINTS,Y
        TOKENS.OPCODE, TOKENS.IDENTIFIER, ',', TOKENS.IDENTIFIER,                   // CMP	    BCAP0,X
        TOKENS.LABEL, TOKENS.OPCODE, '#', TOKENS.DOUBLE_STRING,                     // POUT1:  lDA     #"|"
        TOKENS.LABEL,                                                               // match:
        TOKENS.OPCODE, TOKENS.IDENTIFIER, ',', TOKENS.IDENTIFIER,                   // CMP	    BOARD,X
        '*', '=', TOKENS.NUMBER,                                                    // *= $1580
        TOKENS.LABEL, TOKENS.TYPE, TOKENS.NUMBER, ',', TOKENS.NUMBER, ',', TOKENS.NUMBER,
        TOKENS.TYPE, TOKENS.NUMBER, ',', TOKENS.NUMBER, ',', TOKENS.NUMBER,
    ])
});
