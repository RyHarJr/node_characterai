import { EventEmitter } from "stream";
export declare enum CAIWebsocketConnectionType {
    Disconnected = 0,
    DM = 1,
    GroupChat = 2
}
export interface ICAIWebsocketCreation {
    url: string;
    edgeRollout: string;
    authorization: string;
    userId: number;
}
export interface ICAIWebsocketMessage {
    data: any;
    parseJSON: boolean;
    expectedReturnCommand?: string;
    messageType: CAIWebsocketConnectionType;
    waitForAIResponse: boolean;
    streaming: boolean;
    expectedRequestId?: string;
}
export interface ICAIWebsocketCommand {
    command: string;
    expectedReturnCommand?: string;
    originId: 'Android' | 'web-next';
    waitForAIResponse?: boolean;
    streaming: boolean;
    payload: any;
}
export declare class CAIWebsocket extends EventEmitter {
    private address;
    private cookie;
    private userId;
    private websocket?;
    open(withCheck: boolean): Promise<CAIWebsocket>;
    sendAsync(options: ICAIWebsocketMessage): Promise<string | any>;
    close(): void;
    constructor(options: ICAIWebsocketCreation);
}
//# sourceMappingURL=websocket.d.ts.map