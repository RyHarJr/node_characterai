import { CharacterAI } from "../client";
import DMConversation from "./dmConversation";
import { CAIMessage } from "./message";
export declare class PreviewDMConversation extends DMConversation {
    private preview_turns;
    previewTurns: CAIMessage[];
    constructor(client: CharacterAI, information: any);
}
//# sourceMappingURL=previewDMConversation.d.ts.map