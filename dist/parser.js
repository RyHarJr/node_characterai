"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const json_bigint_1 = require("json-bigint");
class Parser {
    static async parseJSON(response, isRequest = true) {
        const text = isRequest ? await response.text() : response;
        try {
            return (0, json_bigint_1.parse)(text);
        }
        catch (_a) {
            return text;
        }
    }
    static stringify(input) {
        return (0, json_bigint_1.stringify)(input);
    }
}
exports.default = Parser;
//# sourceMappingURL=parser.js.map