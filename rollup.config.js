import copy from "rollup-plugin-copy";
import del from "rollup-plugin-delete";

export default [
	{
		input: "src/index.js",
		output: [
			{
				file: "dist/cjs/index.cjs",
				format: "cjs",
			},
			{
				file: "dist/esm/index.js",
				format: "esm",
				banner: '// @ts-self-types="./index.d.ts"',
			},
		],
		plugins: [
			del({ targets: ["dist/*"] }),
			copy({
				targets: [
					{
						src: "src/types.ts",
						dest: "dist/cjs",
						rename: "types.cts",
					},
					{ src: "src/types.ts", dest: "dist/esm" },
				],
			}),
		],
	},
];
