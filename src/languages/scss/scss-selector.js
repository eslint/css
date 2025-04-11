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

const PERCENT = 0x0025;        // U+0025 PERCENT SIGN (%)


function getSelectorsWithScss(context) {
    if (this.isDelim(PERCENT)) {
        return this.ScssPlaceholderSelector();
    }
    return this.scope.Selector.getNode.call(this, context);
}

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

export const name = 'Selector';
export const structure = {
    children: [[
        'TypeSelector',
        'IdSelector',
        'ScssPlaceholderSelector',
        'ClassSelector',
        'AttributeSelector',
        'PseudoClassSelector',
        'PseudoElementSelector',
        'Combinator'
    ]]
};

export function parse() {
    const children = this.readSequence({
        getNode: getSelectorsWithScss
    });

    // nothing were consumed
    if (this.getFirstListNode(children) === null) {
        this.error('Selector is expected');
    }

    return {
        type: name,
        loc: this.getLocationFromList(children),
        children
    };
}

export function generate(node) {
    this.children(node);
}
