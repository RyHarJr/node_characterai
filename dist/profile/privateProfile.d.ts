import { CharacterAI } from "../client";
import { CAIImage } from "../utils/image";
import { PublicProfile } from "./publicProfile";
import { Character, CharacterVisibility } from "../character/character";
import { CAIVoice, VoiceGender } from "../voice";
import { Persona } from "./persona";
import { ICharacterCreationExtraOptions } from "../character/characterEnums";
export interface IProfileModification {
    username?: string;
    displayName?: string;
    bio?: string;
    /**
     * Sends avatar to be updated or else uses the cached one.
     * Make sure to call `avatar.uploadChanges()` before calling this!
     */
    editAvatar?: boolean;
}
export declare class PrivateProfile extends PublicProfile {
    characters: Character[];
    avatar: CAIImage;
    private is_human;
    get isHuman(): boolean;
    set isHuman(value: boolean);
    email: string;
    private needs_to_aknowledge_policy;
    get needsToAknowledgePolicy(): boolean;
    set needsToAknowledgePolicy(value: boolean);
    private suspended_until;
    get suspendedUntil(): any;
    set suspendedUntil(value: any);
    private hidden_characters;
    get hiddenCharacters(): Character[];
    set hiddenCharacters(value: Character[]);
    private blocked_users;
    get blockedUsers(): any[];
    set blockedUsers(value: any[]);
    private interests?;
    private id;
    get userId(): number;
    set userId(value: number);
    edit(options?: IProfileModification): Promise<void>;
    createCharacter(name: string, greeting: string, visbility: CharacterVisibility, options?: ICharacterCreationExtraOptions): Promise<Character>;
    createVoice(name: string, description: string, makeVoicePublic: boolean, previewText: string, audioFile: Blob, gender?: VoiceGender): Promise<CAIVoice>;
    getVoices(): Promise<CAIVoice[]>;
    refreshProfile(): Promise<void>;
    fetchPersona(personaId: string): Promise<Persona | undefined>;
    getDefaultPersona(): Promise<Persona | undefined>;
    setDefaultPersona(personaOrId: Persona | string): Promise<void>;
    createPersona(name: string, definition: string, makeDefaultForChats: boolean, image?: CAIImage): Promise<Persona>;
    fetchPersonas(): Promise<Persona[]>;
    removePersona(personaId: string): Promise<void>;
    getLikedCharacters(): Promise<Character[]>;
    constructor(client: CharacterAI);
}
//# sourceMappingURL=privateProfile.d.ts.map