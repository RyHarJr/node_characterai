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
exports.CAIImage = void 0;
const client_1 = require("../client");
const parser_1 = __importDefault(require("../parser"));
const specable_1 = require("../utils/specable");
const neoImageEndpoint = "https://characterai.io/i/200/static/avatars/";
const betaImageEndpoint = "https://characterai.io/i/400/static/user/";
class CAIImage extends specable_1.Specable {
    get endpointUrl() { return this._endpointUrl; }
    get hasImage() { return this.endpointUrl != ""; }
    get fullUrl() {
        return this._endpointUrl != "" ? `${this.imageEndpoint}${this._endpointUrl}` : "";
    }
    get prompt() { return this._prompt; }
    get isImageUploaded() { return this._isImageUploaded; }
    async downloadImageBuffer(url, headers) {
        if (!this.hasImage)
            console.warn("[node_characterai] No images are loaded or assigned to this cached image.");
        return (await fetch(url, { headers })).arrayBuffer();
    }
    async uploadChanges() {
        this._isImageUploaded = false;
        if (!this.canUploadChanges())
            throw new Error("You cannot change this image or upload changes for it.");
        throw new Error("Image manipulation is not supported because 'sharp' has been removed.");
    }
    async changeToUrl(url, headers) {
        const buffer = await this.downloadImageBuffer(url, headers);
        throw new Error("Image loading is disabled (sharp removed). Buffer retrieved, but no processing is done.");
    }
    changeToFilePath(path) {
        throw new Error("File loading not supported (sharp removed).");
    }
    async changeToBlobOrFile(blobOrFile) {
        throw new Error("Blob/File image loading not supported (sharp removed).");
    }
    changeToBuffer(buffer) {
        throw new Error("Buffer-based image loading not supported (sharp removed).");
    }
    async changeToEndpointUrl(endpointUrl, imageEndpoint = neoImageEndpoint) {
        this.imageEndpoint = imageEndpoint;
        this._endpointUrl = endpointUrl;
        // originally, image buffer would be processed here
    }
    changeToEndpointUrlSync(endpointUrl) {
        this._endpointUrl = endpointUrl;
        this.imageEndpoint = neoImageEndpoint;
    }
    async reloadImage() {
        await this.changeToEndpointUrl(this._endpointUrl);
    }
    async generateImageCandidates(prompt, numberOfCandidates = 4) {
        if (numberOfCandidates <= 0)
            throw new Error("Then number of candidates must be positive and above 0");
        const request = await this.client.requester.request("https://plus.character.ai/chat/character/generate-avatar-options", {
            method: 'POST',
            includeAuthorization: true,
            body: parser_1.default.stringify({ prompt, num_candidates: numberOfCandidates, model_version: "v1" }),
            contentType: 'application/json'
        });
        const response = await parser_1.default.parseJSON(request);
        if (!request.ok)
            throw new Error(response);
        return response.result;
    }
    async changeToPrompt(prompt) {
        const candidates = await this.generateImageCandidates(prompt, 4);
        this._prompt = prompt;
        const url = candidates[0].url;
        await this.changeToEndpointUrl(url, "");
    }
    constructor(client, canUploadChanges = true) {
        super();
        this.imageEndpoint = neoImageEndpoint;
        this._endpointUrl = "";
        this._prompt = undefined;
        this._isImageUploaded = false;
        this.client = client;
        this.canUploadChanges =
            typeof canUploadChanges == 'boolean' ? () => canUploadChanges : canUploadChanges;
    }
}
exports.CAIImage = CAIImage;
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", client_1.CharacterAI)
], CAIImage.prototype, "client", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], CAIImage.prototype, "imageEndpoint", void 0);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Object)
], CAIImage.prototype, "_endpointUrl", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], CAIImage.prototype, "endpointUrl", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", String)
], CAIImage.prototype, "_prompt", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], CAIImage.prototype, "prompt", null);
__decorate([
    specable_1.hiddenProperty,
    __metadata("design:type", Boolean)
], CAIImage.prototype, "_isImageUploaded", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], CAIImage.prototype, "isImageUploaded", null);
//# sourceMappingURL=image.js.map