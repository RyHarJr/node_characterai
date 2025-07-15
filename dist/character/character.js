"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharacterVisibility = exports.Character = void 0;
const dmConversation_1 = __importDefault(require("../chat/dmConversation"));
const previewDMConversation_1 = require("../chat/previewDMConversation");
const client_1 = require("../client");
const parser_1 = __importDefault(require("../parser"));
const patcher_1 = __importDefault(require("../utils/patcher"));
const specable_1 = require("../utils/specable");
const uuid_1 = require("uuid");
const characterEnums_1 = require("./characterEnums");
Object.defineProperty(exports, "CharacterVisibility", { enumerable: true, get: function () { return characterEnums_1.CharacterVisibility; } });
const unavailableCodes_1 = require("../utils/unavailableCodes");
const persona_1 = require("../profile/persona");
;
class Character extends specable_1.Specable {
    set character_id(value) { this.external_id = value; }
    get externalId() { return this.external_id; }
    set externalId(value) { this.external_id = value; }
    get characterId() { return this.external_id; }
    set characterId(value) { this.external_id = value; }
    get tagline() { return this.title; }
    set tagline(value) { this.title = value; }
    set character_visibility(value) { this.visibility = value; }
    get dynamicGreetingEnabled() { var _a; return (_a = this.dynamic_greeting_enabled) !== null && _a !== void 0 ? _a : this.allow_dynamic_greeting; }
    set dynamicGreetingEnabled(value) {
        if (this.dynamic_greeting_enabled)
            this.dynamic_greeting_enabled = value;
        if (this.allow_dynamic_greeting)
            this.allow_dynamic_greeting = value;
    }
    get starterPrompts() { return this.starter_prompts; }
    set starterPrompts(value) { this.starter_prompts = value; }
    get commentsEnabled() { return this.comments_enabled; }
    set commentsEnabled(value) { this.comments_enabled = value; }
    get shortHash() { return this.short_hash; }
    set shortHash(value) { this.short_hash = value; }
    get displayName() { var _a, _b, _c; return (_c = (_b = (_a = this.participant__name) !== null && _a !== void 0 ? _a : this.name) !== null && _b !== void 0 ? _b : this.participant__user__username) !== null && _c !== void 0 ? _c : this.character_name; }
    set displayName(value) {
        if (this.participant__name)
            this.participant__name = value;
        if (this.name)
            this.name = value;
        if (this.participant__user__username)
            this.participant__user__username = value;
        if (this.character_name)
            this.character_name = value;
    }
    get interactionCount() { var _a; return (_a = this.participant__num_interactions) !== null && _a !== void 0 ? _a : this.num_interactions; }
    set interactionCount(value) {
        if (this.participant__num_interactions)
            this.participant__num_interactions = value;
        if (this.num_interactions)
            this.num_interactions = value;
    }
    get likeCount() { return this.num_likes; }
    get interactionCountLastDay() { return this.num_interactions_last_day; }
    get hasDefinition() { return this.has_definition; }
    set creator_id(value) { this.user__id = value; }
    get userId() { return this.user__id; }
    set userId(value) { this.user__id = value; }
    set character_translations(value) { this.translations = value; }
    async getDMs(turnPreviewCount = 2, refreshChats = false) {
        const request = await this.client.requester.request(`https://neo.character.ai/chats/?character_ids=${this.characterId}?num_preview_turns=${turnPreviewCount}`, {
            method: 'GET',
            includeAuthorization: true,
            contentType: 'application/json'
        });
        const response = await parser_1.default.parseJSON(request);
        if (!request.ok)
            throw new Error(response);
        const { chats } = response;
        const dms = [];
        for (let i = 0; i < chats.length; i++) {
            const conversation = new previewDMConversation_1.PreviewDMConversation(this.client, chats[i]);
            dms.push(conversation);
            if (!refreshChats)
                continue;
            await conversation.refreshMessages();
        }
        return dms;
    }
    async internalDM(createNewConversation, withGreeting, specificChatId) {
        var conversation;
        if (specificChatId)
            conversation = await this.client.fetchDMConversation(specificChatId);
        if (createNewConversation) {
            const request = await this.client.sendDMWebsocketCommandAsync({
                command: "create_chat",
                originId: "Android",
                streaming: true,
                payload: {
                    chat: {
                        chat_id: (0, uuid_1.v4)(),
                        creator_id: this.client.myProfile.userId.toString(),
                        visibility: "VISIBILITY_PRIVATE",
                        character_id: this.characterId,
                        type: "TYPE_ONE_ON_ONE"
                    },
                    with_greeting: withGreeting !== null && withGreeting !== void 0 ? withGreeting : true
                }
            });
            conversation = new dmConversation_1.default(this.client, request[0].chat);
        }
        if (!specificChatId)
            conversation = await this.client.fetchLatestDMConversationWith(this.characterId);
        await (conversation === null || conversation === void 0 ? void 0 : conversation.resurrect());
        await (conversation === null || conversation === void 0 ? void 0 : conversation.refreshMessages());
        return conversation;
    }
    async createDM(withGreeting) { return await this.internalDM(true, withGreeting); }
    async DM(specificChatId) { return await this.internalDM(false, false, specificChatId); }
    async createGroupChat(options) {
        this.client.throwBecauseNotAvailableYet(unavailableCodes_1.GROUP_CHATS_NOT_SUPPORTED_YET);
    }
    async getAuthorProfile() {
        const username = this.user__username;
        const myProfile = this.client.myProfile;
        return username == myProfile.username ? myProfile : await this.client.fetchProfileByUsername(username);
    }
    async getVote() {
        const request = await this.client.requester.request(`https://plus.character.ai/chat/character/${this.characterId}/voted/`, {
            method: 'GET',
            includeAuthorization: true
        });
        const response = await parser_1.default.parseJSON(request);
        if (!request.ok)
            throw new Error(String(response));
        const vote = response["vote"];
        switch (vote) {
            case true: return characterEnums_1.CharacterVote.Like;
            case false: return characterEnums_1.CharacterVote.Dislike;
        }
        return characterEnums_1.CharacterVote.None;
    }
    async setVote(vote) {
        this.client.throwBecauseNotAvailableYet(unavailableCodes_1.CSRF_COOKIE_REQUIRED);
    }
    async hide() {
        this.client.throwBecauseNotAvailableYet(unavailableCodes_1.CSRF_COOKIE_REQUIRED);
    }
    async getSimilarCharacters() {
        return this.client.getSimilarCharactersTo(this.characterId);
    }
    async report(reason, additionalDetails = "") {
        const request = await this.client.requester.request(`https://neo.character.ai/report/create`, {
            method: 'POST',
            body: parser_1.default.stringify({
                category: reason,
                comments: additionalDetails,
                reported_resource_id: this.characterId,
                type: "CHARACTER"
            }),
            includeAuthorization: true,
            contentType: 'application/json'
        });
        const response = await parser_1.default.parseJSON(request);
        if (!request.ok)
            throw new Error(response);
        return response.report.report_id;
    }
    async internalEdit(archived, options) {
        this.client.throwBecauseNotAvailableYet(unavailableCodes_1.WEIRD_INTERNAL_SERVER_ERROR);
    }
    async edit(options) { return await this.internalEdit(false, options); }
    async delete() { return await this.internalEdit(true); }
    async setPersonaOverride(personaOrId) {
        if (personaOrId instanceof persona_1.Persona)
            personaOrId = personaOrId.id;
        await this.client.setPersonaOverrideFor(this.characterId, personaOrId);
    }
    async getPersonaOverride() {
        return await this.client.getPersonaOverrideFor(this.characterId);
    }
    constructor(client, information) {
        super();
        this.external_id = "";
        this.title = "";
        this.description = "";
        this.identifier = "";
        this.visibility = characterEnums_1.CharacterVisibility.Public;
        this.copyable = false;
        this.greeting = "";
        this.songs = [];
        this.dynamic_greeting_enabled = undefined;
        this.allow_dynamic_greeting = undefined;
        this.starter_prompts = [];
        this.comments_enabled = true;
        this.short_hash = "";
        this.usage = "default";
        this.definition = "";
        this.participant__name = undefined;
        this.name = undefined;
        this.participant__user__username = undefined;
        this.character_name = undefined;
        this.user__username = "";
        this.participant__num_interactions = undefined;
        this.num_interactions = undefined;
        this.num_likes = 0;
        this.num_interactions_last_day = 0;
        this.has_definition = false;
        this.safety = 'SAFE';
        this.user__id = 0;
        this.is_licensed_professional = false;
        this.upvotes = 0;
        this.translations = null;
        this.client = client;
        patcher_1.default.patch(this.client, this, information);
    }
}
exports.Character = Character;
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", client_1.CharacterAI)
], Character.prototype, "client", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], Character.prototype, "external_id", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], Character.prototype, "character_id", null);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], Character.prototype, "externalId", null);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], Character.prototype, "characterId", null);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], Character.prototype, "tagline", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", String),
    __metadata("design:paramtypes", [String])
], Character.prototype, "character_visibility", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Boolean)
], Character.prototype, "dynamic_greeting_enabled", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Boolean)
], Character.prototype, "allow_dynamic_greeting", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], Character.prototype, "dynamicGreetingEnabled", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], Character.prototype, "starter_prompts", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], Character.prototype, "starterPrompts", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], Character.prototype, "comments_enabled", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], Character.prototype, "commentsEnabled", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], Character.prototype, "short_hash", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], Character.prototype, "shortHash", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", String)
], Character.prototype, "participant__name", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", String)
], Character.prototype, "name", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", String)
], Character.prototype, "participant__user__username", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", String)
], Character.prototype, "character_name", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], Character.prototype, "displayName", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], Character.prototype, "user__username", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", String)
], Character.prototype, "participant__num_interactions", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", String)
], Character.prototype, "num_interactions", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], Character.prototype, "interactionCount", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Number)
], Character.prototype, "num_likes", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], Character.prototype, "likeCount", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Number)
], Character.prototype, "num_interactions_last_day", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], Character.prototype, "interactionCountLastDay", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Boolean)
], Character.prototype, "has_definition", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], Character.prototype, "hasDefinition", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], Character.prototype, "user__id", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], Character.prototype, "creator_id", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], Character.prototype, "is_licensed_professional", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], Character.prototype, "character_translations", null);
//# sourceMappingURL=character.js.map