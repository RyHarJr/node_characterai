"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CAIWebsocket = exports.CAIWebsocketConnectionType = void 0;
const stream_1 = require("stream");
const ws_1 = require("ws");
const parser_1 = __importDefault(require("./parser"));
var CAIWebsocketConnectionType;
(function (CAIWebsocketConnectionType) {
    CAIWebsocketConnectionType[CAIWebsocketConnectionType["Disconnected"] = 0] = "Disconnected";
    CAIWebsocketConnectionType[CAIWebsocketConnectionType["DM"] = 1] = "DM";
    CAIWebsocketConnectionType[CAIWebsocketConnectionType["GroupChat"] = 2] = "GroupChat";
})(CAIWebsocketConnectionType || (exports.CAIWebsocketConnectionType = CAIWebsocketConnectionType = {}));
class CAIWebsocket extends stream_1.EventEmitter {
    async open(withCheck) {
        return new Promise((resolve, reject) => {
            const websocket = new ws_1.WebSocket(this.address, { headers: { Cookie: this.cookie } });
            this.websocket = websocket;
            websocket.once('open', () => {
                if (!withCheck) {
                    this.emit("connected");
                    resolve(this);
                    return;
                }
                const payload = parser_1.default.stringify({ connect: { name: 'js' }, id: 1 }) +
                    parser_1.default.stringify({ subscribe: { channel: `user#${this.userId}` }, id: 1 });
                websocket.send(payload);
            });
            websocket.on('close', (code, reason) => reject(`Websocket connection failed (${code}): ${reason}`));
            websocket.on('error', error => reject(error.message));
            websocket.on('message', async (data) => {
                const message = data.toString('utf-8');
                if (withCheck) {
                    const potentialObject = await parser_1.default.parseJSON(message, false);
                    const connectInformation = potentialObject.connect;
                    if (connectInformation && (connectInformation === null || connectInformation === void 0 ? void 0 : connectInformation.pong) == true) {
                        this.emit("connected");
                        resolve(this);
                        return;
                    }
                }
                // keep alive packet
                if (message == "{}") {
                    websocket.send("{}");
                    return;
                }
                // console.log("RECEIVED", message);
                this.emit("rawMessage", message);
            });
        });
    }
    async sendAsync(options) {
        return new Promise(resolve => {
            var _a;
            let streamedMessage = options.streaming ? [] : undefined;
            let turn;
            this.on("rawMessage", async function handler(message) {
                var _a, _b, _c;
                if (options.parseJSON)
                    message = await parser_1.default.parseJSON(message, false);
                else {
                    this.off("rawMessage", handler);
                    resolve(message);
                    return;
                }
                const disconnectHandlerAndResolve = () => {
                    var _a;
                    (_a = this.websocket) === null || _a === void 0 ? void 0 : _a.removeListener("rawMessage", handler);
                    resolve(options.streaming ? streamedMessage === null || streamedMessage === void 0 ? void 0 : streamedMessage.concat(message) : message);
                };
                // the way it works is you have an accumulation of packets tied to your request id
                // the returnal will only happen if you wait for turn
                // turns will allow you to know the end for streaming (is final)
                // ws requests are turn based
                const { request_id: requestId, command } = message;
                const { expectedReturnCommand } = options;
                // check for requestId (if specified)
                if (requestId && requestId != options.expectedRequestId)
                    return;
                let isFinal = undefined;
                try {
                    // get turn
                    switch (options.messageType) {
                        case CAIWebsocketConnectionType.DM:
                            turn = message.turn;
                            break;
                        case CAIWebsocketConnectionType.GroupChat:
                            turn = (_b = (_a = message.push) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.turn;
                            break;
                    }
                    if (turn)
                        isFinal = turn.candidates[0].is_final;
                }
                finally {
                    // if turn is NOT present, push to queue
                    streamedMessage === null || streamedMessage === void 0 ? void 0 : streamedMessage.push(message);
                    const condition = options.waitForAIResponse ? !((_c = turn === null || turn === void 0 ? void 0 : turn.author) === null || _c === void 0 ? void 0 : _c.is_human) && isFinal : isFinal;
                    // if expectedReturnCommand or condition is met
                    if ((expectedReturnCommand && command == expectedReturnCommand) || condition)
                        disconnectHandlerAndResolve();
                }
            });
            (_a = this.websocket) === null || _a === void 0 ? void 0 : _a.send(options.data);
        });
    }
    close() {
        var _a, _b;
        this.removeAllListeners();
        (_a = this.websocket) === null || _a === void 0 ? void 0 : _a.removeAllListeners();
        (_b = this.websocket) === null || _b === void 0 ? void 0 : _b.close();
    }
    constructor(options) {
        super();
        this.address = "";
        this.cookie = "";
        this.userId = 0;
        this.websocket = undefined;
        this.address = options.url;
        this.cookie = `HTTP_AUTHORIZATION="Token ${options.authorization}"; edge_rollout=${options.edgeRollout};`;
        this.userId = options.userId;
    }
}
exports.CAIWebsocket = CAIWebsocket;
//# sourceMappingURL=websocket.js.map