// @ts-ignore | stupid tc, does not allow extensions
import {TOKENS, DATA_TYPES, TYPES, ASCII, TokenInterface, SymbolsTable} from './Lexer.ts';

/**
 *
 * program ::=
 *       operation_list
 *
 * operation_list ::=
 *       operation
 *     | operation operation_list
 *
 * operation ::=
 *       psuedo_operation
 *     | statement_operation
 *
 * psuedo_operation ::=
 *       assignment_operation
 *     | allocation_operation
 *
 * statement_operation ::=
 *       label? op_code address_mode?
 *
 * address_mode ::=
 *       "#" opcode_parameter
 *     | opcode_parameter
 *     | "(" opcode_parameter ")"
 *     | "(" opcode_parameter ")" "," ("X" | "Y")
 *     | "(" opcode_parameter "," ("X" | "Y") ")"
 *     | opcode_parameter "," ("X" | "Y")
 *
 * opcode_parameter ::=
 *       number augment?
 *     | identifier  augment?
 *     | "*"  augment?
 *
 * assignment_operation ::=
 *       label? assignment_code ("*" | identifier | number) augment?
 *
 * allocation_operation ::=
 *       lable? type allocation_argument_list
 *
 * allocation_argument_list ::=
 *       allocation_item
 *     | allocation_item ("," | type) allocation_argument_list
 *
 * allocation_argument ::=
 *       string
 *     | number
 *
 * identifier ::=
 *     [a-zA-Z_][a-zA-Z0-9_]*
 *
 * label ::=
 *     [a-zA-Z_][a-zA-Z0-9_]* ":"?
 *
 * number ::=
 *       hex
 *     | oct
 *     | dec
 *     | bit
 *
 * hex ::= "$" [0-9a-fA-F]+
 * oct ::= "@" [0-7]+
 * bit ::= "%" [0-1]+
 * dec ::= [0-9]+
 *
 * string ::=
 *       '"' .* '"'
 *     | "'" .* "'"
 *
 * augment ::=
 *       ('+'|'-') number
 *
 * type ::=
 *       '.BLOCK'
 *     | '.BYTE'
 *     | '.DBYTE'
 *     | '.TEXT'
 *     | '.WORD'
 *
 * assignment_code ::=
 *       '.EQU'
 *     | '='
 *     | "*="
 *
 * op_code ::=
 *     'ADC' | 'AND' | 'ASL' | 'BCC' | 'BCS' | 'BEQ' | 'BIT' | 'BMI' | 'BNE' | 'BPL' | 'BRK' | 'BVC' | 'BVS' | 'CLC' |
 *     'CLD' | 'CLI' | 'CLV' | 'CMP' | 'CPX' | 'CPY' | 'DEC' | 'DEX' | 'DEY' | 'EOR' | 'INC' | 'INX' | 'INY' | 'JMP' |
 *     'JSR' | 'LDA' | 'LDX' | 'LDY' | 'LSR' | 'NOP' | 'ORA' | 'PHA' | 'PHP' | 'PLA' | 'PLP' | 'ROL' | 'ROR' | 'RTI' |
 *     'RTS' | 'SBC' | 'SEC' | 'SED' | 'SEI' | 'STA' | 'STX' | 'STY' | 'TAX' | 'TAY' | 'TSX' | 'TXA' | 'TXS' | 'TYA'
 *
 * @see https://bottlecaps.de/rr/ui
 */


interface SyntaxError {
    message: string
    token: TokenInterface
}

export class Node {
    public name = 'Node';
    public start: [number, number] = [0,0];
    public end: [number, number] = [0, 0];
    public error: SyntaxError[] = [];

    addError(message: string, token: TokenInterface) {
        this.error.push({message, token});
    }
}

export class Program extends Node {
    public name = 'Program';
    public statements: Array<Location | PseudoOperation | Definition > = [];
}

export class Location extends Node {
    public name = 'Location';
    public data: number | null = null;
    public rawData = '';
    public modifier: '+' | '-' | null = null;
    public modification: number | null = null;
}

export class Assignment extends Location {
    public name = 'Assignment';
    public label = '';
}

