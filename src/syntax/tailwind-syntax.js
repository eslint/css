/**
 * @fileoverview CSSTree syntax for Tailwind CSS extensions.
 * @author Nicholas C. Zakas
 */
export default {
	atrules: {
		apply: {
			prelude: "<ident>+",
		},
		tailwind: {
			prelude: "base | components | utilities",
		},
		config: {
			prelude: "<string>",
		},
	},

	/*
	 * CSSTree doesn't currently support custom functions properly, so leaving
	 * these out for now.
	 * https://github.com/csstree/csstree/issues/292
	 */
	// types: {
	// 	"tailwind-theme-base": "spacing | colors",
	// 	"tailwind-theme-color": "<tailwind-theme-base> [ '.' [ <ident> | <integer> ] ]+",
	// 	"tailwind-theme-name": "<tailwind-theme-color>",
	// 	"tailwind-theme()": "theme( <tailwind-theme-name>)",
	// },
};
