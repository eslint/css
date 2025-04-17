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

const EXCLAMATIONMARK = 0x0021; // U+0021 EXCLAMATION MARK (!)
const DOLLARSIGN = 0x0024;      // U+0024 DOLLAR SIGN ($)

function consumeRaw() {
    return this.Raw(null, false);
}

export const name = 'StyleSheet';
export const walkContext = 'stylesheet';
export const structure = {
    children: [[
        'Comment',
        'CDO',
        'CDC',
        'ScssDeclaration',
        'Atrule',
        'Rule',
        'Raw'
    ]]
};

export function parse() {
    const start = this.tokenStart;
    const children = this.createList();
    let child;

    while (!this.eof) {
        switch (this.tokenType) {
            case tokenTypes.WhiteSpace:
                this.next();
                continue;

            case tokenTypes.Comment:
                // ignore comments except exclamation comments (i.e. /*! .. */) on top level
                if (this.charCodeAt(this.tokenStart + 2) !== EXCLAMATIONMARK) {
                    this.next();
                    continue;
                }

                child = this.Comment();
                break;

            case tokenTypes.CDO: // <!--
                child = this.CDO();
                break;

            case tokenTypes.CDC: // -->
                child = this.CDC();
                break;

            // CSS Syntax Module Level 3
            // §2.2 Error handling
            // At the "top level" of a stylesheet, an <at-keyword-token> starts an at-rule.
            case tokenTypes.AtKeyword:
                child = this.parseWithFallback(this.Atrule, consumeRaw);
                break;
                
            case tokenTypes.Delim:
                if (this.charCodeAt(this.tokenStart) === DOLLARSIGN) {
                    child = this.parseWithFallback(this.ScssDeclaration, consumeRaw);
                    break;
                }

                // fall through
                
            // Anything else starts a qualified rule ...
            default:
                child = this.parseWithFallback(this.Rule, consumeRaw);
        }

        children.push(child);
    }

    return {
        type: 'StyleSheet',
        loc: this.getLocation(start, this.tokenStart),
        children
    };
}

export function generate(node) {
    this.children(node);
}
