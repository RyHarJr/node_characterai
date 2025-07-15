import DMConversation from "../chat/dmConversation";
import { PreviewDMConversation } from "../chat/previewDMConversation";
import { CharacterAI, CheckAndThrow } from "../client";
import Parser from "../parser";
import { PrivateProfile } from "../profile/privateProfile";
import { PublicProfile } from "../profile/publicProfile";
import ObjectPatcher from "../utils/patcher";
import { getterProperty, hiddenProperty, Specable } from "../utils/specable";
import { v4 as uuidv4 } from 'uuid';
import { ReportCharacterReason } from "./reportCharacter";
import { CharacterVisibility, CharacterVote, ICharacterModificationOptions } from "./characterEnums";
import { CSRF_COOKIE_REQUIRED, GROUP_CHATS_NOT_SUPPORTED_YET, WEIRD_INTERNAL_SERVER_ERROR } from "../utils/unavailableCodes";
import { Persona } from "../profile/persona";

export interface ICharacterGroupChatCreation {
    name: string,
    characters: Character[] | string[],
    anyoneCanJoin: boolean,
    requireApproval: boolean,
    withGreeting: boolean
};

export class Character extends Specable {
    @hiddenProperty
    protected client: CharacterAI;

    @hiddenProperty
    private external_id = "";
    @hiddenProperty
    private set character_id(value: any) { this.external_id = value; }

    @getterProperty
    public get externalId() { return this.external_id; }
    public set externalId(value) { this.external_id = value; }

    @getterProperty
    public get characterId() { return this.external_id; }
    public set characterId(value) { this.external_id = value; }

    private title: string = "";
    
    @getterProperty
    public get tagline() { return this.title; }
    public set tagline(value) { this.title = value; }

    public description: string = "";
    public identifier: string = "";
    public visibility: CharacterVisibility = CharacterVisibility.Public;

    @hiddenProperty
    private set character_visibility(value: CharacterVisibility) { this.visibility = value; }

    public copyable = false;
    public greeting = "";
    public songs: any[] = [];

    @hiddenProperty
    private dynamic_greeting_enabled?: boolean = undefined;
    @hiddenProperty
    private allow_dynamic_greeting?: boolean = undefined;
    @getterProperty
    public get dynamicGreetingEnabled() { return this.dynamic_greeting_enabled ?? this.allow_dynamic_greeting; }
    public set dynamicGreetingEnabled(value) { 
        if (this.dynamic_greeting_enabled) this.dynamic_greeting_enabled = value;
        if (this.allow_dynamic_greeting) this.allow_dynamic_greeting = value;
    }

    @hiddenProperty
    private starter_prompts = [];
    @getterProperty
    public get starterPrompts() { return this.starter_prompts; }
    public set starterPrompts(value) { this.starter_prompts = value; }
    
    @hiddenProperty
    private comments_enabled = true;
    @getterProperty
    public get commentsEnabled() { return this.comments_enabled; }
    public set commentsEnabled(value) { this.comments_enabled = value; }

    @hiddenProperty
    private short_hash = "";
    @getterProperty
    public get shortHash() { return this.short_hash; }
    public set shortHash(value) { this.short_hash = value; }

    public usage = "default";
    public definition = "";

    @hiddenProperty
    private participant__name?: string = undefined;
    @hiddenProperty
    private name?: string = undefined;
    @hiddenProperty
    private participant__user__username?: string = undefined;
    @hiddenProperty
    private character_name?: string = undefined;
    @getterProperty
    public get displayName() { return this.participant__name ?? this.name ?? this.participant__user__username ?? this.character_name; }
    public set displayName(value) { 
        if (this.participant__name) this.participant__name = value;
        if (this.name) this.name = value;
        if (this.participant__user__username) this.participant__user__username = value;
        if (this.character_name) this.character_name = value;
    }

    @hiddenProperty
    protected user__username = "";

    @hiddenProperty
    private participant__num_interactions?: string = undefined;
    @hiddenProperty
    private num_interactions?: string = undefined;
    @getterProperty
    public get interactionCount() { return this.participant__num_interactions ?? this.num_interactions; }
    public set interactionCount(value) { 
        if (this.participant__num_interactions) this.participant__num_interactions = value;
        if (this.num_interactions) this.num_interactions = value;
    }

    @hiddenProperty
    private num_likes: number = 0;
    @getterProperty
    public get likeCount() { return this.num_likes; }

    @hiddenProperty
    private num_interactions_last_day: number = 0;
    @getterProperty
    public get interactionCountLastDay() { return this.num_interactions_last_day; }

    @hiddenProperty
    private has_definition: boolean = false;
    @getterProperty
    public get hasDefinition() { return this.has_definition; }

    public safety: string = 'SAFE';

    @hiddenProperty
    private user__id = 0;
    @hiddenProperty
    private set creator_id(value: any) { this.user__id = value; }

    public get userId() { return this.user__id; }
    public set userId(value) { this.user__id = value; }

