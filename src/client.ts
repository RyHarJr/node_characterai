import Parser from './parser';
import { PrivateProfile } from './profile/privateProfile';
import { PublicProfile } from './profile/publicProfile';
import Requester from './requester';
import { CAIWebsocket, CAIWebsocketConnectionType, ICAIWebsocketCommand, ICAIWebsocketMessage } from './websocket';
import DMConversation from './chat/dmConversation';
import { Character } from './character/character';
import { v4 as uuidv4 } from 'uuid';
import { GroupChats } from './groupchat/groupChats';
import { RecentCharacter } from './character/recentCharacter';
// import { CAICall, ICharacterCallOptions } from './character/call';
// import { CAIVoice } from './voice';
import { GroupChatConversation } from './groupchat/groupChatConversation';
import { CharacterTags, SearchCharacter } from './character/searchCharacter';
import { Specable } from './utils/specable';
import { Persona } from './profile/persona';

const fallbackEdgeRollout = '60';

export enum CheckAndThrow {
    RequiresAuthentication = 0,
    RequiresNoAuthentication,
    // RequiresToBeInCall,
    // RequiresToNotBeInCall
}

export class CharacterAI {
    private token: string = "";
    public get authenticated() { return this.token != ""; }

    public myProfile: PrivateProfile;
    public requester: Requester;
    public groupChats: GroupChats;

    private dmChatWebsocket: CAIWebsocket | null = null;
    async sendDMWebsocketAsync(options: ICAIWebsocketMessage) {
        return await this.dmChatWebsocket?.sendAsync(options);
    }
    async sendDMWebsocketCommandAsync(options: ICAIWebsocketCommand) {
        const requestId = uuidv4();
        return await this.sendDMWebsocketAsync({
            parseJSON: true,
            expectedReturnCommand: options.expectedReturnCommand,
            messageType: CAIWebsocketConnectionType.DM,
            waitForAIResponse: options.waitForAIResponse ?? true,
            expectedRequestId: requestId,
            streaming: options.streaming,
            data: Parser.stringify({
                command: options.command,
                origin_id: options.originId,
                payload: options.payload,
                request_id: requestId
            })
        });
    }

    private groupChatWebsocket: CAIWebsocket | null = null;
    async sendGroupChatWebsocketAsync(options: ICAIWebsocketMessage) { this.groupChatWebsocket?.sendAsync(options); }
    async sendGroupChatWebsocketCommandAsync(options: ICAIWebsocketCommand) {
        const requestId = uuidv4();
        return await this.sendDMWebsocketAsync({
            parseJSON: true,
            expectedReturnCommand: options.expectedReturnCommand,
            messageType: CAIWebsocketConnectionType.DM,
            waitForAIResponse: true,
            expectedRequestId: requestId,
            streaming: options.streaming,
            data: Parser.stringify({
                command: options.command,
                origin_id: options.originId,
                payload: options.payload,
                request_id: requestId
            })
        });
    }

    private async openWebsockets() {
        try {
            const request = await this.requester.request("https://character.ai/", {
                method: "GET",
                includeAuthorization: false
            });
            const { headers } = request;

            let edgeRollout = headers.get("set-cookie")?.match(/edge_rollout=([^;]+)/)?.at(1);
            if (!edgeRollout) {
                if (!request.ok) throw Error("Could not get edge rollout");
                edgeRollout = fallbackEdgeRollout;
            }

            edgeRollout = edgeRollout as string;
            this.groupChatWebsocket = await new CAIWebsocket({
                url: "wss://neo.character.ai/connection/websocket",
                authorization: this.token,
                edgeRollout,
                userId: this.myProfile.userId
            }).open(true);

            this.dmChatWebsocket = await new CAIWebsocket({
                url: "wss://neo.character.ai/ws/",
                authorization: this.token,
                edgeRollout,
                userId: this.myProfile.userId
            }).open(false);
        } catch (error) {
            throw Error("Failed opening websocket." + error);
        }
    }

    private closeWebsockets() {
        this.dmChatWebsocket?.close();
        this.groupChatWebsocket?.close();
    }

    async fetchProfileByUsername(username: string) {
        this.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        const profile = new PublicProfile(this, { username });
        await profile.refreshProfile();
        return profile;
    }

