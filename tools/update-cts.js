/**
 * @fileoverview Replaces all .js references with .cjs references.
 *
 * Usage:
 *  node tools/update-cts.js filename1.js filename2.js ...
 *
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import fs from "node:fs";

//-----------------------------------------------------------------------------
// Main
//-----------------------------------------------------------------------------

// read files from the command line
const files = process.argv.slice(2);

files.forEach(filePath => {
	let text = fs.readFileSync(filePath, "utf8");

	text = text.replace(/(\.\/(index|types))\.js/gu, "$1.cjs");

	fs.writeFileSync(filePath, text, "utf8");
});
