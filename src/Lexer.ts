export interface TokenInterface {
    line: number,
    token: string,
    value: string | null,
    from: number,
    to: number,
}

export type SymbolsTable = Map<string, { type: string, value: number | null }>;

export const OPCODES = [
    'ADC', 'AND', 'ASL', 'BCC', 'BCS', 'BEQ', 'BIT', 'BMI', 'BNE', 'BPL', 'BRK', 'BVC', 'BVS', 'CLC',
    'CLD', 'CLI', 'CLV', 'CMP', 'CPX', 'CPY', 'DEC', 'DEX', 'DEY', 'EOR', 'INC', 'INX', 'INY', 'JMP',
    'JSR', 'LDA', 'LDX', 'LDY', 'LSR', 'NOP', 'ORA', 'PHA', 'PHP', 'PLA', 'PLP', 'ROL', 'ROR', 'RTI',
    'RTS', 'SBC', 'SEC', 'SED', 'SEI', 'STA', 'STX', 'STY', 'TAX', 'TAY', 'TSX', 'TXA', 'TXS', 'TYA',
];

export const TYPES = [
    'BLOCK', 'BYTE', 'DBYTE', 'TEXT', 'WORD',
];

export const ASCII = [
    'NUL',      //  0  (null)
    'SOH',      //  1  (start of heading)
    'STX',      //  2  (start of text)
    'ETX',      //  3  (end of text)
    'EOT',      //  4  (end of transmission)
    'ENQ',      //  5  (enquiry)
    'ACK',      //  6  (acknowledge)
    'BEL',      //  7  (bell)
    'BS',       //  8  (backspace)
    'TAB',      //  9  (horizontal tab)
    'LF',       // 10  (NL line feed, new line)
    'VT',       // 11  (vertical tab)
    'FF',       // 12  (NP form feed, new page)
    'CR',       // 13  (carriage return)
    'SO',       // 14  (shift out)
    'SI',       // 15  (shift in)
    'DLE',      // 16  (data link escape)
    'DC1',      // 17  (device control 1)
    'DC2',      // 18  (device control 2)
    'DC3',      // 19  (device control 3)
    'DC4',      // 20  (device control 4)
    'NAK',      // 21  (negative acknowledge)
    'SYN',      // 22  (synchronous idle)
    'ETB',      // 23  (end of trans. block)
    'CAN',      // 24  (cancel)
    'EM',       // 25  (end of medium)
    'SUB',      // 26  (substitute)
    'ESC',      // 27  (escape)
    'FS',       // 28  (file separator)
    'GS',       // 29  (group separator)
    'RS',       // 30  (record separator)
    'US',       // 31  (unit separator)

    //

    ' ',        // 32  SPACE
    '!',        // 33
    '"',        // 34
    '#',        // 35
    '$',        // 36
    '%',        // 37
    '&',        // 38
    '\'',       // 39
    '(',        // 40
    ')',        // 41
    '*',        // 42
    '+',        // 43
    ',',        // 44
    '-',        // 45
    '.',        // 46
    '/',        // 47
    '0',        // 48
    '1',        // 49
    '2',        // 50
    '3',        // 51
    '4',        // 52
    '5',        // 53
    '6',        // 54
    '7',        // 55
    '8',        // 56
    '9',        // 57
    ':',        // 58
    ';',        // 59
    '<',        // 60
    '=',        // 61
    '>',        // 62
    '?',        // 63

    //

    '@',        // 64
    'A',        // 65
    'B',        // 66
    'C',        // 67
    'D',        // 68
    'E',        // 69
    'F',        // 70
    'G',        // 71
    'H',        // 72
    'I',        // 73
    'J',        // 74
    'K',        // 75
    'L',        // 76
    'M',        // 77
    'N',        // 78
    'O',        // 79
    'P',        // 80
    'Q',        // 81
    'R',        // 82
    'S',        // 83
    'T',        // 84
    'U',        // 85
    'V',        // 86
    'W',        // 87
    'X',        // 88
    'Y',        // 89
    'Z',        // 90
    '[',        // 91
    '\\',       // 92
    ']',        // 93
    '^',        // 94
    '_',        // 95

    //

    '`',        //  96
    'a',        //  97
    'b',        //  98
    'c',        //  99
    'd',        // 100
    'e',        // 101
    'f',        // 102
    'g',        // 103
    'h',        // 104
    'i',        // 105
    'j',        // 106
    'k',        // 107
    'l',        // 108
    'm',        // 109
    'n',        // 110
    'o',        // 111
    'p',        // 112
    'q',        // 113
    'r',        // 114
    's',        // 115
    't',        // 116
    'u',        // 117
    'v',        // 118
    'w',        // 119
    'x',        // 120
    'y',        // 121
    'z',        // 122
    '{',        // 123
    '|',        // 124
    '}',        // 125
    '~',        // 126
    'DEL',      // 127
];

