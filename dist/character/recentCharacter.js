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
exports.RecentCharacter = void 0;
const patcher_1 = __importDefault(require("../utils/patcher"));
const specable_1 = require("../utils/specable");
const character_1 = require("./character");
class RecentCharacter extends character_1.Character {
    get lastConversationId() { return this.chat_id; }
    get lastConversationDate() { return new Date(this.create_time); }
    // https://neo.character.ai/chats/recent/characterId/hide (PUT)
    async removeFromRecents() {
        // this.client.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        const request = await this.client.requester.request(`https://neo.character.ai/chats/recent/${this.characterId}/hide`, {
            method: 'PUT',
            includeAuthorization: true
        });
        if (!request.ok)
            throw new Error(String(request));
    }
    async getLastDMConversation() { return await this.client.fetchDMConversation(this.lastConversationId); }
    constructor(client, information) {
        super(client, information);
        // chat_id
        this.chat_id = "";
        // create_time
        this.create_time = "";
        patcher_1.default.patch(client, this, information);
    }
}
exports.RecentCharacter = RecentCharacter;
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], RecentCharacter.prototype, "chat_id", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], RecentCharacter.prototype, "lastConversationId", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", String)
], RecentCharacter.prototype, "create_time", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], RecentCharacter.prototype, "lastConversationDate", null);
//# sourceMappingURL=recentCharacter.js.map