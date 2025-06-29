import { CharacterAI } from "../client";
import fs from 'fs';
import { Specable } from '../utils/specable';
import { Sharp } from 'sharp';
export interface IGeneratedImage {
    prompt: string;
    url: string;
}
/**
 * Holds a cached manipulated {@link Sharp} image instance to be edited and interacted with.
 */
export declare class CAIImage extends Specable {
    private client;
    private imageEndpoint;
    private _endpointUrl;
    get endpointUrl(): string;
    get hasImage(): boolean;
    /**
     * Gets full image URL (if available). Often returns into a `.webp` format.
     * To manipulate, save the file, or do more, use {@link getSharpImage} instead.
     */
    get fullUrl(): string;
    private _prompt?;
    get prompt(): string | undefined;
    private sharpImage?;
    get isSharpImageLoaded(): boolean;
    private _isImageUploaded;
    get isImageUploaded(): boolean;
    private canUploadChanges;
    private clearSharpImage;
    /**
     * Gets a {@link Sharp} image instance to manipulate the image.
     * @returns Sharp manipulable image
     */
    getSharpImage(): Promise<Sharp>;
    private makeSharpImage;
    private downloadImageBuffer;
    /**
     * Uploads the internally stored image to CharacterAI and updates the cached image.
     * @warning This DOES not automatically apply the changes to the avatar, image, etc.. This has to be called with its appropriate `edit()` like or relevant method.
     */
    uploadChanges(): Promise<void>;
    /**
     * Changes the internally stored image cache to a specific url.
     * @param url URL of the image
     * @param headers Additional optional headers
     */
    changeToUrl(url: string, headers?: Record<string, string>): Promise<void>;
    /**
     * Changes the internally stored image cache to a file path.
     * @param path The absolute or relative file path of the image
     */
    changeToFilePath(path: fs.PathOrFileDescriptor): void;
    /**
     * Changes the internally stored image cache to a specific {@link Blob} or {@link File}.
     * @param blobOrFile Blob or File instance
     */
    changeToBlobOrFile(blobOrFile: Blob | File): Promise<void>;
    /**
     * Changes the internally stored image cache to a {@link Buffer}.
     * @param buffer Buffer or ArrayBuffer instance
     */
    changeToBuffer(buffer: Buffer | ArrayBuffer): void;
    /**
     * Changes the internally stored image cache to a related Character.AI endpoint image.
     * Do not use if you do not understand what this means.
     * @param endpointUrl Related (neo) endpoint URL
     * @param neoImageEndpoint Custom endpoint if required
     */
    changeToEndpointUrl(endpointUrl: string, imageEndpoint?: string): Promise<void>;
    changeToEndpointUrlSync(endpointUrl: string): void;
    /**
     * Reloads the internally stored image cache to the initial endpoint URL.
     * Use the following method to restore if you had made unwanted changes in the internal image.
     */
    reloadImage(): Promise<void>;
    /**
     * Generates multiple image candidates.
     * @param prompt The generation prompt for the images
     * @param numberOfCandidates The amount of image candidates to generate, default is 4
     * @returns Generated a {@link IGeneratedImage} array of generated image canidates if successful.
     */
    generateImageCandidates(prompt: string, numberOfCandidates?: number): Promise<IGeneratedImage[]>;
    /**
     * Changes the internally stored image cache to a related Character.AI generated image.
     * The first image candidate will be selected. To choose and generate candidates manually, see {@link generateImageCandidates}.
     * @param prompt The generation prompt for the image
     */
    changeToPrompt(prompt: string): Promise<void>;
    constructor(client: CharacterAI, canUploadChanges?: Function | boolean);
}
//# sourceMappingURL=image.d.ts.map