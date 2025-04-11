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


function getScssVariable(context) {
    if (this.isDelim(DOLLARSIGN)) {
        this.eat(tokenTypes.Delim);
        return this.ScssVariable();
    }
    
    return this.scope.Value.getNode.call(this, context);
}


//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

export const name = 'Value';
export const structure = {
    children: [[]]
};

export function parse() {
    const start = this.tokenStart;
    const children = this.readSequence({
        getNode: getScssVariable
    });

    return {
        type: name,
        loc: this.getLocation(start, this.tokenStart),
        children
    };
}

export function generate(node) {
    this.children(node);
}
