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
exports.PreviewDMConversation = void 0;
const specable_1 = require("../utils/specable");
const dmConversation_1 = __importDefault(require("./dmConversation"));
const message_1 = require("./message");
class PreviewDMConversation extends dmConversation_1.default {
    constructor(client, information) {
        super(client, information);
        // preview_turns
        this.preview_turns = [];
        this.previewTurns = [];
        for (let i = 0; i < this.preview_turns.length; i++)
            this.previewTurns.push(new message_1.CAIMessage(client, this, this.preview_turns[i]));
    }
}
exports.PreviewDMConversation = PreviewDMConversation;
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], PreviewDMConversation.prototype, "preview_turns", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Array)
], PreviewDMConversation.prototype, "previewTurns", void 0);
;
//# sourceMappingURL=previewDMConversation.js.map