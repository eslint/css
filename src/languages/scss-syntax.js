/**
 * @fileoverview SCSS syntax for CSSTree.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// imports
//-----------------------------------------------------------------------------

import * as ScssVariable from "./scss/scss-variable.js";
import * as ScssDeclaration from "./scss/scss-declaration.js";
import * as ScssStyleSheet from "./scss/scss-stylesheet.js";
import * as ScssValue from "./scss/scss-value.js";

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { SyntaxConfig } from "@eslint/css-tree";
 */

/** @type {Partial<SyntaxConfig>} */
export default {
    
    atrules: {
        use: {
            prelude: "<string>"
        }
    },

    node: {
        ScssVariable,
        ScssDeclaration,
        Value: ScssValue,
        StyleSheet: ScssStyleSheet
    }
};
