import { CharacterAI } from "../client";
import fs from 'fs';
import { Specable } from '../utils/specable';
export interface IGeneratedImage {
    prompt: string;
    url: string;
}
export declare class CAIImage extends Specable {
    private client;
    private imageEndpoint;
    private _endpointUrl;
    get endpointUrl(): string;
    get hasImage(): boolean;
    get fullUrl(): string;
    private _prompt?;
    get prompt(): string | undefined;
    private _isImageUploaded;
    get isImageUploaded(): boolean;
    private canUploadChanges;
    private downloadImageBuffer;
    uploadChanges(): Promise<void>;
    changeToUrl(url: string, headers?: Record<string, string>): Promise<void>;
    changeToFilePath(path: fs.PathOrFileDescriptor): void;
    changeToBlobOrFile(blobOrFile: Blob | File): Promise<void>;
    changeToBuffer(buffer: Buffer | ArrayBuffer): void;
    changeToEndpointUrl(endpointUrl: string, imageEndpoint?: string): Promise<void>;
    changeToEndpointUrlSync(endpointUrl: string): void;
    reloadImage(): Promise<void>;
    generateImageCandidates(prompt: string, numberOfCandidates?: number): Promise<IGeneratedImage[]>;
    changeToPrompt(prompt: string): Promise<void>;
    constructor(client: CharacterAI, canUploadChanges?: Function | boolean);
}
//# sourceMappingURL=image.d.ts.map