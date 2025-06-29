import { CharacterAI } from "../client";
import { CAIImage } from "../utils/image";
import { Specable } from "../utils/specable";
export interface IPersonaEditOptions {
    name?: string;
    definition?: string;
    image?: CAIImage;
}
export declare class Persona extends Specable {
    private client;
    private external_id;
    get externalId(): string;
    /**
     * This variable redirects to `externalId`
     */
    get id(): string;
    private title;
    private name;
    private visibility;
    private copyable;
    private greeting;
    private description;
    private identifier;
    avatar: CAIImage;
    private songs;
    private img_gen_enabled;
    get imageGenerationEnabled(): boolean;
    set imageGenerationEnabled(value: boolean);
    private base_img_prompt;
    get baseImagePrompt(): string;
    set baseImagePrompt(value: string);
    private img_prompt_regex;
    private strip_img_prompt_from_msg;
    definition: string;
    private default_voice_id;
    get defaultVoiceId(): string;
    private starter_prompts;
    private comments_enabled;
    private categories;
    private user__id;
    private user__username;
    private userusername;
    get authorUsername(): string | undefined;
    private participantname;
    private participant__name;
    get participantName(): string | undefined;
    private participantuserusername;
    private is_persona;
    private participant__num_interactions;
    private num_interactions;
    get interactionCount(): number;
    private background;
    private internalEdit;
    edit(options: IPersonaEditOptions): Promise<void>;
    makeDefault(): Promise<void>;
    remove(): Promise<void>;
    constructor(client: CharacterAI, information: any);
}
//# sourceMappingURL=persona.d.ts.map