export class PseudoOperation extends Node {
    public name = 'PseudoOperation';
    public label: string | null = null;
}

export class PseudoOperationAssignment extends PseudoOperation {
    public name = 'PseudoOperationAssignment';
    public label: string | null = null;
    public value: string | number | null = null;
    public operator: string | number | null = null;
    public data:  number | null = null;
    public modifier: '+' | '-' | null = null;
    public modification: number | null = null;
}

export class PseudoOperationAllocation extends PseudoOperation {
    public name = 'PseudoOperationAllocation';
    public label: string | null = null;
    public value: string[] | number[] | null = null;
    public data:  number[] | null = null;
    public type = 'BYTE';
}

export class Definition extends Node {
    public name = 'Definition';
    public label = '';
    public type = '' //: 'BLOCK' | 'BYTE' | 'DBYTE' | 'TEXT' | 'WORD' = 'BYTE';
    public data: number[] = [];
    public rawData: Array<number | string> = [];
}

export default class Parser {
    private lookahead: TokenInterface|undefined;
    private tokens: TokenInterface[] = [];
    private cursor = 0;
    private symbols: SymbolsTable = new Map();

    public parse(tokens: TokenInterface[], symbols: SymbolsTable = new Map()): Program {
        this.symbols = symbols;
        this.tokens = tokens;

        if (tokens.length === 0) new Program();
        this.lookahead = this.tokens[this.cursor];

        return this.program();
    }

    private program(): Program {
        const node = new Program();
        while (this.cursor < this.tokens.length) {
            switch (this.lookahead?.token) {

                case TOKENS.IDENTIFIER: {
                    this.isNext(TOKENS.PSEUDO_OPERATION) && (node.statements.push(this.psuedoOperation()))
                } continue;
                case TOKENS.PSEUDO_OPERATION: {
                    node.statements.push(this.psuedoOperation());
                } continue;
                default: {
                    this.move();
                }
            }
        }
        return node;
    }

