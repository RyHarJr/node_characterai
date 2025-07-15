import { getterProperty, hiddenProperty, Specable } from "../utils/specable";
import { CharacterAI } from "../client";
import Parser from "../parser";
import ObjectPatcher from "../utils/patcher";
import Warnings from "../warnings";
import { CAIMessage } from "./message";

export interface ICAIConversationCreation {
    messages?: any[]
};

export enum ConversationState {
    Active = "STATE_ACTIVE",
    Archived = "STATE_ARCHIVED"
};

export enum ConversationVisibility {
    Public = "VISIBILITY_PUBLIC",
    Private = "VISIBILITY_PRIVATE"
};

export interface ICAIMessageSending {
    manualTurn: boolean,
    getMyMessageInstead: boolean
};

export class Conversation extends Specable {
    @hiddenProperty
    protected client: CharacterAI;

    @hiddenProperty
    public maxMessagesStored = 200;

    @hiddenProperty
    private cachedMessages: CAIMessage[] = [];
    @hiddenProperty
    private processingMessages: CAIMessage[] = [];
    @hiddenProperty
    public messageIds: string[] = [];

    public get messages() { return { ...this.cachedMessages }; }

    @hiddenProperty
    private chat_id = "";
    @getterProperty
    public get chatId() { return this.chat_id; }
    public set chatId(value) { this.chat_id = value; }

    @hiddenProperty
    private create_time: string = "";
    @getterProperty
    public get creationDate() { return new Date(this.create_time); }

    @hiddenProperty
    private creator_id = "";
    @getterProperty
    public get creatorId() { return this.creator_id; }
    public set creatorId(value) { this.creator_id = value; }

    @hiddenProperty
    private character_id = "";
    @getterProperty
    public get characterId() { return this.character_id; }
    protected set characterId(value) { this.character_id = value; }

    public state: ConversationState = ConversationState.Active;
    public type: string = "TYPE_ONE_ON_ONE";
    public visibility: ConversationVisibility = ConversationVisibility.Private;

    async getCharacter() { return await this.client.fetchCharacter(this.character_id); }
    async getCreator() { return await this.client.fetchProfileByUsername(this.creator_id); }

    @hiddenProperty
    private preferred_model_type = "";
    @getterProperty
    public get preferredModelType() { return this.preferred_model_type; }
    protected set preferredModelType(value) { this.preferred_model_type = value; }

    async setPreferredModelType(modelId: string) {
        const request = await this.client.requester.request(
            `https://neo.character.ai/chat/${this.chatId}/preferred-model-type`,
            {
                method: 'PATCH',
                includeAuthorization: true,
                body: Parser.stringify({ preferred_model_type: modelId })
            }
        );

        const response = await Parser.parseJSON(request);
        if (!request.ok) throw new Error(String(response));

        this.preferredModelType = modelId;
    }

    public getLastMessage() {
        return this.messages.length > 0 ? this.messages[this.messages.length - 1] : null;
    }

    protected frozen = false;

    private async getTurnsBatch(nextToken?: string, pinnedOnly?: boolean) {
        let query = "";
        if (nextToken) query = `?next_token=${encodeURIComponent(nextToken)}`;
        if (pinnedOnly) query = "?pinned_only=true";

        const request = await this.client.requester.request(
            `https://neo.character.ai/turns/${this.chatId}/${query}`,
            {
                method: 'GET',
                includeAuthorization: true
            }
        );

        const response = await Parser.parseJSON(request);
        if (!request.ok) throw new Error(response);
        return response;
    }

    protected addMessage(message: CAIMessage) {
        if (this.processingMessages.length >= this.maxMessagesStored) {
            this.processingMessages.pop();
            this.processingMessages.pop();
            Warnings.show("reachedMaxMessages");
        }

        this.processingMessages.unshift(message);
        this.messageIds.unshift(message.turnId);

        this.cachedMessages = this.processingMessages;
        return message;
    }

    private async fetchMessagesViaQuery(pinnedOnly: boolean, maxMessages = this.maxMessagesStored) {
        const { maxMessagesStored } = this;
        if (maxMessagesStored % 50 != 0) 
            throw Error("Max messages to store must be a multiple of 50.");

        let messages: CAIMessage[] = [];
        let nextToken: string | undefined = undefined;

        for (let i = 0; i < maxMessages / 50; i += 50) {
            const response = await this.getTurnsBatch(nextToken, pinnedOnly);
            const { turns } = response;

            if (!turns) break;
            if (turns.length === 0) break;
            nextToken = response?.meta?.next_token;

            for (let j = 0; j < turns.length; j++) 
                messages.push(new CAIMessage(this.client, this, turns[j]));
        }

        return messages;
    }

    async refreshMessages() {
        if (this.frozen) return;

        const { maxMessagesStored } = this;
        if (maxMessagesStored % 50 != 0) 
            throw Error("Max messages to store must be a multiple of 50.");

        this.frozen = true;
        this.processingMessages = [];
        this.messageIds = [];

        const messages = await this.fetchMessagesViaQuery(false);
        for (let i = 0; i < messages.length; i++)
            this.addMessage(messages[i]);

        const pinnedMessages = await this.getPinnedMessages();
        for (let i = 0; i < pinnedMessages.length; i++)
            this.processingMessages[i].isPinned = true;

        this.cachedMessages = this.processingMessages;
        this.frozen = false;
    }

    async sendMessage(content: string, options?: ICAIMessageSending): Promise<CAIMessage> {
        return new CAIMessage(this.client, this, {});
    }

    async getPinnedMessages() {
        return await this.fetchMessagesViaQuery(true);
    }

    async rename(newName: string) {}

    async regenerateMessage(message: CAIMessage): Promise<CAIMessage> {
        return new CAIMessage(this.client, new Conversation(this.client, {}), {});
    }

    async reset() {
        return await this.deleteMessagesInBulk(await this.fetchMessagesViaQuery(false, 999999));
    }

    private async deleteTurns(turnIds: string[], refreshMessages: boolean) {
        await this.client.sendDMWebsocketCommandAsync({
            command: "remove_turns",
            originId: "Android",
            streaming: false,
            waitForAIResponse: false,
            payload: {
                chat_id: this.chatId,
                turn_ids: turnIds
            }
        });

        if (refreshMessages) await this.refreshMessages();
    }

    async deleteMessagesInBulk(input: number | string[] | CAIMessage[], refreshMessages: boolean = true) {
        Warnings.show('deletingInBulk');

        let turnIds: string[] = [];

        if (typeof input === 'number') {
            if (input <= 0 || input >= this.maxMessagesStored)
                throw new Error("Invalid deletion range.");

            const messageCount = this.messages.length;
            const fetchedMessages = this.messages.slice(messageCount - input, messageCount);
            turnIds = fetchedMessages.map(message => message.turnId);

        } else if (Array.isArray(input)) {
            if (input.every(item => typeof item === 'string')) 
                turnIds = input as string[];

            if (input.every(item => item instanceof CAIMessage)) 
                turnIds = (input as CAIMessage[]).map(message => message.turnId);
        }

        if (turnIds.length === 0) return;
        return await this.deleteTurns(turnIds, refreshMessages);
    }

    async deleteMessageById(turnId: string, refreshMessages: boolean = true) {
        return await this.deleteMessagesInBulk([turnId], refreshMessages);
    }

    async deleteMessage(message: CAIMessage, refreshMessages: boolean = true) {
        return this.deleteMessageById(message.turnId, refreshMessages);
    }

    constructor(client: CharacterAI, information: any) {
        super();
        this.client = client;
        ObjectPatcher.patch(this.client, this, information);
    }
};
