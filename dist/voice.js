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
exports.CAIVoice = exports.InternalVoiceStatus = exports.VoiceVisibility = exports.VoiceGender = void 0;
const client_1 = require("./client");
const parser_1 = __importDefault(require("./parser"));
const patcher_1 = __importDefault(require("./utils/patcher"));
const specable_1 = require("./utils/specable");
var VoiceGender;
(function (VoiceGender) {
    VoiceGender["Unknown"] = "";
    VoiceGender["Neutral"] = "neutral";
})(VoiceGender || (exports.VoiceGender = VoiceGender = {}));
var VoiceVisibility;
(function (VoiceVisibility) {
    VoiceVisibility["Public"] = "public";
    VoiceVisibility["Private"] = "private";
})(VoiceVisibility || (exports.VoiceVisibility = VoiceVisibility = {}));
var InternalVoiceStatus;
(function (InternalVoiceStatus) {
    InternalVoiceStatus["Unknown"] = "";
    InternalVoiceStatus["Active"] = "active";
    InternalVoiceStatus["Draft"] = "draft";
})(InternalVoiceStatus || (exports.InternalVoiceStatus = InternalVoiceStatus = {}));
class CAIVoice extends specable_1.Specable {
    //  "id": "147740177",
    //  "source": "user",
    //  "username": ""
    get creatorUsername() { return this.creatorInfo.user; }
    get creatorSource() { return this.creatorInfo.source; }
    // methods
    async getCreator() {
        return await this.client.fetchProfileByUsername(this.creatorUsername);
    }
    async edit(name, description, makeVoicePublic, previewText) {
        // this.client.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        var _a;
        const payload = this.rawInformation;
        payload.name = name;
        payload.description = description;
        payload.visibility = makeVoicePublic ? VoiceVisibility.Public : VoiceVisibility.Private;
        payload.previewText = previewText;
        // publish character now/edit
        const request = await this.client.requester.request(`https://neo.character.ai/multimodal/api/v1/voices/${this.id}`, {
            method: 'PUT',
            body: parser_1.default.stringify({ voice: payload }),
            contentType: 'application/json',
            includeAuthorization: true
        });
        const response = await parser_1.default.parseJSON(request);
        if (!request.ok)
            throw new Error((_a = response.message) !== null && _a !== void 0 ? _a : String(response));
        const information = response.voice;
        this.rawInformation = information;
        patcher_1.default.patch(this.client, this, information);
    }
    async delete() {
        // this.client.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        var _a;
        if (this.client.myProfile.username != this.creatorUsername)
            return new Error("You do not have the permission to do this");
        const request = await this.client.requester.request(`https://neo.character.ai/multimodal/api/v1/voices/${this.id}`, {
            method: 'DELETE',
            includeAuthorization: true
        });
        const response = await parser_1.default.parseJSON(request);
        if (!request.ok)
            throw new Error((_a = response.message) !== null && _a !== void 0 ? _a : String(response));
    }
    constructor(client, information) {
        super();
        this.rawInformation = {};
        // id
        this.id = "";
        // name
        this.name = "";
        // description
        this.description = "";
        // gender
        this.gender = VoiceGender.Unknown;
        // visibility
        this.visibility = VoiceVisibility.Public;
        this.creatorInfo = {};
        // audioSourceType
        this.audioSourceType = "";
        // previewText
        this.previewText = "";
        // previewAudioURI
        this.previewAudioURI = "";
        // backendProvider
        this.backendProvider = "";
        // backendId
        this.backendId = "";
        // internalStatus
        this.internalStatus = InternalVoiceStatus.Unknown;
        // lastUpdateTime
        this.lastUpdateTime = "";
        this.client = client;
        this.rawInformation = information;
        patcher_1.default.patch(client, this, information);
    }
}
exports.CAIVoice = CAIVoice;
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", client_1.CharacterAI)
], CAIVoice.prototype, "client", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], CAIVoice.prototype, "rawInformation", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], CAIVoice.prototype, "creatorInfo", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], CAIVoice.prototype, "creatorUsername", null);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], CAIVoice.prototype, "creatorSource", null);
//# sourceMappingURL=voice.js.map