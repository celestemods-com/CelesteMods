export const JAVASCRIPT_TYPE_STRINGS = [
	"number",
	"string",
	"boolean",
	"bigint",
	"symbol",
	"undefined",
	"null",
	"object"
] as const;




export type JavascriptTypeString = (typeof JAVASCRIPT_TYPE_STRINGS)[number];