import { CharacterAI, CheckAndThrow } from "../client";
import Parser from "../parser";
import ObjectPatcher from "../utils/patcher";
import { getterProperty, hiddenProperty, Specable } from "../utils/specable";

export interface IPersonaEditOptions {
    name?: string;
    definition?: string;
}

export class Persona extends Specable {
    @hiddenProperty
    private client: CharacterAI;

    @hiddenProperty
    private external_id = "";
    @getterProperty
    public get externalId() { return this.external_id; }

    @getterProperty
    public get id() { return this.external_id; }

    @hiddenProperty
    private title = "";

    @hiddenProperty
    private name = "";

    @hiddenProperty
    private visibility: string = "PRIVATE";

    @hiddenProperty
    private copyable = false;

    @hiddenProperty
    private greeting = "";

    @hiddenProperty
    private description = "";

    @hiddenProperty
    private identifier = "";

    // avatar removed
    @hiddenProperty
    public avatar = null;

    @hiddenProperty
    private songs = [];

    @hiddenProperty
    private img_gen_enabled = false;
    @getterProperty
    public get imageGenerationEnabled() { return false; }

    @getterProperty
    public get baseImagePrompt() { return ""; }

    @hiddenProperty
    private base_img_prompt = "";
    @hiddenProperty
    private img_prompt_regex = "";
    @hiddenProperty
    private strip_img_prompt_from_msg = "";

    public definition = "";

    @hiddenProperty
    private default_voice_id = "";
    public get defaultVoiceId() { return this.default_voice_id; }

    @hiddenProperty
    private starter_prompts = [];

    @hiddenProperty
    private comments_enabled = false;

    @hiddenProperty
    private categories = [];

    @hiddenProperty
    private user__id = 0;

    @hiddenProperty
    private user__username: string | undefined = undefined;
    @hiddenProperty
    private userusername: string | undefined = undefined;
    @getterProperty
    public get authorUsername() { return this.user__username ?? this.userusername; }

    @hiddenProperty
    private participantname: string | undefined = undefined;
    @hiddenProperty
    private participant__name: string | undefined = undefined;
    @getterProperty
    public get participantName() { return this.participantname ?? this.participant__name; }

    @hiddenProperty
    private participantuserusername: string | undefined = undefined;

    @hiddenProperty
    private is_persona = true;

    @hiddenProperty
    private participant__num_interactions = 0;
    @hiddenProperty
    private num_interactions = 0;
    @getterProperty
    public get interactionCount() { return this.participant__num_interactions ?? this.num_interactions; }

    @hiddenProperty
    private background = "";

    private async internalEdit(options: IPersonaEditOptions, archived: boolean | undefined = undefined) {
        const { external_id, title, greeting, description, visibility, copyable, default_voice_id, is_persona } = this;

        const name = options.name ?? this.participantName;
        const userId = this.user__id ?? 1;
        const definition = options.definition ?? this.definition;

        const request = await this.client.requester.request(`https://plus.character.ai/chat/persona/update/`, {
            method: 'POST',
            contentType: 'application/json',
            body: Parser.stringify({
                archived,
                external_id,
                title,
                greeting,
                description,
                definition,
                avatar_file_name: '',
                visibility,
                copyable,
                participantname: name,
                participantnum_interactions: 0,
                userid: userId,
                userusername: this.authorUsername,
                img_gen_enabled: false,
                default_voice_id,
                is_persona,
                name,
                avatar_rel_path: '', // remove image support
                enabled: true
            }),
            includeAuthorization: true
        });

        const response = await Parser.parseJSON(request);
        if (!request.ok) throw new Error(String(response));

        ObjectPatcher.patch(this.client, this, response.persona);
    }

    async edit(options: IPersonaEditOptions) {
        return await this.internalEdit(options);
    }

    async makeDefault() {
        return await this.client.myProfile.setDefaultPersona(this.externalId);
    }

    async remove() {
        return await this.internalEdit({}, true);
    }

    constructor(client: CharacterAI, information: any) {
        super();
        this.client = client;
        ObjectPatcher.patch(client, this, information);
    }
}
