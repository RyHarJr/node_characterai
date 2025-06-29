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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchCharacter = exports.CharacterTags = void 0;
const specable_1 = require("../utils/specable");
const character_1 = require("./character");
var CharacterTags;
(function (CharacterTags) {
    CharacterTags["None"] = "";
    CharacterTags["Anime"] = "0";
    CharacterTags["Artist"] = "1";
    CharacterTags["Boss"] = "2";
    CharacterTags["Bully"] = "3";
    CharacterTags["Coach"] = "4";
    // Must find that one
    CharacterTags["Unknown5"] = "5";
    CharacterTags["Designer"] = "6";
    CharacterTags["Family"] = "7";
    CharacterTags["Famous"] = "8";
    CharacterTags["Gaming"] = "9";
    CharacterTags["Hero"] = "10";
    CharacterTags["Kpop"] = "11";
    CharacterTags["Lifestyle"] = "12";
    CharacterTags["Mafia"] = "13";
    CharacterTags["Maid"] = "14";
    CharacterTags["Music"] = "15";
    CharacterTags["Police"] = "16";
    CharacterTags["Professor"] = "17";
    CharacterTags["RPG"] = "18";
    CharacterTags["Romance"] = "19";
    CharacterTags["Solider"] = "20";
    CharacterTags["Student"] = "21";
    CharacterTags["Teacher"] = "22";
    CharacterTags["Vampire"] = "23";
})(CharacterTags || (exports.CharacterTags = CharacterTags = {}));
class SearchCharacter extends character_1.Character {
    constructor() {
        super(...arguments);
        this.document_id = "";
        // score / search_score
        this.score = undefined;
        this.search_score = undefined;
        this.priority = 0;
        // tag_id
        this.tag_id = CharacterTags.None;
        // tag
        this.tag = "";
        // created_at
        this.created_at = 0;
        // updated_at
        this.updated_at = 0;
    }
    get searchScore() { var _a, _b; return (_b = (_a = this.search_score) !== null && _a !== void 0 ? _a : this.score) !== null && _b !== void 0 ? _b : 0.0; }
    get tagId() { return this.tag_id; }
    get createdAt() { return this.created_at; }
    get updatedAt() { return this.updated_at; }
    get distance() { return this._distance; }
}
exports.SearchCharacter = SearchCharacter;
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], SearchCharacter.prototype, "document_id", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Number)
], SearchCharacter.prototype, "search_score", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], SearchCharacter.prototype, "searchScore", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", String)
], SearchCharacter.prototype, "tag_id", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], SearchCharacter.prototype, "tagId", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Number)
], SearchCharacter.prototype, "created_at", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], SearchCharacter.prototype, "createdAt", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Number)
], SearchCharacter.prototype, "updated_at", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], SearchCharacter.prototype, "updatedAt", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], SearchCharacter.prototype, "_distance", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], SearchCharacter.prototype, "distance", null);
//# sourceMappingURL=searchCharacter.js.map