import { CharacterAI } from "./client";
import { Specable } from "./utils/specable";
export declare enum VoiceGender {
    Unknown = "",
    Neutral = "neutral"
}
export declare enum VoiceVisibility {
    Public = "public",
    Private = "private"
}
export declare enum InternalVoiceStatus {
    Unknown = "",
    Active = "active",
    Draft = "draft"
}
export declare class CAIVoice extends Specable {
    private client;
    private rawInformation;
    id: string;
    name: string;
    description: string;
    gender: VoiceGender;
    visibility: VoiceVisibility;
    private creatorInfo;
    private get creatorUsername();
    get creatorSource(): any;
    audioSourceType: string;
    previewText: string;
    previewAudioURI: string;
    backendProvider: string;
    backendId: string;
    internalStatus: InternalVoiceStatus;
    lastUpdateTime: string;
    getCreator(): Promise<import(".").PublicProfile>;
    edit(name: string, description: string, makeVoicePublic: boolean, previewText: string): Promise<void>;
    delete(): Promise<Error | undefined>;
    constructor(client: CharacterAI, information: any);
}
//# sourceMappingURL=voice.d.ts.map