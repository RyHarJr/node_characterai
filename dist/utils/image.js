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
const fs_1 = __importDefault(require("fs"));
const specable_1 = require("../utils/specable");
const sharp_1 = __importDefault(require("sharp"));
const neoImageEndpoint = "https://characterai.io/i/200/static/avatars/";
const betaImageEndpoint = "https://characterai.io/i/400/static/user/";
// class to contain cai related images
/**
 * Holds a cached manipulated {@link Sharp} image instance to be edited and interacted with.
 */
class CAIImage extends specable_1.Specable {
    get endpointUrl() { return this._endpointUrl; }
    get hasImage() { return this.endpointUrl != ""; }
    /**
     * Gets full image URL (if available). Often returns into a `.webp` format.
     * To manipulate, save the file, or do more, use {@link getSharpImage} instead.
     */
    get fullUrl() { return this._endpointUrl != "" ? `${this.imageEndpoint}${this._endpointUrl}` : ""; }
    get prompt() { return this._prompt; }
    // if sharp image is loaded
    get isSharpImageLoaded() { return this.sharpImage != undefined; }
    get isImageUploaded() { return this._isImageUploaded; }
    // pipeline:
    // create image or load image:
    // get a buffer
    // * buffer makes SHARP IMAGE
    clearSharpImage() {
        var _a;
        (_a = this.sharpImage) === null || _a === void 0 ? void 0 : _a.destroy();
        delete this.sharpImage;
    }
    /**
     * Gets a {@link Sharp} image instance to manipulate the image.
     * @returns Sharp manipulable image
     */
    async getSharpImage() {
        if (this.isSharpImageLoaded)
            return this.sharpImage;
        await this.reloadImage();
        return this.sharpImage;
    }
    // LOADING methods
    makeSharpImage(target) {
        this.clearSharpImage();
        this.sharpImage = (0, sharp_1.default)(target);
    }
    async downloadImageBuffer(url, headers) {
        if (!this.hasImage)
            console.warn("[node_characterai] No images are loaded or assigned to this cached image. This could either mean the image doesn't have any fallback or it doesn't exist.");
        return (await fetch(url, { headers })).arrayBuffer();
    }
    /**
     * Uploads the internally stored image to CharacterAI and updates the cached image.
     * @warning This DOES not automatically apply the changes to the avatar, image, etc.. This has to be called with its appropriate `edit()` like or relevant method.
     */
    async uploadChanges() {
        // this.client.checkAndThrow(CheckAndThrow.RequiresAuthentication);
        this._isImageUploaded = false;
        if (!this.canUploadChanges())
            throw new Error("You cannot change this image or upload changes for it.");
        if (!this.sharpImage)
            throw new Error("Image not available or not loaded");
        const buffer = await this.sharpImage.toBuffer();
        const file = new File([buffer], "image.png", { type: "image/png" });
        // character ai deserves an award for the most batshit confusing endpoints to upload stuff ever
        const uploadRequest = await this.client.requester.request("https://beta.character.ai/chat/upload-image/", {
            method: 'POST',
            includeAuthorization: true,
            formData: { image: file },
            fileFieldName: 'image'
        });
        const uploadResponse = await parser_1.default.parseJSON(uploadRequest);
        if (!uploadRequest.ok)
            throw new Error("Could not upload picture");
        const uploadURL = uploadResponse.value;
        const checkRequest = await this.client.requester.request(`${betaImageEndpoint}${uploadURL}`, {
            method: 'GET',
            includeAuthorization: true
        });
        if (checkRequest.status != 200)
            throw new Error(await parser_1.default.parseJSON(checkRequest));
        this._isImageUploaded = true;
        // https://characterai.io/i/400/static/user/temp-images/uploaded/*/*/*/*
        await this.changeToEndpointUrl(uploadURL, betaImageEndpoint);
    }
    // THESE CHANGE THE SHARP IMAGE
    /**
     * Changes the internally stored image cache to a specific url.
     * @param url URL of the image
     * @param headers Additional optional headers
     */
    async changeToUrl(url, headers) {
        this.makeSharpImage(await this.downloadImageBuffer(url, headers));
    }
    /**
     * Changes the internally stored image cache to a file path.
     * @param path The absolute or relative file path of the image
     */
    changeToFilePath(path) { this.makeSharpImage(fs_1.default.readFileSync(path)); }
    /**
     * Changes the internally stored image cache to a specific {@link Blob} or {@link File}.
     * @param blobOrFile Blob or File instance
     */
    async changeToBlobOrFile(blobOrFile) { this.makeSharpImage(await blobOrFile.arrayBuffer()); }
    /**
     * Changes the internally stored image cache to a {@link Buffer}.
     * @param buffer Buffer or ArrayBuffer instance
     */
    changeToBuffer(buffer) { this.makeSharpImage(buffer); }
    /**
     * Changes the internally stored image cache to a related Character.AI endpoint image.
     * Do not use if you do not understand what this means.
     * @param endpointUrl Related (neo) endpoint URL
     * @param neoImageEndpoint Custom endpoint if required
     */
    async changeToEndpointUrl(endpointUrl, imageEndpoint = neoImageEndpoint) {
        // first off do this then load the sharpImage
        this.imageEndpoint = imageEndpoint;
        this._endpointUrl = endpointUrl;
        // then we download the picture in question
        this.makeSharpImage(await this.downloadImageBuffer(this.fullUrl));
    }
    // this pre loads the image by storing the endpoint url to later load it
    changeToEndpointUrlSync(endpointUrl) {
        this.clearSharpImage();
        this._endpointUrl = endpointUrl;
        this.imageEndpoint = neoImageEndpoint;
    }
    // use this if you fucked up the sharp image and you need a brand new one
    /**
     * Reloads the internally stored image cache to the initial endpoint URL.
     * Use the following method to restore if you had made unwanted changes in the internal image.
     */
    async reloadImage() { await this.changeToEndpointUrl(this._endpointUrl); }
    // extra
    /**
     * Generates multiple image candidates.
     * @param prompt The generation prompt for the images
     * @param numberOfCandidates The amount of image candidates to generate, default is 4
     * @returns Generated a {@link IGeneratedImage} array of generated image canidates if successful.
     */
    async generateImageCandidates(prompt, numberOfCandidates = 4) {
        // this.client.checkAndThrow(CheckAndThrow.RequiresAuthentication);
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
    /**
     * Changes the internally stored image cache to a related Character.AI generated image.
     * The first image candidate will be selected. To choose and generate candidates manually, see {@link generateImageCandidates}.
     * @param prompt The generation prompt for the image
     */
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
        // prompt used to generate the image
        this._prompt = undefined;
        // cannot be set
        this.sharpImage = undefined;
        // if image is uploaded to cai
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
    __metadata("design:type", Object)
], CAIImage.prototype, "sharpImage", void 0);
__decorate([
    specable_1.getterProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], CAIImage.prototype, "isSharpImageLoaded", null);
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