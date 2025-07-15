import { PrivateProfile } from './profile/privateProfile';
import { PublicProfile } from './profile/publicProfile';
import Requester from './requester';
import { ICAIWebsocketCommand, ICAIWebsocketMessage } from './websocket';
import DMConversation from './chat/dmConversation';
import { Character } from './character/character';
import { GroupChats } from './groupchat/groupChats';
import { RecentCharacter } from './character/recentCharacter';
import { CharacterTags, SearchCharacter } from './character/searchCharacter';
import { Persona } from './profile/persona';
export declare enum CheckAndThrow {
    RequiresAuthentication = 0,
    RequiresNoAuthentication = 1
}
export declare class CharacterAI {
    private token;
    get authenticated(): boolean;
    myProfile: PrivateProfile;
    requester: Requester;
    groupChats: GroupChats;
    private dmChatWebsocket;
    sendDMWebsocketAsync(options: ICAIWebsocketMessage): Promise<any>;
    sendDMWebsocketCommandAsync(options: ICAIWebsocketCommand): Promise<any>;
    private groupChatWebsocket;
    sendGroupChatWebsocketAsync(options: ICAIWebsocketMessage): Promise<void>;
    sendGroupChatWebsocketCommandAsync(options: ICAIWebsocketCommand): Promise<any>;
    private openWebsockets;
    private closeWebsockets;
    fetchProfileByUsername(username: string): Promise<PublicProfile>;
    searchCharacter(query: string): Promise<{
        characters: SearchCharacter[];
        safetyFiltered: any;
        tags: any;
        uuid: any;
    }>;
    searchCharacterByTags(query: string, ...tags: CharacterTags[]): Promise<{
        characters: SearchCharacter[];
        safetyFiltered: any;
        rawTags: any;
        uuid: any;
    }>;
    fetchCharacter(characterId: string): Promise<Character>;
    getCharacterTagOptions(): Promise<any>;
    private getSearchStringQuery;
    getPopularSearches(): Promise<string[]>;
    getTrendingSearches(): Promise<string[]>;
    getSearchAutocomplete(query: string): Promise<string[]>;
    getAvailableModels(): Promise<{
        availableModels: string[];
        defaultModelType: string;
    }>;
    private automateCharactersRecommendation;
    getFeaturedCharacters(): Promise<Character[]>;
    getRecommendedCharactersForYou(): Promise<Character[]>;
    getRecentCharacters(): Promise<RecentCharacter[]>;
    getCharacterCategories(): Promise<string[]>;
    getSimilarCharactersTo(characterId: string): Promise<Character[]>;
    getLikedCharacters(): Promise<Character[]>;
    fetchRawConversation(chatId: string): Promise<any>;
    fetchDMConversation(chatId: string): Promise<DMConversation>;
    fetchGroupChatConversation(): Promise<any>;
    fetchLatestDMConversationWith(characterId: string): Promise<DMConversation>;
    private automateOverrideFetching;
    fetchSettings(): Promise<{
        defaultPersonaId: any;
        personaOverridesIds: any;
        fetchDefaultPersona: () => Promise<Persona | undefined>;
        fetchPersonaOverrides: () => Promise<Record<string, Persona>>;
    }>;
    setPersonaOverrideFor(characterId: string, personaId: string): Promise<void>;
    getPersonaOverrideFor(characterId: string): Promise<Persona | undefined>;
    authenticate(sessionToken: string): Promise<void>;
    unauthenticate(): void;
    throwBecauseNotAvailableYet(additionalDetails: string): void;
    private encodeQuery;
    checkAndThrow(argument: CheckAndThrow, msg?: string): void;
    constructor();
}
//# sourceMappingURL=client.d.ts.map