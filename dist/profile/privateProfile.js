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
exports.PrivateProfile = void 0;
const parser_1 = __importDefault(require("../parser"));
// import { CAIImage } from "../utils/image"; // Dihapus
const publicProfile_1 = require("./publicProfile");
const specable_1 = require("../utils/specable");
const character_1 = require("../character/character");
// import { CAIVoice, VoiceGender, VoiceVisibility } from "../voice"; // Dihapus
const persona_1 = require("./persona");
const identifier_1 = require("../utils/identifier");
class PrivateProfile extends publicProfile_1.PublicProfile {
    get isHuman() { return this.is_human; }
    set isHuman(value) { this.is_human = value; }
    get needsToAknowledgePolicy() { return this.needs_to_aknowledge_policy; }
    set needsToAknowledgePolicy(value) { this.needs_to_aknowledge_policy = value; }
    get suspendedUntil() { return this.suspended_until; }
    set suspendedUntil(value) { this.suspended_until = value; }
    get hiddenCharacters() { return this.hidden_characters; }
    set hiddenCharacters(value) { this.hidden_characters = value; }
    get blockedUsers() { return this.blocked_users; }
    set blockedUsers(value) { this.blocked_users = value; }
    get userId() { return this.id; }
    set userId(value) { this.id = value; }
    async edit(options) {
        var _a, _b, _c;
        const request = await this.client.requester.request("https://plus.character.ai/chat/user/update/", {
            method: 'POST',
            includeAuthorization: true,
            body: parser_1.default.stringify({
                username: (_a = options === null || options === void 0 ? void 0 : options.username) !== null && _a !== void 0 ? _a : this.username,
                name: (_b = options === null || options === void 0 ? void 0 : options.displayName) !== null && _b !== void 0 ? _b : this.displayName,
                bio: (_c = options === null || options === void 0 ? void 0 : options.bio) !== null && _c !== void 0 ? _c : this.bio
            }),
            contentType: 'application/json'
        });
        const response = await parser_1.default.parseJSON(request);
        if (!request.ok)
            throw new Error(response.status);
    }
    async createCharacter(name, greeting, visbility, options) {
        var _a, _b, _c, _d, _e;
        const request = await this.client.requester.request("https://plus.character.ai/chat/character/create/", {
            method: 'POST',
            includeAuthorization: true,
            body: parser_1.default.stringify({
                title: (_a = options === null || options === void 0 ? void 0 : options.tagline) !== null && _a !== void 0 ? _a : "",
                name,
                identifier: (0, identifier_1.createIdentifier)(),
                categories: [],
                visbility,
                copyable: (_b = options === null || options === void 0 ? void 0 : options.keepCharacterDefintionPrivate) !== null && _b !== void 0 ? _b : false,
                allow_dynamic_greeting: (_c = options === null || options === void 0 ? void 0 : options.allowDynamicGreeting) !== null && _c !== void 0 ? _c : false,
                description: (_d = options === null || options === void 0 ? void 0 : options.description) !== null && _d !== void 0 ? _d : "",
                greeting,
                definition: (_e = options === null || options === void 0 ? void 0 : options.definition) !== null && _e !== void 0 ? _e : "",
                avatar_rel_path: '',
                img_gen_enabled: false,
                base_img_prompt: '',
                strip_img_prompt_from_msg: false,
                default_voice_id: ''
            }),
            contentType: 'application/json'
        });
        const response = await parser_1.default.parseJSON(request);
        if (!request.ok)
            throw new Error(response.status);
        return new character_1.Character(this.client, response.character);
    }
    async refreshProfile() {
        const request = await this.client.requester.request("https://plus.character.ai/chat/user/", {
            method: 'GET',
            includeAuthorization: true
        });
        const response = await parser_1.default.parseJSON(request);
        if (!request.ok)
            throw new Error(response);
        const { user } = response.user;
        this.loadFromInformation(user);
        this.loadFromInformation(user.user);
    }
    async fetchPersona(personaId) {
        const personas = await this.fetchPersonas();
        return personas.find((persona) => persona.externalId == personaId);
    }
    async getDefaultPersona() {
        const settings = await this.client.fetchSettings();
        return await settings.fetchDefaultPersona();
    }
    async setDefaultPersona(personaOrId) {
        let defaultPersonaId = personaOrId;
        if (personaOrId instanceof persona_1.Persona)
            defaultPersonaId = personaOrId.externalId;
        const request = await this.client.requester.request("https://neo.character.ai/recommendation/v1/category", {
            method: 'POST',
            contentType: 'application/json',
            includeAuthorization: true,
            body: parser_1.default.stringify({ default_persona_id: defaultPersonaId })
        });
        const response = await parser_1.default.parseJSON(request);
        if (!request.ok)
            throw new Error(String(response));
        if (!response.success)
            throw new Error("Could not set default persona");
    }
    async createPersona(name, definition, makeDefaultForChats) {
        const request = await this.client.requester.request(`https://plus.character.ai/chat/persona/create/`, {
            method: 'POST',
            contentType: 'application/json',
            body: parser_1.default.stringify({
                title: name,
                name,
                identifier: (0, identifier_1.createIdentifier)(),
                categories: [],
                visbility: "PRIVATE",
                copyable: false,
                description: "This is my persona.",
                definition,
                greeting: "Hello! This is my persona",
                avatar_rel_path: '',
                img_gen_enabled: false,
                base_img_prompt: '',
                avatar_file_name: '',
                voice_id: '',
                strip_img_prompt_from_msg: false
            }),
            includeAuthorization: true
        });
        const response = await parser_1.default.parseJSON(request);
        if (!request.ok)
            throw new Error(String(response));
        const persona = new persona_1.Persona(this.client, response.persona);
        if (makeDefaultForChats)
            await this.setDefaultPersona(persona.externalId);
        return persona;
    }
    async fetchPersonas() {
        const request = await this.client.requester.request("https://plus.character.ai/chat/personas/?force_refresh=0", {
            method: 'GET',
            includeAuthorization: true
        });
        const response = await parser_1.default.parseJSON(request);
        if (!request.ok)
            throw new Error(response);
        return response.personas.map((p) => new persona_1.Persona(this.client, p));
    }
    async removePersona(personaId) {
        const persona = await this.fetchPersona(personaId);
        await (persona === null || persona === void 0 ? void 0 : persona.remove());
    }
    async getLikedCharacters() {
        return this.client.getLikedCharacters();
    }
    constructor(client) {
        super(client);
        this.characters = [];
        this.is_human = true;
        this.email = "";
        this.needs_to_aknowledge_policy = true;
        this.hidden_characters = [];
        this.blocked_users = [];
        this.interests = null;
        this.id = 0;
        // Avatar & Voice sudah dihapus
    }
}
exports.PrivateProfile = PrivateProfile;
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], PrivateProfile.prototype, "is_human", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], PrivateProfile.prototype, "isHuman", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], PrivateProfile.prototype, "needs_to_aknowledge_policy", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], PrivateProfile.prototype, "needsToAknowledgePolicy", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], PrivateProfile.prototype, "suspended_until", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], PrivateProfile.prototype, "suspendedUntil", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Array)
], PrivateProfile.prototype, "hidden_characters", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], PrivateProfile.prototype, "hiddenCharacters", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Array)
], PrivateProfile.prototype, "blocked_users", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], PrivateProfile.prototype, "blockedUsers", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], PrivateProfile.prototype, "interests", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], PrivateProfile.prototype, "id", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], PrivateProfile.prototype, "userId", null);
//# sourceMappingURL=privateProfile.js.map