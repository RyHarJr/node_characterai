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
exports.EditedCandidate = exports.Candidate = exports.AnnotationValue = exports.AnnotationStars = void 0;
const client_1 = require("../client");
const parser_1 = __importDefault(require("../parser"));
const patcher_1 = __importDefault(require("../utils/patcher"));
const specable_1 = require("../utils/specable");
const message_1 = require("./message");
var AnnotationStars;
(function (AnnotationStars) {
    AnnotationStars[AnnotationStars["Remove"] = 0] = "Remove";
    AnnotationStars[AnnotationStars["One"] = 1] = "One";
    AnnotationStars[AnnotationStars["Two"] = 2] = "Two";
    AnnotationStars[AnnotationStars["Three"] = 3] = "Three";
    AnnotationStars[AnnotationStars["Four"] = 4] = "Four";
})(AnnotationStars || (exports.AnnotationStars = AnnotationStars = {}));
;
var AnnotationValue;
(function (AnnotationValue) {
    AnnotationValue["Boring"] = "boring";
    AnnotationValue["Repetitive"] = "repetitive";
    AnnotationValue["BadMemory"] = "bad_memory";
    AnnotationValue["TooShort"] = "short";
    AnnotationValue["NotTrue"] = "inaccurate";
    AnnotationValue["OutOfCharacter"] = "out_of_character";
    AnnotationValue["TooLong"] = "long";
    AnnotationValue["EndedChatEarly"] = "ends_chat_early";
    AnnotationValue["Funny"] = "funny";
    AnnotationValue["Helpful"] = "helpful";
    AnnotationValue["Interesting"] = "interesting";
    AnnotationValue["GoodMemory"] = "good_memory";
})(AnnotationValue || (exports.AnnotationValue = AnnotationValue = {}));
class Candidate extends specable_1.Specable {
    get candidateId() { return this.candidate_id; }
    set candidateId(value) { this.candidate_id = value; }
    get creationDate() { return new Date(this.create_time); }
    get content() { return this.raw_content; }
    set content(value) { this.raw_content = value; }
    get isFinal() { return this.is_final; }
    set isFinal(value) { this.is_final = value; }
    get wasFlagged() { return this.safety_truncated; }
    set wasFlagged(value) { this.safety_truncated = value; }
    // annotation
    async createAnnotation(annotation) {
        // this.client.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        const isAnnotationString = typeof annotation == "string";
        const isAnnotationStars = Object.values(AnnotationStars).includes(annotation);
        const request = await this.client.requester.request("https://neo.character.ai/annotation/create", {
            method: 'POST',
            includeAuthorization: true,
            body: parser_1.default.stringify({
                annotation: Object.assign(Object.assign({ annotation_type: isAnnotationString ? (isAnnotationStars ? "custom" : annotation) : "star" }, isAnnotationString ? { annotation_raw_content: annotation } : undefined), { annotation_value: isAnnotationString ? 1 : annotation }),
                candidate_id: this.candidateId,
                turn_key: { chat_id: this.message.turnKey.chatId, turn_id: this.message.turnKey.turnId }
            }),
            contentType: 'application/json'
        });
        const response = await parser_1.default.parseJSON(request);
        if (!request.ok)
            throw new Error(String(response));
        return response.annotation.annotation_id;
    }
    async removeAnnotation(annotationId) {
        // this.client.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        const request = await this.client.requester.request("https://neo.character.ai/annotation/remove", {
            method: 'POST',
            includeAuthorization: true,
            body: parser_1.default.stringify({
                annotation_id: annotationId,
                candidate_id: this.candidateId,
                turn_key: { chat_id: this.message.turnKey.chatId, turn_id: this.message.turnKey.turnId }
            }),
            contentType: 'application/json'
        });
        const response = await parser_1.default.parseJSON(request);
        if (!request.ok)
            throw new Error(String(response));
    }
    // https://neo.character.ai/multimodal/api/v1/memo/replay
    async internalGetTTSUrl(voiceId, voiceQuery) {
        // this.client.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        const request = await this.client.requester.request("https://neo.character.ai/multimodal/api/v1/memo/replay", {
            method: 'POST',
            includeAuthorization: true,
            body: parser_1.default.stringify({
                candidateId: this.candidateId,
                roomId: this.message.chatId,
                turnId: this.message.turnId,
                voiceId,
                voiceQuery
            }),
            contentType: 'application/json'
        });
        const response = await parser_1.default.parseJSON(request);
        if (!request.ok)
            throw new Error(response);
        return response.replayUrl;
    }
    async setPrimary() {
        if (this.message.primaryCandidate == this)
            return;
        await this.message.switchPrimaryCandidateTo(this.candidateId);
    }
    // TTS
    async getTTSUrlWithQuery(voiceQuery) { return await this.internalGetTTSUrl(undefined, voiceQuery !== null && voiceQuery !== void 0 ? voiceQuery : ""); }
    async getTTSUrl(voiceId) { return await this.internalGetTTSUrl(voiceId); }
    constructor(client, message, information) {
        super();
        // candidate_id
        this.candidate_id = "";
        // create_time
        this.create_time = "";
        // raw_content
        this.raw_content = "";
        // is_final
        this.is_final = true;
        // safety_truncated
        this.safety_truncated = false;
        this.client = client;
        this.message = message;
        patcher_1.default.patch(client, this, information);
    }
}
exports.Candidate = Candidate;
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", client_1.CharacterAI)
], Candidate.prototype, "client", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", message_1.CAIMessage)
], Candidate.prototype, "message", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], Candidate.prototype, "candidate_id", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], Candidate.prototype, "candidateId", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", String)
], Candidate.prototype, "create_time", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], Candidate.prototype, "creationDate", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], Candidate.prototype, "raw_content", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], Candidate.prototype, "content", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], Candidate.prototype, "is_final", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], Candidate.prototype, "isFinal", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], Candidate.prototype, "safety_truncated", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], Candidate.prototype, "wasFlagged", null);
;
class EditedCandidate extends Candidate {
    constructor() {
        super(...arguments);
        // base_candidate_id?
        this.base_candidate_id = "";
        // editor { author_id }?
        this.editor = {};
    }
    get baseCandidateId() { return this.base_candidate_id; }
    set baseCandidateId(value) { this.base_candidate_id = value; }
    get editorAuthorId() { return { authorId: this.editor.author_id }; }
}
exports.EditedCandidate = EditedCandidate;
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], EditedCandidate.prototype, "base_candidate_id", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], EditedCandidate.prototype, "baseCandidateId", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], EditedCandidate.prototype, "editor", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], EditedCandidate.prototype, "editorAuthorId", null);
;
//# sourceMappingURL=candidate.js.map