/**
 * @fileoverview SCSS variable node for CSSTree.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { tokenTypes } from "@eslint/css-tree";

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const DOLLARSIGN = 0x0024;      // U+0024 DOLLAR SIGN ($)

function consumeValueRaw() {
    return this.Raw(this.consumeUntilExclamationMarkOrSemicolon, true);
}

function consumeValue() {
    const startValueToken = this.tokenIndex;
    const value = this.Value();

    if (value.type !== 'Raw' &&
        this.eof === false &&
        this.tokenType !== tokenTypes.Semicolon &&
        this.isBalanceEdge(startValueToken) === false) {
        this.error();
    }

    return value;
}

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

export const name = 'ScssDeclaration';
export const walkContext = 'declaration';
export const structure = {
    variable: String,
    value: ['Value', 'Raw']
};

export function parse() {
    const start = this.tokenStart;
    const startToken = this.tokenIndex;
    const variable = readVariable.call(this);
    let value;

    this.skipSC();
    this.eat(tokenTypes.Colon);
    this.skipSC();

    if (this.parseValue) {
        value = this.parseWithFallback(consumeValue, consumeValueRaw);
    } else {
        value = consumeValueRaw.call(this, this.tokenIndex);
    }

    // Do not include semicolon to range per spec
    // https://drafts.csswg.org/css-syntax/#declaration-diagram

    if (this.eof === false &&
        this.tokenType !== tokenTypes.Semicolon &&
        this.isBalanceEdge(startToken) === false) {
        this.error();
    }
    
    // skip semicolon if present
    if (this.tokenType === tokenTypes.Semicolon) {
        this.next();
    }

    return {
        type: name,
        loc: this.getLocation(start, this.tokenStart),
        variable,
        value
    };
}

export function generate(node) {
    this.token(tokenTypes.Delim, '$');
    this.token(tokenTypes.Ident, node.variable);
    this.token(tokenTypes.Colon, ':');
    this.node(node.value);
}

function readVariable() {
    const start = this.tokenStart;

    if (this.isDelim(DOLLARSIGN)) {
        this.eat(tokenTypes.Delim);
    }
    
    this.eat(tokenTypes.Ident);
    
    return this.substrToCursor(start);
}
