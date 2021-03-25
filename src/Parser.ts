import {TOKENS, TYPES, ASCII, TokenInterface, SymbolsTable} from './Lexer.ts';

/**
 * assignment ::= id "=" number
 *
 * definition ::=
 *       label type string
 *     | label type number-list
 *
 * id ::= alpha_underscore alpha_numeric_underscore*
 * label ::= alpha_underscore alpha_numeric_underscore* ":"
 *
 * type ::=
 *       '.BLOCK'
 *     | '.BYTE'
 *     | '.DBYTE'
 *     | '.TEXT'
 *     | '.WORD'
 *
 * number ::= hex | oct | dec | bit
 * number-list ::=
 *       number
 *     | number "," number-list
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
 * alpha_underscore ::= [a-ZA-Z_]
 * alpha_numeric_underscore ::= [0-9a-ZA-Z_]
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
    public statements: Array<Location | Assignment | Definition> = [];
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

    /**
     * <program>
     *  | <statement-list>
     *  | <location-list>
     *  | <assignment-list>
     *  | <definition-list>
     *
     *
     * <location-list>
     *  | <location> <location-list>
     *  | <location>
     *
     * <assignment-list>
     *  | <assignment> <assignment-list>
     *  | <assignment>
     */
    private program(): Program {
        const node = new Program();
        while (this.cursor < this.tokens.length) {
            switch (this.lookahead?.token) {

                case TOKENS.IDENTIFIER: {
                    node.statements.push(
                        this.isNext(TOKENS.TYPE)
                            ? this.definition()
                            : this.assignment()
                    );
                } continue;

                // case TOKENS.LABEL: {} continue;
                // case TOKENS.OPCODE: {
                //     this.opcode();
                // } continue;

                case '*': {
                    node.statements.push(
                        this.location()
                    );
                } continue;
                default: {
                    this.move();
                }
            }
        }
        return node;
    }

    /**
     * <location> =
     *  | '*' '=' (NUMBER|IDENTIFIER)
     *  | '*' '=' (NUMBER|IDENTIFIER) <augment>
     *
     * <augment> =
     *  | '+' NUMBER
     *  | '-' NUMBER
     */
    private location(): Location {
        const node = new Location();
        const starToken = this.lookahead;
        this.match('*');
        node.start = [starToken?.line!, starToken?.from!]

        try {
            this.match('=');
        } catch(e) {
            node.addError(`Expecting {=}, got ${this.lookahead?.token}`, this.lookahead!);
            this.move();
        }
        try {
            const valueToken = this.lookahead;
            switch (valueToken?.token) {
                case TOKENS.NUMBER: {
                    this.match(TOKENS.NUMBER);
                    node.data = this.toNumber(valueToken?.value!);
                    node.rawData = valueToken?.value!;
                } break;
                case TOKENS.IDENTIFIER: {
                    this.match(TOKENS.IDENTIFIER);
                    node.rawData = valueToken?.value!;
                    if (this.symbols.has(valueToken?.value!)) {
                        node.data = (this.symbols.get(valueToken?.value!)?.value || null);
                    }
                } break;
                default: {throw new Error()}
            }
            node.end = [valueToken.line, valueToken.to];
        } catch (e) {
            node.addError(`Expecting {NUMBER} or {IDENTIFIER}, got ${this.lookahead?.token}`, this.lookahead!);
            node.end = [this.lookahead?.line!, this.lookahead?.to!];
            this.move();
        }

        if (this.isCurrent('+')) {
            this.match('+');
            try {
                const numberToken = this.lookahead;
                this.match(TOKENS.NUMBER);
                const numberValue = this.toNumber(numberToken?.value!);
                if (node.data) {
                    node.data += numberValue;
                }
                node.modifier = '+';
                node.modification = numberValue;
                node.end = [numberToken?.line!, numberToken?.to!];
            } catch (e) {
                node.addError(`Expecting {NUMBER}, got ${this.lookahead?.token}`, this.lookahead!);
                this.move();
            }
        }

        if (this.isCurrent('-')) {
            this.match('-');
            try {
                const numberToken = this.lookahead;
                this.match(TOKENS.NUMBER);
                const numberValue = this.toNumber(numberToken?.value!);
                if (node.data) {
                    node.data -= numberValue;
                }
                node.modifier = '-';
                node.modification = numberValue;
                node.end = [numberToken?.line!, numberToken?.to!];
            } catch (e) {
                node.addError(`Expecting {NUMBER}, got ${this.lookahead?.token}`, this.lookahead!);
                this.move();
            }
        }

        return node;
    }

    /**
     * <assignment> =
     *  | IDENTIFIER '=' NUMBER
     */
    private assignment(): Assignment {
        const node = new Assignment();
        const identifierToken = this.lookahead;
        this.match(TOKENS.IDENTIFIER);
        node.label = identifierToken?.value!;
        node.start = [identifierToken?.line!, identifierToken?.from!];

        try {
            this.match('=');
        }
        catch (e) {
            node.addError(`Expecting {=}, got ${this.lookahead?.token}`, this.lookahead!);
            this.move();
        }

        const numericToken = this.lookahead;

        try {
            this.match(TOKENS.NUMBER);
            node.data = this.toNumber(numericToken?.value!);
            node.rawData = numericToken?.value!;
            const symbol = this.symbols.get(node.label)!;
            //@todo what if the symbol is not found?
            this.symbols.set(node.label, { ...symbol, value: node.data});
        } catch (e) {
            node.addError(`Expecting {NUMBER}, got ${this.lookahead?.token}`,this.lookahead!);
            this.move();
        }
        node.end = [numericToken?.line!, numericToken?.to!];
        return node;
    }

    /**
     *
     * <definition>
     *  | LABEL TYPE <params>
     *
     * <params>
     *  |
     */
    private definition(): Definition {
        const node = new Definition();

        const idToken = this.lookahead!;
        node.label = idToken.value!;
        node.start = [idToken.line, idToken.from];

        this.match(TOKENS.IDENTIFIER);

        const typeToken = this.lookahead!;
        if (TYPES.indexOf(typeToken?.value!.toUpperCase()) < 0) {
            node.addError(
                `Type definition of ${typeToken?.value!} is not supported`,
                this.lookahead!
            );
        }
        this.match(TOKENS.TYPE);

        if (this.isCurrent(TOKENS.DOUBLE_STRING)) {
            const charToken = this.lookahead!;
            this.match(TOKENS.DOUBLE_STRING);

            node.type = typeToken.value!.toUpperCase();
            node.rawData = charToken.value!.split('');
            node.data = charToken.value!.split('').map(char => ASCII.indexOf(char));
            node.end = [charToken.line, charToken.to];
        }
        else if (this.isCurrent(TOKENS.SINGLE_STRING)) {
            const charToken = this.lookahead!;
            this.match(TOKENS.SINGLE_STRING);

            node.type = typeToken.value!.toUpperCase();
            node.rawData = charToken.value!.split('');
            node.data = charToken.value!.split('').map(char => ASCII.indexOf(char));
            node.end = [charToken.line, charToken.to];
        }
        else if (this.isCurrent(TOKENS.NUMBER)) {
            while(true) {
                const numberToken = this.lookahead;
                try {
                    this.match(TOKENS.NUMBER);
                } catch (e) {
                    node.addError(`This array can only contain {NUMBER} items`, numberToken!);
                    this.move();
                    break;
                }
                node.data.push(this.toNumber(numberToken?.value!));
                node.rawData.push(numberToken?.value!);
                node.type = typeToken.value!.toUpperCase();
                node.end = [numberToken?.line!, numberToken?.to!];

                if (this.isCurrent(',')) {
                    this.match(',')
                    continue;
                }
                else if (this.isCurrent(TOKENS.TYPE)) {
                    this.match(TOKENS.TYPE)
                    continue;
                }
                else {
                    break;
                }
            }
        } else {
            node.addError(`{${this.lookahead?.token}} is not supported`, this.lookahead!);
            this.move();
        }

        return node;

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
            (t === this.tokens[this.cursor + 1].token)
            );
    }

    private isCurrent(t: string): boolean {
        return this.lookahead?.token === t;
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
