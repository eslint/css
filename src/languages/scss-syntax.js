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
import * as ScssSelector from "./scss/scss-selector.js";
import * as ScssPlaceholderSelector from "./scss/scss-placeholder-selector.js";

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
        ScssPlaceholderSelector,
        Selector: ScssSelector,
        Value: ScssValue,
        StyleSheet: ScssStyleSheet
    }
};