    async searchCharacter(query: string) {
        this.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        if (query.trim() == "") throw new Error("The query must not be empty");
        const encodedQuery = this.encodeQuery(query);
        const request = await this.requester.request(`https://neo.character.ai/search/v1/character?query=${encodedQuery}`, {
            method: 'GET',
            includeAuthorization: true,
            contentType: 'application/json'
        });
        const response = await Parser.parseJSON(request);
        if (!request.ok) throw new Error(response);
        let characters: SearchCharacter[] = [];
        const { characters: rawCharacters } = response;
        for (let i = 0; i < rawCharacters.length; i++)
            characters.push(new SearchCharacter(this, rawCharacters[i]));

        const { uuid, safety_filtered: safetyFiltered , tags } = response;

        return { characters, safetyFiltered, tags, uuid };
    }

    async searchCharacterByTags(query: string, ...tags: CharacterTags[]) {
        this.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        if (tags.length == 0) throw new Error("You must provide atleast one tag");
        const search = await this.searchCharacter(query);
        let { characters, safetyFiltered, tags: rawTags, uuid } = search;
        characters = characters.filter(
            character => tags.includes(character.tagId as CharacterTags));
        return { characters, safetyFiltered, rawTags, uuid };
    }

    async fetchCharacter(characterId: string) {
        this.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        const request = await this.requester.request("https://plus.character.ai/chat/character/info/", {
            method: 'POST',
            body: Parser.stringify({ external_id: characterId }),
            includeAuthorization: true,
            contentType: 'application/json'
        });
        const response = await Parser.parseJSON(request);
        if (!request.ok) throw new Error("Failed to fetch character");
        return new Character(this, response.character);
    }

    async getCharacterTagOptions() {
        this.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        const request = await this.requester.request("https://neo.character.ai/character/v1/character_tag_options", {
            method: 'GET',
            includeAuthorization: true,
            contentType: 'application/json'
        });
        const response = await Parser.parseJSON(request);
        if (!request.ok) throw new Error("Failed to fetch character");
        return response.tags;
    }

    private async getSearchStringQuery(endpoint: string, suffix = "_search_queries", useKey?: string): Promise<string[]> {
        this.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        const request = await this.requester.request(`https://neo.character.ai/search/v1/query/${endpoint}`, {
            method: 'GET',
            includeAuthorization: true
        });
        const response = await Parser.parseJSON(request);
        if (!request.ok) throw new Error(String(response));
        return response[`${useKey ?? endpoint}${suffix}`];
    }

    async getPopularSearches() { return await this.getSearchStringQuery("popular"); }
    async getTrendingSearches() { return await this.getSearchStringQuery("trending"); }
    async getSearchAutocomplete(query: string) {
        const encodedQuery = this.encodeQuery(query);
        return await this.getSearchStringQuery(`autocomplete?query_prefix=${encodedQuery}`, "_autocomplete", "search");
    }

    async getAvailableModels() {
        this.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        const request = await this.requester.request("https://neo.character.ai/get-available-models", {
            method: 'GET',
            includeAuthorization: true
        });
        const response = await Parser.parseJSON(request);
        if (!request.ok) throw new Error(String(response));
        return {
            availableModels: response.available_models as string[],
            defaultModelType: response.default_model_type as string
        }
    }

    private async automateCharactersRecommendation<T extends Character>(
        endpoint: string,
        CharacterClass: new (...args: any[]) => T,
        key: string = "characters",
        baseEndpoint: string = "https://neo.character.ai/recommendation/v1/"
    ): Promise<T[]> {
        const request = await this.requester.request(`${baseEndpoint}${endpoint}`, {
            method: 'GET',
            includeAuthorization: true,
            contentType: 'application/json'
        });
        const response = await Parser.parseJSON(request);
        if (!request.ok) throw new Error(response);
        const characters = response[key];
        let targetCharacters: T[] = [];
        for (let id = 0; id < characters.length; id++)
            targetCharacters.push(new CharacterClass(this, characters[id]));
        return targetCharacters;
    }

    async getFeaturedCharacters() { return await this.automateCharactersRecommendation("featured", Character); }
    async getRecommendedCharactersForYou() { return await this.automateCharactersRecommendation("user", Character); }
    async getRecentCharacters() { return await this.automateCharactersRecommendation("https://neo.character.ai/chats/recent/", RecentCharacter, "chats", ""); }
    async getCharacterCategories(): Promise<string[]> {
        this.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        const request = await this.requester.request("https://neo.character.ai/recommendation/v1/category", {
            method: 'GET',
            includeAuthorization: true
        });
        const response = await Parser.parseJSON(request);
        if (!request.ok) throw new Error(String(response));
        return response.categories;
    }
    async getSimilarCharactersTo(characterId: string) { return await this.automateCharactersRecommendation(`character/${characterId}`, Character); }
    async getLikedCharacters() { return await this.automateCharactersRecommendation("", Character, "characters", "https://plus.character.ai/chat/user/characters/upvoted/"); }

