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
exports.PublicProfile = void 0;
const parser_1 = __importDefault(require("../parser"));
const client_1 = require("../client");
const patcher_1 = __importDefault(require("../utils/patcher"));
const specable_1 = require("../utils/specable");
const character_1 = require("../character/character");
const unavailableCodes_1 = require("../utils/unavailableCodes");
class PublicProfile {
    get displayName() { return this.name; }
    set displayName(value) { this.name = value; }
    get followingCount() { return this.num_following; }
    set followingCount(value) { this.num_following = value; }
    get followersCount() { return this.num_followers; }
    set followersCount(value) { this.num_followers = value; }
    async follow() {
        this.client.throwBecauseNotAvailableYet(unavailableCodes_1.CSRF_COOKIE_REQUIRED);
        if (this.username == this.client.myProfile.username)
            throw new Error("You cannot follow yourself!");
        const request = await this.client.requester.request("https://plus.character.ai/chat/user/follow", {
            method: 'POST',
            includeAuthorization: true,
            body: parser_1.default.stringify({ username: this.username })
        });
        if (!request.ok)
            throw new Error(await parser_1.default.parseJSON(request));
    }
    async unfollow() {
        this.client.throwBecauseNotAvailableYet(unavailableCodes_1.CSRF_COOKIE_REQUIRED);
        if (this.username == this.client.myProfile.username)
            throw new Error("You cannot unfollow or follow yourself!");
        const request = await this.client.requester.request("https://plus.character.ai/chat/user/unfollow", {
            method: 'POST',
            includeAuthorization: true,
            body: parser_1.default.stringify({ username: this.username })
        });
        if (!request.ok)
            throw new Error(await parser_1.default.parseJSON(request));
    }
    async getFollowers(page = 1) {
        const request = await this.client.requester.request("https://plus.character.ai/chat/user/followers", {
            method: 'POST',
            includeAuthorization: true,
            body: parser_1.default.stringify({ username: this.username, pageParam: page })
        });
        if (!request.ok)
            throw new Error(await parser_1.default.parseJSON(request));
    }
    async getFollowing(page = 1) {
        const request = await this.client.requester.request("https://plus.character.ai/chat/user/following", {
            method: 'POST',
            includeAuthorization: true,
            body: parser_1.default.stringify({ username: this.username, pageParam: page })
        });
        if (!request.ok)
            throw new Error(await parser_1.default.parseJSON(request));
    }
    loadFromInformation(information) {
        if (!information)
            return;
        const { characters } = information;
        patcher_1.default.patch(this.client, this, information);
        this.loadCharacters(characters);
    }
    loadCharacters(characters) {
        if (!characters)
            return;
        this.characters = [];
        characters.forEach(characterInfo => {
            this.characters.push(new character_1.Character(this.client, characterInfo));
        });
    }
    async refreshProfile() {
        const request = await this.client.requester.request("https://plus.character.ai/chat/user/public/", {
            method: 'POST',
            includeAuthorization: true,
            contentType: 'application/json',
            body: parser_1.default.stringify({ username: this.username })
        });
        const response = await parser_1.default.parseJSON(request);
        if (!request.ok || (response === null || response === void 0 ? void 0 : response.length) === 0)
            throw new Error("Profile not found. Watch out! Profile names are case sensitive.");
        this.loadFromInformation(response.public_user);
    }
    constructor(client, options) {
        this.characters = [];
        this.username = "";
        this.name = "";
        this.num_following = 0;
        this.num_followers = 0;
        this.subscriptionType = "";
        this.bio = "";
        this.client = client;
        this.loadFromInformation(options);
    }
}
exports.PublicProfile = PublicProfile;
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], PublicProfile.prototype, "name", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], PublicProfile.prototype, "displayName", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], PublicProfile.prototype, "num_following", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], PublicProfile.prototype, "followingCount", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], PublicProfile.prototype, "num_followers", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], PublicProfile.prototype, "followersCount", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", client_1.CharacterAI)
], PublicProfile.prototype, "client", void 0);
//# sourceMappingURL=publicProfile.js.map