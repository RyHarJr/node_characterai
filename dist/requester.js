"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// responsible for requests
class Requester {
    constructor() {
        this.authorization = "";
    }
    updateToken(token) {
        this.authorization = `Token ${token}`;
    }
    async request(url, options) {
        let headers = {
            "User-Agent": "Character.AI",
            "DNT": "1",
            "Sec-GPC": "1",
            "Connection": "close",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "TE": "trailers"
        };
        let body = options.body;
        if (options.includeAuthorization)
            headers["Authorization"] = this.authorization;
        if (options.contentType)
            headers["Content-Type"] = options.contentType;
        if (options.formData) {
            const formData = options.contentType == 'application/x-www-form-urlencoded' ? new URLSearchParams() : new FormData();
            Object.entries(options.formData).forEach((entry) => formData.append(entry[0], entry[1]));
            body = formData;
        }
        if (typeof body === "string")
            headers["Content-Length"] = body.length;
        return await fetch(url, { headers, method: options.method, body });
    }
}
exports.default = Requester;
//# sourceMappingURL=requester.js.map