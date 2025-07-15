import { CharacterAI, CheckAndThrow } from "../client";
import Parser from '../parser';
import fs from 'fs';
import { getterProperty, hiddenProperty, Specable } from '../utils/specable';

const neoImageEndpoint = "https://characterai.io/i/200/static/avatars/";
const betaImageEndpoint = "https://characterai.io/i/400/static/user/";

export interface IGeneratedImage {
    prompt: string,
    url: string
}

export class CAIImage extends Specable {
    @hiddenProperty
    private client: CharacterAI;

    @hiddenProperty
    private imageEndpoint = neoImageEndpoint;

    @hiddenProperty
    private _endpointUrl = "";
    @getterProperty
    public get endpointUrl() { return this._endpointUrl; }

    public get hasImage() { return this.endpointUrl != ""; }

    public get fullUrl() {
        return this._endpointUrl != "" ? `${this.imageEndpoint}${this._endpointUrl}` : "";
    }

    @hiddenProperty
    private _prompt?: string = undefined;
    @getterProperty
    public get prompt() { return this._prompt; }

    @hiddenProperty
    private _isImageUploaded: boolean = false;
    @getterProperty
    public get isImageUploaded() { return this._isImageUploaded; }

    private canUploadChanges: Function;

    private async downloadImageBuffer(url: string, headers?: Record<string, string>) {
        if (!this.hasImage)
            console.warn("[node_characterai] No images are loaded or assigned to this cached image.");
        return (await fetch(url, { headers })).arrayBuffer();
    }

    public async uploadChanges() {
        this._isImageUploaded = false;

        if (!this.canUploadChanges())
            throw new Error("You cannot change this image or upload changes for it.");

        throw new Error("Image manipulation is not supported because 'sharp' has been removed.");
    }

    async changeToUrl(url: string, headers?: Record<string, string>) {
        const buffer = await this.downloadImageBuffer(url, headers);
        throw new Error("Image loading is disabled (sharp removed). Buffer retrieved, but no processing is done.");
    }

    public changeToFilePath(path: fs.PathOrFileDescriptor) {
        throw new Error("File loading not supported (sharp removed).");
    }

    async changeToBlobOrFile(blobOrFile: Blob | File) {
        throw new Error("Blob/File image loading not supported (sharp removed).");
    }

    public changeToBuffer(buffer: Buffer | ArrayBuffer) {
        throw new Error("Buffer-based image loading not supported (sharp removed).");
    }

    async changeToEndpointUrl(endpointUrl: string, imageEndpoint: string = neoImageEndpoint) {
        this.imageEndpoint = imageEndpoint;
        this._endpointUrl = endpointUrl;
        // originally, image buffer would be processed here
    }

    public changeToEndpointUrlSync(endpointUrl: string) {
        this._endpointUrl = endpointUrl;
        this.imageEndpoint = neoImageEndpoint;
    }

    async reloadImage() {
        await this.changeToEndpointUrl(this._endpointUrl);
    }

    async generateImageCandidates(prompt: string, numberOfCandidates: number = 4) {
        if (numberOfCandidates <= 0)
            throw new Error("Then number of candidates must be positive and above 0");

        const request = await this.client.requester.request("https://plus.character.ai/chat/character/generate-avatar-options", {
            method: 'POST',
            includeAuthorization: true,
            body: Parser.stringify({ prompt, num_candidates: numberOfCandidates, model_version: "v1" }),
            contentType: 'application/json'
        });

        const response = await Parser.parseJSON(request);
        if (!request.ok) throw new Error(response);

        return response.result as IGeneratedImage[];
    }

    async changeToPrompt(prompt: string) {
        const candidates = await this.generateImageCandidates(prompt, 4);
        this._prompt = prompt;
        const url = candidates[0].url;
        await this.changeToEndpointUrl(url, "");
    }

    constructor(client: CharacterAI, canUploadChanges: Function | boolean = true) {
        super();
        this.client = client;
        this.canUploadChanges =
            typeof canUploadChanges == 'boolean' ? () => canUploadChanges : canUploadChanges;
    }
}