    async fetchRawConversation(chatId: string) {
        this.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        const request = await this.requester.request(`https://neo.character.ai/chat/${chatId}/`, {
            method: 'GET',
            includeAuthorization: true
        });
        const response = await Parser.parseJSON(request);
        if (!request.ok) throw new Error(response.comment ?? String(response));
        return response.chat;
    }

    async fetchDMConversation(chatId: string): Promise<DMConversation> {
        this.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        const conversation = new DMConversation(this, await this.fetchRawConversation(chatId));
        await conversation.refreshMessages();
        return conversation;
    }

    async fetchGroupChatConversation(): Promise<any> {
        return new GroupChatConversation(this, {});
    }

    async fetchLatestDMConversationWith(characterId: string) {
        this.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        const request = await this.requester.request(`https://neo.character.ai/chats/recent/${characterId}`, {
            method: 'GET',
            includeAuthorization: true
        });
        const response = await Parser.parseJSON(request);
        if (!request.ok) throw new Error(response);
        const chatObject = response.chats[0];
        const conversation = new DMConversation(this, chatObject);
        await conversation.refreshMessages();
        return conversation;
    }

    private async automateOverrideFetching<T extends Specable>(
        baseDictionary: Record<string, string>,
        fetchingMethod: Function
    ) {
        let record: Record<string, T> = {};
        for (const [characterId, valueId] of Object.entries(baseDictionary)) {
            const object = await fetchingMethod(valueId);
            if (!object) continue;
            (record as any)[characterId as string] = object;
        }
        return record;
    }

    async fetchSettings() {
        this.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        const request = await this.requester.request("https://plus.character.ai/chat/user/settings/", {
            method: 'GET',
            includeAuthorization: true
        });
        const response = await Parser.parseJSON(request);
        if (!request.ok) throw new Error(response);
        const { default_persona_id: defaultPersonaId, personaOverrides: personaOverridesIds } = response;
        const fetchPersonaOverrides = async () => this.automateOverrideFetching<Persona>(personaOverridesIds, this.myProfile.fetchPersona);
        return {
            defaultPersonaId,
            personaOverridesIds,
            fetchDefaultPersona: async () => await this.myProfile.fetchPersona(defaultPersonaId),
            fetchPersonaOverrides
        }
    }

    async setPersonaOverrideFor(characterId: string, personaId: string) {
        this.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        const settings = await this.fetchSettings();
        let personasOverrides = settings.personaOverridesIds;
        personasOverrides[characterId] = personaId;
        const request = await this.requester.request("https://plus.character.ai/chat/user/update_settings/", {
            method: 'POST',
            includeAuthorization: true,
            contentType: 'application/json',
            body: Parser.stringify({ personasOverrides })
        });
        const response = await Parser.parseJSON(request);
        if (!request.ok) throw new Error(String(response));
    }

    async getPersonaOverrideFor(characterId: string): Promise<Persona | undefined> {
        this.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        const settings = await this.fetchSettings();
        const personaOverrides = await settings.fetchPersonaOverrides();
        return personaOverrides[characterId];
    }

    async authenticate(sessionToken: string) {
        this.checkAndThrow(CheckAndThrow.RequiresNoAuthentication);
        if (sessionToken.startsWith("Token "))
            sessionToken = sessionToken.substring("Token ".length);
        if (sessionToken.length != 40) console.warn("WARNING: Invalid token length.");
        this.requester.updateToken(sessionToken);
        const request = await this.requester.request("https://plus.character.ai/chat/user/settings/", {
            method: "GET",
            includeAuthorization: true
        });
        if (!request.ok) throw Error("Invalid authentication token.");
        this.token = sessionToken;
        await this.myProfile.refreshProfile();
        await this.openWebsockets();
    }

    unauthenticate() {
        this.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        this.closeWebsockets();
        this.token = "";
    }

    throwBecauseNotAvailableYet(additionalDetails: string) {
        throw Error("This feature is not available yet.\nDetails: " + additionalDetails);
    }

    private encodeQuery(query: string) {
        const encodedQuery = encodeURIComponent(query);
        if (encodedQuery.trim() == "") throw new Error("The query must not be empty");
        return encodedQuery;
    }

    checkAndThrow(argument: CheckAndThrow, msg: string = "You must be authenticated to do this.") {
        if (argument == CheckAndThrow.RequiresAuthentication && !this.authenticated)
            throw Error(msg);
        if (argument == CheckAndThrow.RequiresNoAuthentication && this.authenticated)
            throw Error("Already authenticated");
    }

    constructor() {
        this.myProfile = new PrivateProfile(this);
        this.requester = new Requester();
        this.groupChats = new GroupChats(this);
    }
}
