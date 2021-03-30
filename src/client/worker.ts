// @ts-ignore | stupid tc
import Lexer from '../parser/Lexer.ts';
// @ts-ignore | stupid tc
import Parser from '../parser/Parser.ts';

onmessage = function (e) {

    const parser = new Parser();
    const lexer = new Lexer(e.data);

    const tree = parser.parse(lexer.parse(), lexer.symbols);
    postMessage(tree);
}



