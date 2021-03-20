
const NUMBER = '((\\$|%)[a-fA-F0-9]*)|([a-fA-F0-9]*(H|B))|([0-9]*)';
const LABEL = '([a-zA-Z_][a-zA-Z0-9_]*:)';
const LITERAL = '([a-zA-Z_][a-zA-Z0-9_]*)';
const TOKEN = '([A-Z]{3})';
const INCREMENT = '((\\+|-)[0-9]*)';
const REG = '(,(y|Y)|(x|X))';
const POINTER = `(\\*${INCREMENT}?)`;

const LITERAL_w_INCREMENT = `${LITERAL}${INCREMENT}`;

const CODES = {
    LABEL: new RegExp(`^${LABEL}$`),
    INSTRUCTION: new RegExp(`^${LABEL}?\\s*${TOKEN}\\s*#?(${POINTER}?|${NUMBER}|${LITERAL_w_INCREMENT}?|\\(${LITERAL_w_INCREMENT}?${REG}?\\)${REG}?)$`),
};

export default CODES;