    @hiddenProperty
    private is_licensed_professional = false;

    public upvotes = 0;

    public translations: any = null;
    @hiddenProperty
    private set character_translations(value: any) { this.translations = value; }

    async getDMs(turnPreviewCount: number = 2, refreshChats: boolean = false): Promise<PreviewDMConversation[]> {
        const request = await this.client.requester.request(`https://neo.character.ai/chats/?character_ids=${this.characterId}?num_preview_turns=${turnPreviewCount}`, {
            method: 'GET',
            includeAuthorization: true,
            contentType: 'application/json'
        });

        const response = await Parser.parseJSON(request);
        if (!request.ok) throw new Error(response);

        const { chats } = response;
        const dms: PreviewDMConversation[] = [];

        for (let i = 0; i < chats.length; i++) {
            const conversation = new PreviewDMConversation(this.client, chats[i]);
            dms.push(conversation);

            if (!refreshChats) continue;
            await conversation.refreshMessages();
        }
        
        return dms;
    }

    private async internalDM(createNewConversation: boolean, withGreeting?: boolean, specificChatId?: string): Promise<DMConversation> {
        var conversation;
        if (specificChatId)
            conversation = await this.client.fetchDMConversation(specificChatId);

        if (createNewConversation) {
            const request = await this.client.sendDMWebsocketCommandAsync({
                command: "create_chat",
                originId: "Android",
                streaming: true,
                payload: {
                    chat: {
                        chat_id: uuidv4(),
                        creator_id: this.client.myProfile.userId.toString(),
                        visibility: "VISIBILITY_PRIVATE",
                        character_id: this.characterId,
                        type: "TYPE_ONE_ON_ONE"
                    },
                    with_greeting: withGreeting ?? true
                }
            })

            conversation = new DMConversation(this.client, request[0].chat);
        }

        if (!specificChatId) 
            conversation = await this.client.fetchLatestDMConversationWith(this.characterId);

        await conversation?.resurrect();
        await conversation?.refreshMessages();

        return conversation as DMConversation;
    }

    async createDM(withGreeting?: boolean) { return await this.internalDM(true, withGreeting); }
    async DM(specificChatId?: string) { return await this.internalDM(false, false, specificChatId); }

    async createGroupChat(options: ICharacterGroupChatCreation) {
        this.client.throwBecauseNotAvailableYet(GROUP_CHATS_NOT_SUPPORTED_YET);
    }

    async getAuthorProfile(): Promise<PublicProfile | PrivateProfile> {
        const username = this.user__username;
        const myProfile = this.client.myProfile;
        return username == myProfile.username ? myProfile : await this.client.fetchProfileByUsername(username);
    }

    async getVote() {
        const request = await this.client.requester.request(`https://plus.character.ai/chat/character/${this.characterId}/voted/`, {
            method: 'GET',
            includeAuthorization: true
        });

        const response = await Parser.parseJSON(request);
        if (!request.ok) throw new Error(String(response));

        const vote = response["vote"];
        switch (vote) {
            case true: return CharacterVote.Like;
            case false: return CharacterVote.Dislike;
        }

        return CharacterVote.None;
    }

    async setVote(vote: CharacterVote) {
        this.client.throwBecauseNotAvailableYet(CSRF_COOKIE_REQUIRED);
    }

    async hide() {
        this.client.throwBecauseNotAvailableYet(CSRF_COOKIE_REQUIRED);
    }

    async getSimilarCharacters() {
        return this.client.getSimilarCharactersTo(this.characterId);
    }

    async report(reason: ReportCharacterReason, additionalDetails = ""): Promise<string> {
        const request = await this.client.requester.request(`https://neo.character.ai/report/create`, {
            method: 'POST',
            body: Parser.stringify({
                category: reason as string,
                comments: additionalDetails,
                reported_resource_id: this.characterId,
                type: "CHARACTER"
            }),
            includeAuthorization: true,
            contentType: 'application/json'
        });

        const response = await Parser.parseJSON(request);
        if (!request.ok) throw new Error(response);

        return response.report.report_id;
    }

    private async internalEdit(archived: boolean, options?: ICharacterModificationOptions) {
        this.client.throwBecauseNotAvailableYet(WEIRD_INTERNAL_SERVER_ERROR);
    }

    async edit(options?: ICharacterModificationOptions) { return await this.internalEdit(false, options); }
    async delete() { return await this.internalEdit(true); }

    async setPersonaOverride(personaOrId: string | Persona) {
        if (personaOrId instanceof Persona)
            personaOrId = personaOrId.id;

        await this.client.setPersonaOverrideFor(this.characterId, personaOrId);
    }

    async getPersonaOverride(): Promise<Persona | undefined> {
        return await this.client.getPersonaOverrideFor(this.characterId);
    }

    constructor(client: CharacterAI, information: any) {
        super();
        this.client = client;
        ObjectPatcher.patch(this.client, this, information);
    }
}

export { CharacterVisibility };
