import { Conversation, ICAIMessageSending } from "./conversation";
import { CAIMessage } from "./message";
export default class DMConversation extends Conversation {
    resurrect(): Promise<void>;
    archive(): Promise<void>;
    unarchive(refreshMessagesAfter?: boolean): Promise<DMConversation | void>;
    duplicate(): Promise<DMConversation>;
    rename(newName: string): Promise<void>;
    sendMessage(content: string, options?: ICAIMessageSending): Promise<CAIMessage>;
    regenerateMessage(message: CAIMessage): Promise<CAIMessage>;
}
//# sourceMappingURL=dmConversation.d.ts.map