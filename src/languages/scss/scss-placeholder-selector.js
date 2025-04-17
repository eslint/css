/**
 * @fileoverview SCSS variable node for CSSTree.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { tokenTypes } from "@eslint/css-tree";

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

export const name = 'ScssPlaceholderSelector';
export const structure = {
    name: String
};

export function parse() {
    const start = this.tokenStart;
    
    this.eat(tokenTypes.Delim);

    return {
        type: name,
        loc: this.getLocation(start, this.tokenStart),
        name: this.consume(tokenTypes.Ident)
    };
}

export function generate(node) {
    this.tokenize(node.name);
}