export const TOKENS = {
    NONE: 'NONE',
    COMMENT: 'COMMENT',
    IDENTIFIER: 'IDENTIFIER',
    NUMBER: 'NUMBER',
    TYPE: 'TYPE',
    LABEL: 'LABEL',
    OPCODE: 'OPCODE',
    DOUBLE_STRING: 'DOUBLE_STRING',
    SINGLE_STRING: 'SINGLE_STRING',
};

export default class Lexer {
    private source: string;
    private cursor = 0;
    private line = 0;
    private column = 0;
    private tokens: TokenInterface[] = [];
    private state: string = TOKENS.NONE;
    private buffer = '';
    private start = 0;
    private symbolTable: SymbolsTable = new Map();

    constructor(source: string) {
        this.source = source;
        this.symbolTable = new Map();
    }

    get symbols(): SymbolsTable {
        return this.symbolTable;
    }

    parse(): TokenInterface[] {
        while (true) {
            const char: string = this.source[this.cursor];

            if (char === undefined) {
                if (this.state !== TOKENS.COMMENT && this.state !== TOKENS.NONE) {
                    const token = (this.state === TOKENS.IDENTIFIER && this.isOpCode(this.buffer))
                        ? TOKENS.OPCODE
                        : this.state;
                    this.tokens.push({
                        line: this.line,
                        to: this.column - 1,
                        from: this.start,
                        token: token,
                        value: this.buffer,
                    });
                    this.reserve(token, this.buffer);
                }
                break;
            }
            else if (char === ' '){
                if (this.state === TOKENS.DOUBLE_STRING || this.state === TOKENS.SINGLE_STRING) {
                    this.buffer += char;
                    this.cursor++;
                    this.column++;
                }
                else if (
                    this.state === TOKENS.IDENTIFIER ||
                    this.state === TOKENS.TYPE ||
                    this.state === TOKENS.NUMBER ||
                    this.state === TOKENS.LABEL ||
                    this.state === TOKENS.OPCODE
                ) {
                    const token = (this.state === TOKENS.IDENTIFIER && this.isOpCode(this.buffer))
                        ? TOKENS.OPCODE
                        : this.state;
                    this.tokens.push({
                        line: this.line,
                        to: this.column - 1,
                        from: this.start,
                        token: token,
                        value: this.buffer,
                    });
                    this.reserve(token, this.buffer);
                    this.buffer = '';
                    this.cursor++;
                    this.column++;
                    this.state = TOKENS.NONE;
                }
                else {
                    this.cursor++;
                    this.column++;
                }
            }
            else if (char === '\t'){
                if (this.state !== TOKENS.COMMENT && this.state !== TOKENS.NONE) {
                    const token = (this.state === TOKENS.IDENTIFIER && this.isOpCode(this.buffer))
                        ? TOKENS.OPCODE
                        : this.state;
                    this.tokens.push({
                        line: this.line,
                        to: this.column - 1,
                        from: this.start,
                        token: token,
                        value: this.buffer,
                    });
                    this.reserve(token, this.buffer);
                    this.buffer = '';
                    this.cursor++;
                    this.column++;
                    this.state = TOKENS.NONE;
                } else {
                    this.cursor++;
                    this.column++;
                }
            }
            else if (char === '\n'){
                if (this.state !== TOKENS.COMMENT && this.state !== TOKENS.NONE) {
                    const token = (this.state === TOKENS.IDENTIFIER && this.isOpCode(this.buffer))
                        ? TOKENS.OPCODE
                        : this.state;
                    this.tokens.push({
                        line: this.line,
                        to: this.column - 1,
                        from: this.start,
                        token: token,
                        value: this.buffer,
                    });
                    this.reserve(token, this.buffer);
                    this.state = TOKENS.NONE;
                    this.buffer = '';
                    this.cursor++;
                    this.column++;
                }
                else {
                    this.cursor++;
                    this.state = TOKENS.NONE;
                }
                this.line++;
                this.column = 0;
            }
            else if (char === '+' || char === '-') {
                if (this.state === TOKENS.COMMENT) {
                    this.cursor++;
                    this.column++;
                }
                else if (this.state === TOKENS.NONE) {
                    this.tokens.push({
                        line: this.line,
                        to: this.column,
                        from: this.column,
                        token: char,
                        value: null,
                    });
                    this.cursor++;
                    this.column++;
                    this.state = TOKENS.NONE;
                }
                else if (this.state === TOKENS.IDENTIFIER || this.state === TOKENS.LABEL) {
                    this.tokens.push({
                        line: this.line,
                        to: this.column - 1,
                        from: this.start,
                        token: this.state,
                        value: this.buffer,
                    });
                    this.reserve(this.state, this.buffer);
                    this.tokens.push({
                        line: this.line,
                        to: this.column,
                        from: this.column,
                        token: char,
                        value: null,
                    });
                    this.cursor++;
                    this.column++;
                    this.start = 0;
                    this.buffer = '';
                    this.state = TOKENS.NONE;
                }
            }
            else if (char === '('){
                if (this.state === TOKENS.SINGLE_STRING || this.state === TOKENS.DOUBLE_STRING) {
                    this.buffer += char;
                }
                else if (this.state === TOKENS.IDENTIFIER) {
                    this.tokens.push({
                        line: this.line,
                        to: this.column,
                        from: this.column,
                        token: this.state,
                        value: this.buffer,
                    });
                    this.reserve(this.state, this.buffer);
                    this.tokens.push({
                        line: this.line,
                        to: this.column,
                        from: this.column,
                        token: '(',
                        value: null,
                    });
                    this.start = 0;
                    this.buffer = '';
                    this.state = TOKENS.NONE;
                }
                else if (this.state === TOKENS.NONE) {
                    this.tokens.push({
                        line: this.line,
                        to: this.column,
                        from: this.column,
                        token: '(',
                        value: null,
                    });
                    this.start = 0;
                    this.buffer = '';
                    this.state = TOKENS.NONE;
                }
                else if (this.state === TOKENS.COMMENT) {
                    //@todo ?
                }
                this.cursor++;
                this.column++;
            }
            else if (char === ')'){
                if (this.state === TOKENS.SINGLE_STRING || this.state === TOKENS.DOUBLE_STRING) {
                    this.buffer += char;
                }
                else if (this.state === TOKENS.IDENTIFIER || this.state === TOKENS.NUMBER) {
                    this.tokens.push({
                        line: this.line,
                        to: this.column - 1,
                        from: this.start,
                        token: this.state,
                        value: this.buffer,
                    });
                    this.reserve(this.state, this.buffer);
                    this.tokens.push({
                        line: this.line,
                        to: this.column,
                        from: this.column,
                        token: ')',
                        value: null,
                    });
                    this.start = 0;
                    this.buffer = '';
                    this.state = TOKENS.NONE;
                }
                else if (this.state === TOKENS.NONE) {
                    this.tokens.push({
                        line: this.line,
                        to: this.column,
                        from: this.column,
                        token: ')',
                        value: null,
                    });
                }
                else if (this.state === TOKENS.COMMENT) {
                    //@todo ?
                }
                this.cursor++;
                this.column++;
            }
            else if (char === '.'){
                if (this.state === TOKENS.SINGLE_STRING || this.state === TOKENS.DOUBLE_STRING) {
                    this.buffer += char;
                }
                else if (this.state !== TOKENS.COMMENT) {
                    this.state = TOKENS.TYPE;
                    this.start = this.column;
                    this.buffer = '';
                }
                this.cursor++;
                this.column++;
            }
            else if (char === '='){
                if (this.state === TOKENS.SINGLE_STRING || this.state === TOKENS.DOUBLE_STRING) {
                    this.buffer += char;
                }
                else if (this.state === TOKENS.IDENTIFIER) {
                    this.tokens.push({
                        line: this.line,
                        to: this.column,
                        from: this.column,
                        token: this.state,
                        value: this.buffer,
                    });
                    this.reserve(this.state, this.buffer);
                    this.tokens.push({
                        line: this.line,
                        to: this.column,
                        from: this.column,
                        token: '=',
                        value: null,
                    });
                    this.start = 0;
                    this.buffer = '';
                    this.state = TOKENS.NONE;
                }
                else if (this.state === TOKENS.NONE) {
                    this.tokens.push({
                        line: this.line,
                        to: this.column,
                        from: this.column,
                        token: '=',
                        value: null,
                    });
                }
                else if (this.state === TOKENS.COMMENT) {
                    //@todo ?
                }
                this.cursor++;
                this.column++;
            }
            else if (char === ','){
                if (this.state === TOKENS.SINGLE_STRING || this.state === TOKENS.DOUBLE_STRING) {
                    this.buffer += char;
                }
                else if (this.state !== TOKENS.COMMENT) {
                    if (this.state !== TOKENS.NONE) {
                        this.tokens.push({
                            line: this.line,
                            to: this.column - 1,
                            from: this.start,
                            token: this.state,
                            value: this.buffer,
                        });
                        this.reserve(this.state, this.buffer);
                    }
                    this.tokens.push({
                        line: this.line,
                        to: this.column,
                        from: this.column,
                        token: ',',
                        value: null,
                    });
                    this.start = 0;
                    this.buffer = '';
                    this.state = TOKENS.NONE;
                }
                this.cursor++;
                this.column++;
            }
            else if (char === '#'){
                if (this.state === TOKENS.SINGLE_STRING || this.state === TOKENS.DOUBLE_STRING) {
                    this.buffer += char;
                }
                else if (this.state !== TOKENS.COMMENT) {
                    this.state = TOKENS.NONE;
                    this.start = this.column;
                    this.tokens.push({
                        line: this.line,
                        to: this.column,
                        from: this.start,
                        token: '#',
                        value: null,
                    });
                }
                this.cursor++;
                this.column++;
            }
            else if (char === '*'){
                if (this.state === TOKENS.SINGLE_STRING || this.state === TOKENS.DOUBLE_STRING) {
                    this.buffer += char;
                }
                else if (this.state !== TOKENS.COMMENT) {
                    this.state = TOKENS.NONE;
                    this.start = this.column;
                    this.tokens.push({
                        line: this.line,
                        to: this.column,
                        from: this.start,
                        token: '*',
                        value: null,
                    });
                }
                this.cursor++;
                this.column++;
            }
            else if (char === ';'){
                if (this.state === TOKENS.SINGLE_STRING || this.state === TOKENS.DOUBLE_STRING) {
                    this.buffer += char;
                }
                else {
                    this.state = TOKENS.COMMENT;
                }
                this.cursor++;
                this.column++;
            }
            else if (char === '$') {
                if (this.state === TOKENS.SINGLE_STRING || this.state === TOKENS.DOUBLE_STRING) {
                    this.buffer += char;
                }
                else if (this.state !== TOKENS.COMMENT) {
                    this.state = TOKENS.NUMBER;
                    this.start = this.column;
                    this.buffer += char;
                }
                this.cursor++;
                this.column++;
            }
            else if (char === '%') {
                if (this.state === TOKENS.DOUBLE_STRING || this.state === TOKENS.SINGLE_STRING) {
                    this.buffer += char;
                }
                else if (this.state === TOKENS.COMMENT) {
                    // @todo ... not much to do here!
                }
                else {
                    this.state = TOKENS.NUMBER;
                    this.start = this.column;
                    this.buffer = char;
                }
                this.cursor++;
                this.column++;
            }
            else if (char === '"') {
                if (this.state === TOKENS.DOUBLE_STRING) {
                    this.tokens.push({
                        line: this.line,
                        to: this.column,
                        from: this.start,
                        token: this.state,
                        value: this.buffer,
                    });
                    this.state = TOKENS.NONE;
                    this.buffer = '';
                    this.cursor++;
                    this.column++;
                }
                else if (this.state === TOKENS.SINGLE_STRING) {
                    this.buffer += char;
                    this.cursor++;
                    this.column++;
                }
                else if (this.state === TOKENS.COMMENT) {
                    this.cursor++;
                    this.column++;
                }
                else if (this.state === TOKENS.NONE) {
                    this.state = TOKENS.DOUBLE_STRING;
                    this.start = this.column;
                    this.buffer = '';
                    // this.buffer = char;
                    this.cursor++;
                    this.column++;
                }
                else {
                    this.tokens.push({
                        line: this.line,
                        to: this.column,
                        from: this.start,
                        token: this.state,
                        value: this.buffer + char,
                    });
                    this.reserve(this.state, this.buffer);
                    this.state = TOKENS.DOUBLE_STRING;
                    this.buffer = '';
                    // this.buffer = char;
                    this.cursor++;
                    this.column++;
                }
            }
            else if (char === "'") {
                if (this.state === TOKENS.SINGLE_STRING) {
                    this.tokens.push({
                        line: this.line,
                        to: this.column,
                        from: this.start,
                        token: this.state,
                        // value: this.buffer + char,
                        value: this.buffer,
                    });
                    this.state = TOKENS.NONE;
                    this.buffer = '';
                    this.cursor++;
                    this.column++;
                }
                else if (this.state === TOKENS.DOUBLE_STRING) {
                    this.buffer += char;
                    this.cursor++;
                    this.column++;
                }
                else if (this.state === TOKENS.COMMENT) {
                    this.cursor++;
                    this.column++;
                }
                else if (this.state === TOKENS.NONE) {
                    this.state = TOKENS.SINGLE_STRING;
                    this.start = this.column;
                    // this.buffer = char;
                    this.buffer = '';
                    this.cursor++;
                    this.column++;
                }
                else {
                    this.tokens.push({
                        line: this.line,
                        to: this.column,
                        from: this.start,
                        token: this.state,
                        value: this.buffer + char,
                    });
                    this.reserve(this.state, this.buffer);
                    this.state = TOKENS.SINGLE_STRING;
                    this.buffer = char;
                    this.cursor++;
                    this.column++;
                }
            }
            else if (char === ':') {
                if (this.state === TOKENS.SINGLE_STRING || this.state === TOKENS.DOUBLE_STRING) {
                    this.buffer += char;
                }
                else if (this.state === TOKENS.IDENTIFIER) {
                    this.tokens.push({
                        line: this.line,
                        to: this.column,
                        from: this.start,
                        token: TOKENS.LABEL,
                        value: this.buffer,
                    });
                    this.reserve(TOKENS.LABEL, this.buffer);
                    this.state = TOKENS.NONE;
                    this.buffer = '';
                }
                this.cursor++;
                this.column++;
            }
            else if (char.match(/[a-zA-Z_]/)) {
                if (this.state === TOKENS.COMMENT) {
                    this.cursor++;
                    this.column++;
                }
                else if (this.state === TOKENS.NONE) {
                    this.state = TOKENS.IDENTIFIER;
                    this.start = this.column;
                    this.buffer = char;
                    this.cursor++;
                    this.column++;
                }
                else if (this.state === TOKENS.TYPE) {
                    this.buffer += char;
                    this.cursor++;
                    this.column++;
                }
                else if (this.state === TOKENS.DOUBLE_STRING) {
                    this.buffer += char;
                    this.cursor++;
                    this.column++;
                }
                else if (this.state === TOKENS.SINGLE_STRING) {
                    this.buffer += char;
                    this.cursor++;
                    this.column++;
                }
                else {
                    this.buffer += char;
                    this.cursor++;
                    this.column++;
                }
            }
            else if (char.match(/[0-9]/)) {
                if (this.state === TOKENS.SINGLE_STRING || this.state === TOKENS.DOUBLE_STRING) {
                    this.buffer += char;
                }
                else if (this.state === TOKENS.NONE) { //@todo: does this work
                    this.state = TOKENS.NUMBER;
                    this.start = this.column;
                    this.buffer = char;
                }
                else if (this.state === TOKENS.NUMBER) {
                    this.buffer += char;
                }
                else if (this.state === TOKENS.IDENTIFIER || this.state === TOKENS.LABEL) {
                    this.buffer += char;
                }

                this.cursor++;
                this.column++;
            }
            else {
                if (this.state === TOKENS.COMMENT) {
                    this.cursor++;
                    this.column++;
                }
                else if (this.state === TOKENS.DOUBLE_STRING || this.state === TOKENS.SINGLE_STRING) {
                    this.buffer += char;
                    this.cursor++;
                    this.column++;
                }
                //@todo: what else?
            }
        }

        return this.tokens;
    }

    private isOpCode(code: string): boolean {
        return OPCODES.indexOf(code.toUpperCase()) >= 0;
    }

    private reserve(type: string, name: string, value: number | null = null) {
        if (type === TOKENS.IDENTIFIER || type === TOKENS.LABEL) {
            !this.symbolTable.has(name) && this.symbolTable.set(name, {value, type});
        }
    }
}
