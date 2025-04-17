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

export const name = 'ScssVariable';
export const structure = {
    name: String
};

export function parse() {
    return {
        type: name,
        loc: this.getLocation(this.tokenStart, this.tokenEnd),
        name: this.consume(tokenTypes.Ident)
    };
}

export function generate(node) {
    this.token(tokenTypes.Ident, node.name);
}
