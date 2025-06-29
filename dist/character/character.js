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
const image_1 = require("../utils/image");
const patcher_1 = __importDefault(require("../utils/patcher"));
const specable_1 = require("../utils/specable");
const uuid_1 = require("uuid");
const voice_1 = require("../voice");
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
    get imageGenerationEnabled() { return this.img_gen_enabled; }
    set imageGenerationEnabled(value) { this.img_gen_enabled = value; }
    get dynamicGreetingEnabled() { var _a; return (_a = this.dynamic_greeting_enabled) !== null && _a !== void 0 ? _a : this.allow_dynamic_greeting; }
    set dynamicGreetingEnabled(value) {
        if (this.dynamic_greeting_enabled)
            this.dynamic_greeting_enabled = value;
        if (this.allow_dynamic_greeting)
            this.allow_dynamic_greeting = value;
    }
    get baseImagePrompt() { return this.base_img_prompt; }
    set baseImagePrompt(value) { this.base_img_prompt = value; }
    get imagePromptRegex() { return this.img_prompt_regex; }
    set imagePromptRegex(value) { this.img_prompt_regex = value; }
    get stripImagePromptFromMessage() { return this.strip_img_prompt_from_msg; }
    set stripImagePromptFromMessage(value) { this.strip_img_prompt_from_msg = value; }
    get starterPrompts() { return this.starter_prompts; }
    set starterPrompts(value) { this.starter_prompts = value; }
    get commentsEnabled() { return this.comments_enabled; }
    set commentsEnabled(value) { this.comments_enabled = value; }
    get shortHash() { return this.short_hash; }
    set shortHash(value) { this.short_hash = value; }
    get defaultVoiceId() { return this.default_voice_id; }
    set defaultVoiceId(value) { this.default_voice_id = value; }
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
    async getDefaultVoice() {
        return await this.client.fetchVoice(this.default_voice_id);
    }
    /// features
    async getDMs(turnPreviewCount = 2, refreshChats = false) {
        // refresh chats refreshes for get dms, might make longer
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
    // create new converstaion to false will fetch the latest conversation
    async internalDM(createNewConversation, withGreeting, specificChatId) {
        // this.client.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        var conversation;
        if (specificChatId)
            conversation = await this.client.fetchDMConversation(specificChatId);
        // create conversation
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
        // if no chat id after allat, lets fetch the most recent one
        if (!specificChatId)
            conversation = await this.client.fetchLatestDMConversationWith(this.characterId);
        await (conversation === null || conversation === void 0 ? void 0 : conversation.resurrect());
        await (conversation === null || conversation === void 0 ? void 0 : conversation.refreshMessages());
        return conversation;
    }
    async createDM(withGreeting) { return await this.internalDM(true, withGreeting); }
    async DM(specificChatId) { return await this.internalDM(false, false, specificChatId); }
    async createGroupChat(options) {
        // this.client.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        this.client.throwBecauseNotAvailableYet(unavailableCodes_1.GROUP_CHATS_NOT_SUPPORTED_YET);
    }
    async getAuthorProfile() {
        // if the author is us, give private profile directly else fetch
        const username = this.user__username;
        const myProfile = this.client.myProfile;
        return username == myProfile.username ? myProfile : await this.client.fetchProfileByUsername(username);
    }
    async getVote() {
        // this.client.checkAndThrow(CheckAndThrow.RequiresAuthentication);
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
        // this.client.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        this.client.throwBecauseNotAvailableYet(unavailableCodes_1.CSRF_COOKIE_REQUIRED);
        // vote is true/false/null
        let voteValue = null;
        switch (vote) {
            case characterEnums_1.CharacterVote.Like:
                voteValue = true;
                break;
            case characterEnums_1.CharacterVote.Dislike:
                voteValue = false;
                break;
        }
        const request = await this.client.requester.request(`https://plus.character.ai/chat/character/${this.characterId}/vote`, {
            method: 'POST',
            includeAuthorization: true,
            body: parser_1.default.stringify({ external_id: this.characterId, vote: voteValue }),
            contentType: 'application/json'
        });
        const response = await parser_1.default.parseJSON(request);
        if (!request.ok)
            throw new Error(String(response));
    }
    async hide() {
        // this.client.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        this.client.throwBecauseNotAvailableYet(unavailableCodes_1.CSRF_COOKIE_REQUIRED);
    }
    // voice instance or voiceId
    // https://plus.character.ai/chat/character/${characterId}/voice_override/update/
    async setVoiceOverride(voiceOrId) {
        let voiceId = voiceOrId;
        if (voiceOrId instanceof voice_1.CAIVoice)
            voiceId = voiceOrId.id;
        const request = await this.client.requester.request(`https://plus.character.ai/chat/character/${this.characterId}/voice_override/update/`, {
            method: 'POST',
            includeAuthorization: true,
            contentType: 'application/json',
            body: parser_1.default.stringify({ voice_id: voiceId })
        });
        const response = await parser_1.default.parseJSON(request);
        if (!request.ok)
            throw new Error(String(response));
        if (!response.success)
            throw new Error("Could set voice override");
    }
    async getVoiceOverride() {
        const settings = await this.client.fetchSettings();
        const { voiceOverridesIds } = settings;
        return voiceOverridesIds[this.characterId];
    }
    // https://neo.character.ai/recommendation/v1/character/id
    async getSimilarCharacters() { return this.client.getSimilarCharactersTo(this.characterId); }
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
    // /chat/character/update/
    async internalEdit(archived, options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        // this.client.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        this.client.throwBecauseNotAvailableYet(unavailableCodes_1.WEIRD_INTERNAL_SERVER_ERROR);
        const image = this.avatar;
        const prompt = image === null || image === void 0 ? void 0 : image.prompt;
        let voiceId = (_a = options === null || options === void 0 ? void 0 : options.voiceOrId) !== null && _a !== void 0 ? _a : "";
        if ((options === null || options === void 0 ? void 0 : options.voiceOrId) instanceof voice_1.CAIVoice)
            voiceId = options.voiceOrId.id;
        const request = await this.client.requester.request("https://plus.character.ai/chat/character/update/", {
            method: 'POST',
            includeAuthorization: true,
            body: parser_1.default.stringify({
                external_id: this.externalId,
                title: (_b = options === null || options === void 0 ? void 0 : options.newTagline) !== null && _b !== void 0 ? _b : this.tagline,
                name: (_c = options === null || options === void 0 ? void 0 : options.newName) !== null && _c !== void 0 ? _c : this.name,
                categories: [],
                visbility: (_d = options === null || options === void 0 ? void 0 : options.newVisbility) !== null && _d !== void 0 ? _d : this.visibility,
                copyable: (_e = options === null || options === void 0 ? void 0 : options.keepCharacterDefintionPrivate) !== null && _e !== void 0 ? _e : this.copyable,
                description: (_f = options === null || options === void 0 ? void 0 : options.newDescription) !== null && _f !== void 0 ? _f : this.description,
                greeting: (_g = options === null || options === void 0 ? void 0 : options.newGreeting) !== null && _g !== void 0 ? _g : this.greeting,
                definition: (_h = options === null || options === void 0 ? void 0 : options.newDefinition) !== null && _h !== void 0 ? _h : this.definition,
                avatar_rel_path: (_j = image === null || image === void 0 ? void 0 : image.endpointUrl) !== null && _j !== void 0 ? _j : this.avatar.endpointUrl,
                img_gen_enabled: prompt != undefined,
                dynamic_greeting_enabled: (_k = options === null || options === void 0 ? void 0 : options.enableDynamicGreeting) !== null && _k !== void 0 ? _k : this.dynamicGreetingEnabled,
                base_img_prompt: prompt !== null && prompt !== void 0 ? prompt : '',
                strip_img_prompt_from_msg: false,
                voice_id: "",
                default_voice_id: voiceId !== null && voiceId !== void 0 ? voiceId : this.defaultVoiceId,
                archived
            }),
            contentType: 'application/json'
        });
        const response = await parser_1.default.parseJSON(request);
        if (!request.ok || response.status != "OK")
            throw new Error(response.status);
        patcher_1.default.patch(this.client, this, response.character);
    }
    async edit(options) { return await this.internalEdit(false, options); }
    async delete() { return await this.internalEdit(true); }
    // persona
    async setPersonaOverride(personaOrId) {
        if (personaOrId instanceof persona_1.Persona)
            personaOrId = personaOrId.id;
        await this.client.setPersonaOverrideFor(this.characterId, personaOrId);
    }
    async getPersonaOverride() { return await this.client.getPersonaOverrideFor(this.characterId); }
    constructor(client, information) {
        super();
        // external_id / character_id
        this.external_id = "";
        // title aka tagline
        this.title = "";
        // description
        this.description = "";
        // identifier
        this.identifier = "";
        // character_visibility / visibility
        this.visibility = characterEnums_1.CharacterVisibility.Public;
        // copyable
        this.copyable = false;
        // greeting
        this.greeting = "";
        // songs (no type found)
        this.songs = [];
        // img_gen_enabled
        this.img_gen_enabled = false;
        // dynamic_greeting_enabled
        this.dynamic_greeting_enabled = undefined;
        this.allow_dynamic_greeting = undefined;
        // base_image_prompt
        this.base_img_prompt = "";
        // img_prompt_regex
        this.img_prompt_regex = "";
        // strip_img_prompt_from_msg
        this.strip_img_prompt_from_msg = false;
        // starter_prompts
        this.starter_prompts = [];
        // comments_enabled
        this.comments_enabled = true;
        // short_hash
        this.short_hash = "";
        // short_hash
        this.usage = "default";
        // definition
        this.definition = "";
        // default_voice_id 
        this.default_voice_id = "";
        // participant__name / aka display name
        // name
        this.participant__name = undefined;
        this.name = undefined;
        this.participant__user__username = undefined;
        this.character_name = undefined;
        // user__username / aka author
        this.user__username = "";
        // participant__num_interactions
        // num_interactions
        this.participant__num_interactions = undefined;
        this.num_interactions = undefined;
        // num_likes
        this.num_likes = 0;
        // num_interactions_last_day
        this.num_interactions_last_day = 0;
        // has_definition
        this.has_definition = false;
        // safety
        this.safety = 'SAFE';
        // user_id / creator_id
        this.user__id = 0;
        // is_licensed_professional
        this.is_licensed_professional = false;
        // upvotes
        this.upvotes = 0;
        // translations / character_translations
        this.translations = null;
        this.client = client;
        // can edit profile picture
        this.avatar = new image_1.CAIImage(client, () => this.creator_id != this.client.myProfile.userId &&
            this.user__username != this.client.myProfile.username);
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
    __metadata("design:type", image_1.CAIImage)
], Character.prototype, "avatar", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], Character.prototype, "img_gen_enabled", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], Character.prototype, "imageGenerationEnabled", null);
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
], Character.prototype, "base_img_prompt", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], Character.prototype, "baseImagePrompt", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], Character.prototype, "img_prompt_regex", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], Character.prototype, "imagePromptRegex", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], Character.prototype, "strip_img_prompt_from_msg", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], Character.prototype, "stripImagePromptFromMessage", null);
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
    __metadata("design:type", Object)
], Character.prototype, "default_voice_id", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], Character.prototype, "defaultVoiceId", null);
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