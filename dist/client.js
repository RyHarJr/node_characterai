"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharacterAI = exports.CheckAndThrow = void 0;
const parser_1 = __importDefault(require("./parser"));
const privateProfile_1 = require("./profile/privateProfile");
const publicProfile_1 = require("./profile/publicProfile");
const requester_1 = __importDefault(require("./requester"));
const websocket_1 = require("./websocket");
const dmConversation_1 = __importDefault(require("./chat/dmConversation"));
const character_1 = require("./character/character");
const uuid_1 = require("uuid");
const groupChats_1 = require("./groupchat/groupChats");
const recentCharacter_1 = require("./character/recentCharacter");
// import { CAICall, ICharacterCallOptions } from './character/call';
const voice_1 = require("./voice");
const groupChatConversation_1 = require("./groupchat/groupChatConversation");
const searchCharacter_1 = require("./character/searchCharacter");
const fallbackEdgeRollout = '60';
var CheckAndThrow;
(function (CheckAndThrow) {
    CheckAndThrow[CheckAndThrow["RequiresAuthentication"] = 0] = "RequiresAuthentication";
    CheckAndThrow[CheckAndThrow["RequiresNoAuthentication"] = 1] = "RequiresNoAuthentication";
    // RequiresToBeInCall,
    // RequiresToNotBeInCall
})(CheckAndThrow || (exports.CheckAndThrow = CheckAndThrow = {}));
class CharacterAI {
    get authenticated() { return this.token != ""; }
    async sendDMWebsocketAsync(options) {
        var _a;
        return await ((_a = this.dmChatWebsocket) === null || _a === void 0 ? void 0 : _a.sendAsync(options));
    }
    async sendDMWebsocketCommandAsync(options) {
        var _a;
        const requestId = (0, uuid_1.v4)();
        return await this.sendDMWebsocketAsync({
            parseJSON: true,
            expectedReturnCommand: options.expectedReturnCommand,
            messageType: websocket_1.CAIWebsocketConnectionType.DM,
            waitForAIResponse: (_a = options.waitForAIResponse) !== null && _a !== void 0 ? _a : true,
            expectedRequestId: requestId,
            streaming: options.streaming,
            data: parser_1.default.stringify({
                command: options.command,
                origin_id: options.originId,
                payload: options.payload,
                request_id: requestId
            })
        });
    }
    async sendGroupChatWebsocketAsync(options) { var _a; (_a = this.groupChatWebsocket) === null || _a === void 0 ? void 0 : _a.sendAsync(options); }
    async sendGroupChatWebsocketCommandAsync(options) {
        const requestId = (0, uuid_1.v4)();
        return await this.sendDMWebsocketAsync({
            parseJSON: true,
            expectedReturnCommand: options.expectedReturnCommand,
            messageType: websocket_1.CAIWebsocketConnectionType.DM,
            waitForAIResponse: true,
            expectedRequestId: requestId,
            streaming: options.streaming,
            data: parser_1.default.stringify({
                command: options.command,
                origin_id: options.originId,
                payload: options.payload,
                request_id: requestId
            })
        });
    }
    async openWebsockets() {
        var _a, _b;
        try {
            const request = await this.requester.request("https://character.ai/", {
                method: "GET",
                includeAuthorization: false
            });
            const { headers } = request;
            let edgeRollout = (_b = (_a = headers.get("set-cookie")) === null || _a === void 0 ? void 0 : _a.match(/edge_rollout=([^;]+)/)) === null || _b === void 0 ? void 0 : _b.at(1);
            if (!edgeRollout) {
                if (!request.ok)
                    throw Error("Could not get edge rollout");
                edgeRollout = fallbackEdgeRollout;
            }
            edgeRollout = edgeRollout;
            this.groupChatWebsocket = await new websocket_1.CAIWebsocket({
                url: "wss://neo.character.ai/connection/websocket",
                authorization: this.token,
                edgeRollout,
                userId: this.myProfile.userId
            }).open(true);
            this.dmChatWebsocket = await new websocket_1.CAIWebsocket({
                url: "wss://neo.character.ai/ws/",
                authorization: this.token,
                edgeRollout,
                userId: this.myProfile.userId
            }).open(false);
        }
        catch (error) {
            throw Error("Failed opening websocket." + error);
        }
    }
    closeWebsockets() {
        var _a, _b;
        (_a = this.dmChatWebsocket) === null || _a === void 0 ? void 0 : _a.close();
        (_b = this.groupChatWebsocket) === null || _b === void 0 ? void 0 : _b.close();
    }
    // public currentCall?: CAICall = undefined;
    // async connectToCall(call: CAICall, options: ICharacterCallOptions): Promise<CAICall> {
    //     this.checkAndThrow(CheckAndThrow.RequiresToNotBeInCall);
    //     this.currentCall = call;
    //     await call.connectToSession(options, this.token, this.myProfile.username);
    //     return call;
    // }
    // async disconnectFromCall() {
    //     this.checkAndThrow(CheckAndThrow.RequiresToBeInCall);
    //     return await this.currentCall?.hangUp();
    // }
    // profile fetching
    async fetchProfileByUsername(username) {
        this.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        const profile = new publicProfile_1.PublicProfile(this, { username });
        await profile.refreshProfile();
        return profile;
    }
    // character fetching
    async searchCharacter(query) {
        this.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        if (query.trim() == "")
            throw new Error("The query must not be empty");
        const encodedQuery = this.encodeQuery(query);
        const request = await this.requester.request(`https://neo.character.ai/search/v1/character?query=${encodedQuery}`, {
            method: 'GET',
            includeAuthorization: true,
            contentType: 'application/json'
        });
        const response = await parser_1.default.parseJSON(request);
        if (!request.ok)
            throw new Error(response);
        let characters = [];
        const { characters: rawCharacters } = response;
        for (let i = 0; i < rawCharacters.length; i++)
            characters.push(new searchCharacter_1.SearchCharacter(this, rawCharacters[i]));
        const { uuid, safety_filtered: safetyFiltered, tags } = response;
        return {
            characters,
            safetyFiltered,
            tags,
            uuid
        };
    }
    async searchCharacterByTags(query, ...tags) {
        this.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        if (tags.length == 0)
            throw new Error("You must provide atleast one tag");
        const search = await this.searchCharacter(query);
        let { characters, safetyFiltered, tags: rawTags, uuid } = search;
        // filter characters by tag
        characters = characters.filter(character => tags.includes(character.tagId));
        return {
            characters,
            safetyFiltered,
            rawTags,
            uuid
        };
    }
    async fetchCharacter(characterId) {
        this.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        const request = await this.requester.request("https://plus.character.ai/chat/character/info/", {
            method: 'POST',
            body: parser_1.default.stringify({ external_id: characterId }),
            includeAuthorization: true,
            contentType: 'application/json'
        });
        const response = await parser_1.default.parseJSON(request);
        if (!request.ok)
            throw new Error("Failed to fetch character");
        return new character_1.Character(this, response.character);
    }
    async getCharacterTagOptions() {
        this.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        const request = await this.requester.request("https://neo.character.ai/character/v1/character_tag_options", {
            method: 'GET',
            includeAuthorization: true,
            contentType: 'application/json'
        });
        const response = await parser_1.default.parseJSON(request);
        if (!request.ok)
            throw new Error("Failed to fetch character");
        return response.tags;
    }
    // search queries
    async getSearchStringQuery(endpoint, suffix = "_search_queries", useKey) {
        this.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        const request = await this.requester.request(`https://neo.character.ai/search/v1/query/${endpoint}`, {
            method: 'GET',
            includeAuthorization: true
        });
        const response = await parser_1.default.parseJSON(request);
        if (!request.ok)
            throw new Error(String(response));
        return response[`${useKey !== null && useKey !== void 0 ? useKey : endpoint}${suffix}`];
    }
    async getPopularSearches() { return await this.getSearchStringQuery("popular"); }
    async getTrendingSearches() { return await this.getSearchStringQuery("trending"); }
    async getSearchAutocomplete(query) {
        const encodedQuery = this.encodeQuery(query);
        return await this.getSearchStringQuery(`autocomplete?query_prefix=${encodedQuery}`, "_autocomplete", "search");
    }
    // voice
    async internalFetchCharacterVoices(endpoint, query) {
        this.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        const encodedQuery = this.encodeQuery(query !== null && query !== void 0 ? query : "");
        const request = await this.requester.request(`https://neo.character.ai/multimodal/api/v1/voices/${endpoint}${encodedQuery}`, {
            method: 'GET',
            includeAuthorization: true
        });
        const response = await parser_1.default.parseJSON(request);
        if (!request.ok)
            throw new Error(String(response));
        const { voices: responseVoices } = response;
        let voices = [];
        for (let i = 0; i < responseVoices.length; i++)
            voices.push(new voice_1.CAIVoice(this, responseVoices[i]));
        return voices;
    }
    // v1/voices/search?characterName=
    async searchCharacterVoices(query) { return await this.internalFetchCharacterVoices("search?characterName=", query); }
    // v1/voices/system
    async fetchSystemVoices() { return await this.internalFetchCharacterVoices("system"); }
    // v1/voices/user
    async fetchMyVoices() { return await this.internalFetchCharacterVoices("user"); }
    // v1/voices/search?creatorInfo.username=
    async fetchVoicesFromUser(username) { return await this.internalFetchCharacterVoices("search?creatorInfo.username=", username); }
    // v1/voices/featured
    async getFeaturedVoices() { return await this.internalFetchCharacterVoices("featured"); }
    // v1/voices/voiceId
    async fetchVoice(voiceId) {
        this.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        const request = await this.requester.request(`https://neo.character.ai/multimodal/api/v1/voices/${voiceId}`, {
            method: 'GET',
            includeAuthorization: true
        });
        const response = await parser_1.default.parseJSON(request);
        if (!request.ok)
            throw new Error(String(response));
        return new voice_1.CAIVoice(this, response.voice);
    }
    // models
    // https://neo.character.ai/get-available-models
    async getAvailableModels() {
        this.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        const request = await this.requester.request("https://neo.character.ai/get-available-models", {
            method: 'GET',
            includeAuthorization: true
        });
        const response = await parser_1.default.parseJSON(request);
        if (!request.ok)
            throw new Error(String(response));
        return {
            availableModels: response.available_models,
            defaultModelType: response.default_model_type
        };
    }
    // https://neo.character.ai/recommendation/v1/
    async automateCharactersRecommendation(endpoint, CharacterClass, key = "characters", baseEndpoint = "https://neo.character.ai/recommendation/v1/") {
        const request = await this.requester.request(`${baseEndpoint}${endpoint}`, {
            method: 'GET',
            includeAuthorization: true,
            contentType: 'application/json'
        });
        const response = await parser_1.default.parseJSON(request);
        if (!request.ok)
            throw new Error(response);
        const characters = response[key];
        let targetCharacters = [];
        for (let id = 0; id < characters.length; id++)
            targetCharacters.push(new CharacterClass(this, characters[id]));
        return targetCharacters;
    }
    // suggestions/discover
    // /featured
    async getFeaturedCharacters() { return await this.automateCharactersRecommendation("featured", character_1.Character); }
    // /user
    async getRecommendedCharactersForYou() { return await this.automateCharactersRecommendation("user", character_1.Character); }
    // https://neo.character.ai/chats/recent/
    async getRecentCharacters() { return await this.automateCharactersRecommendation("https://neo.character.ai/chats/recent/", recentCharacter_1.RecentCharacter, "chats", ""); }
    // /category
    async getCharacterCategories() {
        this.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        const request = await this.requester.request("https://neo.character.ai/recommendation/v1/category", {
            method: 'GET',
            includeAuthorization: true
        });
        const response = await parser_1.default.parseJSON(request);
        if (!request.ok)
            throw new Error(String(response));
        return response.categories;
    }
    async getSimilarCharactersTo(characterId) { return await this.automateCharactersRecommendation(`character/${characterId}`, character_1.Character); }
    // https://plus.character.ai/chat/user/characters/upvoted/
    async getLikedCharacters() { return await this.automateCharactersRecommendation("", character_1.Character, "characters", "https://plus.character.ai/chat/user/characters/upvoted/"); }
    // conversations
    // raw is the raw output else the convo instance
    async fetchRawConversation(chatId) {
        var _a;
        this.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        const request = await this.requester.request(`https://neo.character.ai/chat/${chatId}/`, {
            method: 'GET',
            includeAuthorization: true
        });
        const response = await parser_1.default.parseJSON(request);
        if (!request.ok)
            throw new Error((_a = response.comment) !== null && _a !== void 0 ? _a : String(response));
        return response.chat;
    }
    async fetchDMConversation(chatId) {
        this.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        const conversation = new dmConversation_1.default(this, await this.fetchRawConversation(chatId));
        await conversation.refreshMessages();
        return conversation;
    }
    async fetchGroupChatConversation() {
        // todo, placeholder rn
        return new groupChatConversation_1.GroupChatConversation(this, {});
    }
    async fetchLatestDMConversationWith(characterId) {
        this.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        const request = await this.requester.request(`https://neo.character.ai/chats/recent/${characterId}`, {
            method: 'GET',
            includeAuthorization: true
        });
        const response = await parser_1.default.parseJSON(request);
        if (!request.ok)
            throw new Error(response);
        const chatObject = response.chats[0];
        const conversation = new dmConversation_1.default(this, chatObject);
        await conversation.refreshMessages();
        return conversation;
    }
    async automateOverrideFetching(baseDictionary, fetchingMethod) {
        let record = {};
        for (const [characterId, valueId] of Object.entries(baseDictionary)) {
            const object = await fetchingMethod(valueId);
            if (!object)
                continue;
            record[characterId] = object;
        }
        return record;
    }
    async fetchSettings() {
        this.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        const request = await this.requester.request("https://plus.character.ai/chat/user/settings/", {
            method: 'GET',
            includeAuthorization: true
        });
        const response = await parser_1.default.parseJSON(request);
        if (!request.ok)
            throw new Error(response);
        const { voiceOverrides: voiceOverridesIds, default_persona_id: defaultPersonaId, personaOverrides: personaOverridesIds } = response;
        const fetchVoiceOverrides = async () => this.automateOverrideFetching(voiceOverridesIds, this.fetchVoice);
        const fetchPersonaOverrides = async () => this.automateOverrideFetching(personaOverridesIds, this.myProfile.fetchPersona);
        return {
            defaultPersonaId,
            personaOverridesIds,
            voiceOverridesIds,
            fetchDefaultPersona: async () => await this.myProfile.fetchPersona(defaultPersonaId),
            fetchVoiceOverrides,
            fetchPersonaOverrides
        };
    }
    // persona (linked to settings)
    async setPersonaOverrideFor(characterId, personaId) {
        this.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        const settings = await this.fetchSettings();
        let personasOverrides = settings.personaOverridesIds;
        personasOverrides[characterId] = personaId;
        const request = await this.requester.request("https://plus.character.ai/chat/user/update_settings/", {
            method: 'POST',
            includeAuthorization: true,
            contentType: 'application/json',
            body: parser_1.default.stringify({ personasOverrides })
        });
        const response = await parser_1.default.parseJSON(request);
        if (!request.ok)
            throw new Error(String(response));
    }
    async getPersonaOverrideFor(characterId) {
        this.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        const settings = await this.fetchSettings();
        const personaOverrides = await settings.fetchPersonaOverrides();
        return personaOverrides[characterId];
    }
    // authentication
    async authenticate(sessionToken) {
        // this.checkAndThrow(CheckAndThrow.RequiresNoAuthentication);
        if (sessionToken.startsWith("Token "))
            sessionToken = sessionToken.substring("Token ".length, sessionToken.length);
        if (sessionToken.length != 40)
            console.warn(`===============================================================================
WARNING: CharacterAI has changed its authentication methods again.
            For easier development purposes, usage of session tokens will be used.
            See: https://github.com/realcoloride/node_characterai/issues/146
===============================================================================`);
        this.requester.updateToken(sessionToken);
        const request = await this.requester.request("https://plus.character.ai/chat/user/settings/", {
            method: "GET",
            includeAuthorization: true
        });
        if (!request.ok)
            throw Error("Invaild authentication token.");
        this.token = sessionToken;
        // reload info
        await this.myProfile.refreshProfile();
        // connect to endpoints
        await this.openWebsockets();
    }
    unauthenticate() {
        this.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        // this.disconnectFromCall();
        this.closeWebsockets();
        this.token = "";
    }
    throwBecauseNotAvailableYet(additionalDetails) {
        throw Error("This feature is not available yet due to some restrictions from CharacterAI. Sorry!\nDetails: " + additionalDetails);
    }
    encodeQuery(query) {
        const encodedQuery = encodeURIComponent(query);
        if (encodedQuery.trim() == "")
            throw new Error("The query must not be empty");
        return encodedQuery;
    }
    // allows for quick auth errors
    checkAndThrow(argument, requiresAuthenticatedMessage = "You must be authenticated to do this.") {
        if (argument == CheckAndThrow.RequiresAuthentication && !this.authenticated)
            throw Error(requiresAuthenticatedMessage);
        if (argument == CheckAndThrow.RequiresNoAuthentication && this.authenticated)
            throw Error("Already authenticated");
        // if (argument == CheckAndThrow.RequiresToNotBeInCall && this.currentCall)
        //     throw Error("You are already in a call. CharacterAI currently limits to 1 call per account.");
        // if (argument == CheckAndThrow.RequiresToBeInCall && !this.currentCall)
        //     throw Error("You need to be in a call.");
    }
    constructor() {
        this.token = "";
        this.dmChatWebsocket = null;
        this.groupChatWebsocket = null;
        this.myProfile = new privateProfile_1.PrivateProfile(this);
        this.requester = new requester_1.default();
        this.groupChats = new groupChats_1.GroupChats(this);
    }
}
exports.CharacterAI = CharacterAI;
//# sourceMappingURL=client.js.map