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
exports.CAIMessage = void 0;
const specable_1 = require("../utils/specable");
const client_1 = require("../client");
const patcher_1 = __importDefault(require("../utils/patcher"));
const candidate_1 = require("./candidate");
const conversation_1 = require("./conversation");
const parser_1 = __importDefault(require("../parser"));
const dmConversation_1 = __importDefault(require("./dmConversation"));
const warnings_1 = __importDefault(require("../warnings"));
class CAIMessage extends specable_1.Specable {
    get turnKey() {
        return {
            chatId: this.turn_key.chat_id,
            turnId: this.turn_key.turn_id,
        };
    }
    get turnId() { return this.turnKey.turnId; }
    get chatId() { return this.turnKey.chatId; }
    get creationDate() { return new Date(this.create_time); }
    get lastUpdateDate() { return new Date(this.last_update_time); }
    get authorId() { return this.author.author_id; }
    get isHuman() { var _a; return (_a = this.author.is_human) !== null && _a !== void 0 ? _a : false; }
    get authorUsername() { return this.author.name; }
    get isPinned() { return this.is_pinned; }
    set isPinned(value) { this.is_pinned = value; }
    async getAuthorProfile() {
        // this.client.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        const { authorUsername, isHuman } = this;
        if (!isHuman)
            throw Error("Failed to fetch author because this is message was not made by a human.");
        return await this.client.fetchProfileByUsername(authorUsername);
    }
    async getCharacter() {
        // this.client.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        const { authorId, isHuman } = this;
        if (isHuman)
            throw Error("Failed to fetch character because this is message was not made by a character.");
        return await this.client.fetchCharacter(authorId);
    }
    // the way candidates work is basically the messages that get edited you have
    // a way to select between 1/30 candidates and [0] will always be the latest candidate
    // turn key is the identifier that holds them (aka a "message.id")
    // combo is chat id + turn key but we already have the chat id
    // turn keys are indexed by the conversation
    // this function will index candidates and give them proper instances
    addCandidate(candidateObject, addAfterToActualRawCandidates) {
        const isEditedCandidate = this.candidates.length > 1;
        const candidate = isEditedCandidate
            ? new candidate_1.EditedCandidate(this.client, this, candidateObject)
            : new candidate_1.Candidate(this.client, this, candidateObject);
        if (candidate.wasFlagged)
            warnings_1.default.show('contentFiltered');
        this.candidateIdToCandidate[candidate.candidateId] = candidate;
        if (addAfterToActualRawCandidates)
            this.candidates.unshift(candidateObject);
    }
    indexCandidates() {
        this.candidateIdToCandidate = {};
        for (let i = 0; i < this.candidates.length; i++) {
            const candidateObject = this.candidates[i];
            this.addCandidate(candidateObject, false); // we use previously added, no need to readd
        }
    }
    getCandidateByTurnId(turnId) {
        const candidate = this.candidateIdToCandidate[turnId];
        if (!candidate)
            throw new Error("Candidate not found");
        return candidate;
    }
    getCandidateByIndex(index) {
        const candidate = Object.values(this.candidateIdToCandidate)[index];
        if (!candidate)
            throw new Error("Candidate not found");
        return candidate;
    }
    getCandidates() {
        // create copy to avoid modification
        return Object.assign({}, this.candidateIdToCandidate);
    }
    // get primaryCandidate
    // content is influenced by the primary candidate to save time/braincells
    get content() { var _a, _b; return (_b = (_a = this.primaryCandidate) === null || _a === void 0 ? void 0 : _a.content) !== null && _b !== void 0 ? _b : ""; }
    get wasFlagged() { var _a, _b; return (_b = (_a = this.primaryCandidate) === null || _a === void 0 ? void 0 : _a.wasFlagged) !== null && _b !== void 0 ? _b : false; }
    get primaryCandidate() { return this.getCandidateByTurnId(this.primary_candidate_id); }
    // use specific candidate id to change specific id or it will change the latest
    async edit(newContent, specificCandidateId) {
        // this.client.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        const candidateId = specificCandidateId !== null && specificCandidateId !== void 0 ? specificCandidateId : this.primaryCandidate.candidateId;
        let request;
        if (this.conversation instanceof dmConversation_1.default) {
            request = await this.client.sendDMWebsocketCommandAsync({
                command: "edit_turn_candidate",
                originId: "Android",
                streaming: true,
                waitForAIResponse: false,
                payload: {
                    turn_key: this.turn_key,
                    current_candidate_id: candidateId,
                    new_candidate_raw_content: newContent
                }
            });
        }
        else {
        }
        this.candidates = request.pop().turn.candidates;
        this.indexCandidates();
    }
    // next/previous/candidate_id
    async internalSwitchPrimaryCandidate(candidate) {
        // this.client.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        var _a, _b, _c, _d;
        let candidateId = candidate;
        let candidates = this.getCandidates();
        const candidateValues = Object.values(candidates);
        const primaryCandidateIndex = Object.keys(candidates).indexOf(this.primary_candidate_id);
        if (primaryCandidateIndex != -1) {
            if (candidate == 'next')
                candidateId = (_b = (_a = candidateValues[primaryCandidateIndex + 1]) === null || _a === void 0 ? void 0 : _a.candidateId) !== null && _b !== void 0 ? _b : "";
            if (candidate == 'previous')
                candidateId = (_d = (_c = candidateValues[primaryCandidateIndex - 1]) === null || _c === void 0 ? void 0 : _c.candidateId) !== null && _d !== void 0 ? _d : "";
        }
        if (candidateId.trim() == "")
            throw new Error("Cannot find the message, it is invalid or it is out of range.");
        const firstRequest = await this.client.requester.request(`https://neo.character.ai/annotations/${this.conversation.chatId}/${this.turnId}/${candidateId}`, {
            method: 'POST',
            contentType: 'application/json',
            body: '{}',
            includeAuthorization: true
        });
        const firstResponse = await parser_1.default.parseJSON(firstRequest);
        if (!firstRequest.ok)
            throw new Error(firstResponse);
        await this.client.sendDMWebsocketCommandAsync({
            command: "update_primary_candidate",
            originId: "Android",
            streaming: false,
            waitForAIResponse: true,
            expectedReturnCommand: "ok",
            payload: {
                candidate_id: candidateId,
                turn_key: this.turn_key,
            }
        });
        this.primary_candidate_id = candidate;
        this.indexCandidates();
        return this.primaryCandidate;
    }
    async switchToPreviousCandidate() { return this.internalSwitchPrimaryCandidate("previous"); }
    async switchToNextCandidate() { return this.internalSwitchPrimaryCandidate("next"); }
    async switchPrimaryCandidateTo(candidateId) { return await this.internalSwitchPrimaryCandidate(candidateId); }
    async regenerate() { return this.conversation.regenerateMessage(this); }
    getConversationMessageAfterIndex(offset) {
        const conversationMessageIds = this.conversation.messageIds;
        let index = conversationMessageIds.indexOf(this.turnId);
        if (index == -1)
            return null;
        index += offset;
        if (index < 0 || index >= conversationMessageIds.length)
            return null;
        return this.conversation.messages[index];
    }
    getMessageBefore() { return this.getConversationMessageAfterIndex(-1); }
    getMessageAfter() { return this.getConversationMessageAfterIndex(1); }
    async getAllMessagesAfter() {
        const conversationMessageIds = this.conversation.messageIds;
        const index = conversationMessageIds.indexOf(this.turnId);
        if (index == -1)
            return [];
        let messagesAfter = [];
        // FIXME: might wanna not use the cache for that one
        for (let i = index; i < conversationMessageIds.length; i++)
            messagesAfter.push(this.conversation.messages[i]);
        return messagesAfter;
    }
    async handlePin(isPinned) {
        // this.client.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        if (this.isPinned == isPinned)
            return;
        await this.client.sendDMWebsocketCommandAsync({
            command: "set_turn_pin",
            originId: "Android",
            streaming: false,
            waitForAIResponse: false,
            payload: {
                turn_key: this.turn_key,
                is_pinned: isPinned
            }
        });
        this.isPinned = isPinned;
    }
    async pin() { await this.handlePin(true); }
    async unpin() { await this.handlePin(false); }
    // https://neo.character.ai/chat/id/copy
    async copyFromHere(isDM = true) {
        // this.client.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        const request = await this.client.requester.request(`https://neo.character.ai/chat/${this.conversation.chatId}/copy`, {
            method: 'POST',
            contentType: 'application/json',
            body: parser_1.default.stringify({ end_turn_id: this.turnId }),
            includeAuthorization: true
        });
        const response = await parser_1.default.parseJSON(request);
        if (!request.ok)
            throw new Error(String(response));
        const { new_chat_id: newChatId } = response;
        return isDM
            ? await this.client.fetchDMConversation(newChatId)
            : await this.client.fetchGroupChatConversation();
    }
    async rewindFromHere() {
        // this.client.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        var _a;
        if (((_a = this.conversation.getLastMessage()) === null || _a === void 0 ? void 0 : _a.turnId) == this.turnId)
            throw new Error("You cannot rewind from the last message in the conversation.");
        return await this.conversation.deleteMessagesInBulk(await this.getAllMessagesAfter());
    }
    async delete() { return await this.conversation.deleteMessage(this); }
    // TTS
    async getTTSUrlWithQuery(voiceQuery) { return await this.primaryCandidate.getTTSUrlWithQuery(voiceQuery); }
    async getTTSUrl(voiceId) { return await this.primaryCandidate.getTTSUrl(voiceId); }
    /**
     * Patches and indexes an unsanitized turn.
     * @remarks **Do not use this method.** It is meant for internal use only.
     */
    indexTurn(turn) {
        patcher_1.default.patch(this.client, this, turn);
        this.indexCandidates();
    }
    constructor(client, conversation, turn) {
        super();
        // turn_key
        this.turn_key = {};
        // create_time
        this.create_time = "";
        // last_update_time
        this.last_update_time = "";
        // state
        this.state = "STATE_OK";
        // author
        this.author = {};
        // is_pinned
        this.is_pinned = false;
        // candidates 
        // |_ candidate_id
        // |_ create_time
        // |_ raw_content?
        // |_ is_final?
        this.candidates = [];
        // the main request forces you to use candidates
        this.candidateIdToCandidate = {};
        // primary_candidate_id
        this.primary_candidate_id = "";
        this.client = client;
        this.conversation = conversation;
        this.indexTurn(turn);
    }
}
exports.CAIMessage = CAIMessage;
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", client_1.CharacterAI)
], CAIMessage.prototype, "client", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", conversation_1.Conversation)
], CAIMessage.prototype, "conversation", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], CAIMessage.prototype, "turn_key", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], CAIMessage.prototype, "turnKey", null);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", String),
    __metadata("design:paramtypes", [])
], CAIMessage.prototype, "turnId", null);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], CAIMessage.prototype, "chatId", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], CAIMessage.prototype, "create_time", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], CAIMessage.prototype, "creationDate", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], CAIMessage.prototype, "last_update_time", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], CAIMessage.prototype, "lastUpdateDate", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], CAIMessage.prototype, "author", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], CAIMessage.prototype, "authorId", null);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], CAIMessage.prototype, "isHuman", null);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], CAIMessage.prototype, "authorUsername", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Boolean)
], CAIMessage.prototype, "is_pinned", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], CAIMessage.prototype, "isPinned", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Array)
], CAIMessage.prototype, "candidates", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], CAIMessage.prototype, "candidateIdToCandidate", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], CAIMessage.prototype, "primary_candidate_id", void 0);
//# sourceMappingURL=message.js.map