    private psuedoOperation(): PseudoOperation {
        const initialToken = this.lookahead;
        let identifierToken: TokenInterface | null = null;
        if (this.isCurrent(TOKENS.IDENTIFIER)) {
            identifierToken = this.lookahead || null;
            this.match(TOKENS.IDENTIFIER);
        }

        const operatorToken = this.lookahead;
        this.match(TOKENS.PSEUDO_OPERATION);

        if (DATA_TYPES.indexOf((operatorToken?.value! as string).toUpperCase()) >= 0 ) {
            const node = new PseudoOperationAllocation();
            node.start = [initialToken?.line!, initialToken?.from!];
            node.label = identifierToken?.value! || null;
            node.type = operatorToken?.value!
            const initialType = operatorToken?.value!;

            switch (initialType) {
                case TYPES.BLOCK: {
                    try {
                        const numberToken = this.lookahead;
                        this.match(TOKENS.NUMBER);
                        node.data = null;
                        node.value = [this.toNumber(numberToken?.value!)];
                    } catch (e) {
                        node.addError(`Expecting {NUMBER}, got ${this.lookahead?.token}. BLOCK only accepts a number as an argument`, this.lookahead!);
                    }
                } break;
                case TYPES.DBYTE:
                case TYPES.WORD:
                case TYPES.BYTE: {
                    let numberToken = this.lookahead;
                    while(true) {
                        if (node.value === null) node.value = [];
                        if (node.data === null) node.data = [];

                        try {
                            this.match(TOKENS.NUMBER);
                            const numericValue = this.toNumber(numberToken?.value!);
                            switch (initialType) {
                                case TYPES.BYTE: {
                                    if (numericValue > 0xff) {
                                        node.addError(`{BYTE} can not contain value greater than 0xff`, this.lookahead!);
                                    }
                                    (node.value as string[]).push(numberToken?.value!);
                                    (node.data as number[]).push(numericValue);
                                } break;
                                case TYPES.DBYTE: {
                                    // big-endian
                                    if (numericValue > 0xffff) {
                                        node.addError(`{DBYTE} can not contain value greater than 0xffff`, this.lookahead!);
                                    }
                                    (node.value as string[]).push(numberToken?.value!);
                                    (node.data as number[]).push(numericValue >> 8);
                                    (node.data as number[]).push(numericValue & 0xff);
                                    //@todo $aaffcc will become [aaff, cc]
                                    //  should really be [ff, cc]
                                } break;
                                case TYPES.WORD: {
                                    // little-endian
                                    if (numericValue > 0xffff) {
                                        node.addError(`{WORD} can not contain value greater than 0xffff`, this.lookahead!);
                                    }
                                    (node.value as string[]).push(numberToken?.value!);
                                    (node.data as number[]).push(numericValue & 0xff);
                                    (node.data as number[]).push(numericValue >> 8);
                                    //@todo $aaffee will become [ee, aaff]
                                    //  should really be [ee, ff]
                                } break;
                            }
                        } catch (e) {
                            node.addError(`Expecting {NUMBER}, got "${this.lookahead?.value}".`, this.lookahead!);
                            this.skip();
                        }

                        if (this.isCurrent(',')) {
                            this.match(',');
                            numberToken = this.lookahead;
                            continue;
                        }
                        else if (this.isCurrent(TOKENS.PSEUDO_OPERATION)) {
                            if (this.lookahead?.value !== initialType) {
                                node.addError(`Expecting {${initialType}}, got {${this.lookahead?.value}}.`, this.lookahead!);
                            }
                            this.match(TOKENS.PSEUDO_OPERATION);
                            numberToken = this.lookahead;
                            continue;
                        } else {
                            break;
                        }
                    }
                } break;
                case TYPES.TEXT: {
                    let stringToken = this.lookahead;
                    while(true) {
                        if (node.value === null) node.value = [];
                        if (node.data === null) node.data = [];

                        try {
                            if (stringToken?.token === TOKENS.DOUBLE_STRING) {
                                this.match(TOKENS.DOUBLE_STRING);
                            }
                            else if (stringToken?.token === TOKENS.SINGLE_STRING) {
                                this.match(TOKENS.SINGLE_STRING);
                            }
                            else {
                                throw new Error();
                            }

                            const stringArray = stringToken?.value!.split('');
                            node.value = [...(node.value as string[]), ...stringArray];

                            stringArray.forEach(char => {
                                (node.data as number[]).push(
                                    ASCII.indexOf(char)
                                );
                            });

                        } catch (e) {
                            node.addError(`Expecting {DOUBLE_STRING} or {SINGLE_STRING}, got {${this.lookahead?.token}}.`, this.lookahead!);
                            this.skip();
                        }

                        if (this.isCurrent(',')) {
                            this.match(',');
                            stringToken = this.lookahead;
                            continue;
                        }
                        else if (this.isCurrent(TOKENS.PSEUDO_OPERATION)) {
                            if (this.lookahead?.value !== initialType) {
                                node.addError(`Expecting {TEXT}, got {${this.lookahead?.value}}.`, this.lookahead!);
                            }
                            this.match(TOKENS.PSEUDO_OPERATION);
                            stringToken = this.lookahead;
                            continue;
                        } else {
                            break;
                        }
                    }
                } break;
                default:
                    break;
            }

            return node;
        }
        else {
            const node = new PseudoOperationAssignment();
            node.start = [initialToken?.line!, initialToken?.from!];
            node.label = identifierToken?.value! || null;
            node.operator = operatorToken?.value!

            const valueToken = this.lookahead;
            switch (valueToken?.token) {
                case TOKENS.ORIGIN: {
                    node.value = valueToken.value; //@todo
                    node.value = '*';
                    this.match(TOKENS.ORIGIN);
                } break;
                case TOKENS.NUMBER: {
                    node.value = valueToken.value;
                    node.data = this.toNumber(valueToken.value!);
                    this.match(TOKENS.NUMBER);
                } break;
                case TOKENS.IDENTIFIER: {
                    node.value = valueToken.value;
                    this.match(TOKENS.IDENTIFIER);
                } break;
                default: {
                    node.addError(`Expecting {NUMBER} or {IDENTIFIER}, got ${this.lookahead?.token}`, this.lookahead!);
                    node.end = [this.lookahead?.line!, this.lookahead?.to!];
                    this.move();
                } break;
            }

            node.end = [valueToken?.line!, valueToken?.to!];

            if (this.lookahead?.token === '+' || this.lookahead?.token === '-') {
                const modifierToken = this.lookahead;
                switch (this.lookahead?.token) {
                    case '+': {
                        node.modifier = '+';
                        this.match('+');
                    } break;
                    case '-': {
                        node.modifier = '-';
                        this.match('-');
                    } break;
                }

                try {
                    const modificationToken = this.lookahead;
                    this.match(TOKENS.NUMBER);
                    node.modification = this.toNumber(modificationToken?.value!);
                    node.end = [modificationToken?.line!, modificationToken?.to!];
                } catch (e) {
                    node.addError(`Expecting {NUMBER}, got ${this.lookahead?.token}`, this.lookahead!);
                    node.end = [this.lookahead?.line!, this.lookahead?.to!];
                    this.move();
                }
            }

            return node;
        }
    }

