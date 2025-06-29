"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIdentifier = createIdentifier;
const crypto_1 = require("crypto");
function createIdentifier() { return `id:${(0, crypto_1.randomUUID)()}`; }
//# sourceMappingURL=identifier.js.map