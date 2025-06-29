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
exports.Persona = void 0;
const client_1 = require("../client");
const parser_1 = __importDefault(require("../parser"));
const image_1 = require("../utils/image");
const patcher_1 = __importDefault(require("../utils/patcher"));
const specable_1 = require("../utils/specable");
class Persona extends specable_1.Specable {
    get externalId() { return this.external_id; }
    /**
     * This variable redirects to `externalId`
     */
    get id() { return this.external_id; }
    get imageGenerationEnabled() { return this.img_gen_enabled; }
    set imageGenerationEnabled(value) { this.img_gen_enabled = value; }
    get baseImagePrompt() { return this.base_img_prompt; }
    set baseImagePrompt(value) { this.base_img_prompt = value; }
    get defaultVoiceId() { return this.default_voice_id; }
    get authorUsername() { var _a; return (_a = this.user__username) !== null && _a !== void 0 ? _a : this.userusername; }
    get participantName() { var _a; return (_a = this.participantname) !== null && _a !== void 0 ? _a : this.participant__name; }
    get interactionCount() { var _a; return (_a = this.participant__num_interactions) !== null && _a !== void 0 ? _a : this.num_interactions; }
    async internalEdit(options, archived = undefined) {
        // this.client.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        var _a, _b, _c, _d;
        let { external_id, title, greeting, description, definition, visibility, copyable, default_voice_id, is_persona } = this;
        const image = options.image;
        const prompt = image === null || image === void 0 ? void 0 : image.prompt;
        const name = (_a = options.name) !== null && _a !== void 0 ? _a : this.participantName;
        const userId = (_b = this.user__id) !== null && _b !== void 0 ? _b : 1;
        definition = (_c = options.definition) !== null && _c !== void 0 ? _c : definition;
        const request = await this.client.requester.request(`https://plus.character.ai/chat/persona/update/`, {
            method: 'POST',
            contentType: 'application/json',
            body: parser_1.default.stringify({
                archived,
                external_id,
                title,
                greeting,
                description,
                definition,
                avatar_file_name: '',
                visibility,
                copyable,
                participantname: name,
                participantnum_interactions: 0,
                userid: userId,
                userusername: this.authorUsername,
                img_gen_enabled: prompt != undefined,
                default_voice_id,
                is_persona,
                name,
                avatar_rel_path: (_d = image === null || image === void 0 ? void 0 : image.endpointUrl) !== null && _d !== void 0 ? _d : '',
                enabled: true
            }),
            includeAuthorization: true
        });
        const response = await parser_1.default.parseJSON(request);
        if (!request.ok)
            throw new Error(String(response));
        patcher_1.default.patch(this.client, this, response.persona);
    }
    async edit(options) { return await this.internalEdit(options); }
    async makeDefault() { return await this.client.myProfile.setDefaultPersona(this.externalId); }
    async remove() { return await this.internalEdit({}, true); }
    constructor(client, information) {
        super();
        // external_id
        this.external_id = "";
        // title
        this.title = "";
        // name
        this.name = "";
        // visibility
        this.visibility = "PRIVATE";
        // copyable
        this.copyable = false;
        this.greeting = "";
        this.description = "";
        this.identifier = "";
        // songs
        this.songs = [];
        // img_gen_enabled    
        this.img_gen_enabled = false;
        // base_img_prompt
        this.base_img_prompt = "";
        this.img_prompt_regex = "";
        this.strip_img_prompt_from_msg = "";
        // definition
        this.definition = "";
        // default_voice_id
        this.default_voice_id = "";
        // starter_prompts
        this.starter_prompts = [];
        // is_persona
        this.comments_enabled = false;
        // categories
        this.categories = [];
        // user__id
        this.user__id = 0;
        // user__username / userusername
        this.user__username = undefined;
        this.userusername = undefined;
        // participantname / participant__name
        this.participantname = undefined;
        this.participant__name = undefined;
        // participantuserusername
        this.participantuserusername = undefined;
        // is_persona
        this.is_persona = true;
        this.participant__num_interactions = 0;
        this.num_interactions = 0;
        this.background = "";
        this.avatar = new image_1.CAIImage(client, false);
        this.client = client;
        patcher_1.default.patch(client, this, information);
    }
}
exports.Persona = Persona;
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", client_1.CharacterAI)
], Persona.prototype, "client", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], Persona.prototype, "external_id", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], Persona.prototype, "externalId", null);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], Persona.prototype, "id", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], Persona.prototype, "title", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], Persona.prototype, "name", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", String)
], Persona.prototype, "visibility", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], Persona.prototype, "copyable", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], Persona.prototype, "greeting", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], Persona.prototype, "description", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], Persona.prototype, "identifier", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", image_1.CAIImage)
], Persona.prototype, "avatar", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], Persona.prototype, "songs", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], Persona.prototype, "img_gen_enabled", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], Persona.prototype, "imageGenerationEnabled", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], Persona.prototype, "base_img_prompt", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], Persona.prototype, "baseImagePrompt", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], Persona.prototype, "img_prompt_regex", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], Persona.prototype, "strip_img_prompt_from_msg", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], Persona.prototype, "default_voice_id", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], Persona.prototype, "starter_prompts", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], Persona.prototype, "comments_enabled", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], Persona.prototype, "categories", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], Persona.prototype, "user__id", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], Persona.prototype, "user__username", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], Persona.prototype, "userusername", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], Persona.prototype, "authorUsername", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], Persona.prototype, "participantname", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], Persona.prototype, "participant__name", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], Persona.prototype, "participantName", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], Persona.prototype, "participantuserusername", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], Persona.prototype, "is_persona", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], Persona.prototype, "participant__num_interactions", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], Persona.prototype, "num_interactions", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], Persona.prototype, "interactionCount", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], Persona.prototype, "background", void 0);
//# sourceMappingURL=persona.js.map