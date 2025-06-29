import { Conversation } from "../chat/conversation";
export declare class GroupChatConversation extends Conversation {
    rename(): Promise<void>;
    delete(): Promise<void>;
    reset(): Promise<void>;
    addCharacter(): Promise<void>;
    removeCharacter(): Promise<void>;
    getCharacterCount(): Promise<void>;
    leaveGroup(): Promise<void>;
    disconnect(): Promise<void>;
}
//# sourceMappingURL=groupChatConversation.d.ts.map