    private opcode() {
        const opcode = this.lookahead?.value;
        this.match(TOKENS.OPCODE);

        switch (opcode) {
            // case 'ADC': { } break;
            // case 'AND': { } break;
            // case 'ASL': { } break;
            // case 'BCC': { } break;
            // case 'BCS': { } break;
            // case 'BEQ': { } break;
            // case 'BIT': { } break;
            // case 'BMI': { } break;
            // case 'BNE': { } break;
            // case 'BPL': { } break;
            // case 'BRK': { } break;
            // case 'BVC': { } break;
            // case 'BVS': { } break;
            // case 'CLC': { } break;
            // case 'CLD': { } break;
            // case 'CLI': { } break;
            // case 'CLV': { } break;
            // case 'CMP': { } break;
            // case 'CPX': { } break;
            // case 'CPY': { } break;
            // case 'DEC': { } break;
            // case 'DEX': { } break;
            // case 'DEY': { } break;
            // case 'EOR': { } break;
            // case 'INC': { } break;
            // case 'INX': { } break;
            // case 'INY': { } break;
            // case 'JMP': { } break;
            // case 'JSR': { } break;
            case 'LDA': {
                //Absolute,X
                //Absolute,Y
                //Absolute
                //Immediate

                //Zero Page
                //Zero Page,X

                //(Indirect,X)
                //(Indirect),Y
            } break;
            // case 'LDX': { } break;
            // case 'LDY': { } break;
            // case 'LSR': { } break;
            // case 'NOP': { } break;
            // case 'ORA': { } break;
            // case 'PHA': { } break;
            // case 'PHP': { } break;
            // case 'PLA': { } break;
            // case 'PLP': { } break;
            // case 'ROL': { } break;
            // case 'ROR': { } break;
            // case 'RTI': { } break;
            // case 'RTS': { } break;
            // case 'SBC': { } break;
            // case 'SEC': { } break;
            // case 'SED': { } break;
            // case 'SEI': { } break;
            // case 'STA': { } break;
            // case 'STX': { } break;
            // case 'STY': { } break;
            // case 'TAX': { } break;
            // case 'TAY': { } break;
            // case 'TSX': { } break;
            // case 'TXA': { } break;
            // case 'TXS': { } break;
            // case 'TYA': { } break;

        }
    }

    private match(t: string): void {
        if (t === this.lookahead?.token) {
            this.lookahead = this.tokens[++this.cursor];
        }
        else {
            throw new Error();
        }
    }

    private isNext(t: string): boolean {
        return (
            this.lookahead !== undefined &&
            (t === this.tokens[this.cursor + 1]?.token)
            );
    }

    private isCurrent(t: string): boolean {
        return this.lookahead?.token === t;
    }

    private skip() {
        this.lookahead = this.tokens[++this.cursor];
    }

    private move() {
        this.cursor++;
    }

    private toNumber(number: string): number {
        if (number[0] === '$') {
            return Number(`0x${number.substring(1)}`);
        }
        else if (number[0] === '%') {
            return Number(`0b${number.substring(1)}`);
        }
        else if (!isNaN(Number(number))) {
            return Number(number);
        }
        else {
            return 0;
        }
    }
}
