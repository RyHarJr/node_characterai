import { CharacterAI } from "../client";
import Parser from "../parser";
// import { CAIImage } from "../utils/image"; // Dihapus
import { PublicProfile } from "./publicProfile";
import { getterProperty, hiddenProperty } from "../utils/specable";
import { Character, CharacterVisibility } from "../character/character";
// import { CAIVoice, VoiceGender, VoiceVisibility } from "../voice"; // Dihapus
import { Persona } from "./persona";
import { ICharacterCreationExtraOptions } from "../character/characterEnums";
import { createIdentifier } from "../utils/identifier";

export interface IProfileModification {
  username?: string;
  displayName?: string;
  bio?: string;
}

export class PrivateProfile extends PublicProfile {
  public characters: Character[] = [];

  @hiddenProperty
  private is_human = true;
  @getterProperty
  public get isHuman() { return this.is_human; }
  public set isHuman(value) { this.is_human = value; }

  public email = "";

  @hiddenProperty
  private needs_to_aknowledge_policy = true;
  @getterProperty
  public get needsToAknowledgePolicy() { return this.needs_to_aknowledge_policy; }
  public set needsToAknowledgePolicy(value) { this.needs_to_aknowledge_policy = value; }

  @hiddenProperty
  private suspended_until: any;
  @getterProperty
  public get suspendedUntil() { return this.suspended_until; }
  public set suspendedUntil(value) { this.suspended_until = value; }

  @hiddenProperty
  private hidden_characters: Character[] = [];
  @getterProperty
  public get hiddenCharacters() { return this.hidden_characters; }
  public set hiddenCharacters(value) { this.hidden_characters = value; }

  @hiddenProperty
  private blocked_users: any[] = [];
  @getterProperty
  public get blockedUsers() { return this.blocked_users; }
  public set blockedUsers(value) { this.blocked_users = value; }

  @hiddenProperty
  private interests?: any[] | null = null;

  @hiddenProperty
  private id = 0;
  @getterProperty
  public get userId() { return this.id; }
  public set userId(value) { this.id = value; }

  async edit(options?: IProfileModification) {
    const request = await this.client.requester.request("https://plus.character.ai/chat/user/update/", {
      method: 'POST',
      includeAuthorization: true,
      body: Parser.stringify({
        username: options?.username ?? this.username,
        name: options?.displayName ?? this.displayName,
        bio: options?.bio ?? this.bio
      }),
      contentType: 'application/json'
    });

    const response = await Parser.parseJSON(request);
    if (!request.ok) throw new Error(response.status);
  }

  async createCharacter(
    name: string,
    greeting: string,
    visbility: CharacterVisibility,
    options?: ICharacterCreationExtraOptions
  ): Promise<Character> {
    const request = await this.client.requester.request("https://plus.character.ai/chat/character/create/", {
      method: 'POST',
      includeAuthorization: true,
      body: Parser.stringify({
        title: options?.tagline ?? "",
        name,
        identifier: createIdentifier(),
        categories: [],
        visbility,
        copyable: options?.keepCharacterDefintionPrivate ?? false,
        allow_dynamic_greeting: options?.allowDynamicGreeting ?? false,
        description: options?.description ?? "",
        greeting,
        definition: options?.definition ?? "",
        avatar_rel_path: '',
        img_gen_enabled: false,
        base_img_prompt: '',
        strip_img_prompt_from_msg: false,
        default_voice_id: ''
      }),
      contentType: 'application/json'
    });

    const response = await Parser.parseJSON(request);
    if (!request.ok) throw new Error(response.status);

    return new Character(this.client, response.character);
  }

  async refreshProfile() {
    const request = await this.client.requester.request("https://plus.character.ai/chat/user/", {
      method: 'GET',
      includeAuthorization: true
    });
    const response = await Parser.parseJSON(request);

    if (!request.ok) throw new Error(response);
    const { user } = response.user;

    this.loadFromInformation(user);
    this.loadFromInformation(user.user);
  }

  async fetchPersona(personaId: string): Promise<Persona | undefined> {
    const personas = await this.fetchPersonas();
    return personas.find((persona: Persona) => persona.externalId == personaId);
  }

  async getDefaultPersona(): Promise<Persona | undefined> {
    const settings = await this.client.fetchSettings();
    return await settings.fetchDefaultPersona();
  }

  async setDefaultPersona(personaOrId: Persona | string) {
    let defaultPersonaId = personaOrId;
    if (personaOrId instanceof Persona)
      defaultPersonaId = personaOrId.externalId;

    const request = await this.client.requester.request("https://neo.character.ai/recommendation/v1/category", {
      method: 'POST',
      contentType: 'application/json',
      includeAuthorization: true,
      body: Parser.stringify({ default_persona_id: defaultPersonaId })
    });

    const response = await Parser.parseJSON(request);
    if (!request.ok) throw new Error(String(response));
    if (!response.success) throw new Error("Could not set default persona");
  }

  async createPersona(
    name: string,
    definition: string,
    makeDefaultForChats: boolean
  ) {
    const request = await this.client.requester.request(`https://plus.character.ai/chat/persona/create/`, {
      method: 'POST',
      contentType: 'application/json',
      body: Parser.stringify({
        title: name,
        name,
        identifier: createIdentifier(),
        categories: [],
        visbility: "PRIVATE",
        copyable: false,
        description: "This is my persona.",
        definition,
        greeting: "Hello! This is my persona",
        avatar_rel_path: '',
        img_gen_enabled: false,
        base_img_prompt: '',
        avatar_file_name: '',
        voice_id: '',
        strip_img_prompt_from_msg: false
      }),
      includeAuthorization: true
    });

    const response = await Parser.parseJSON(request);
    if (!request.ok) throw new Error(String(response));

    const persona = new Persona(this.client, response.persona);
    if (makeDefaultForChats) await this.setDefaultPersona(persona.externalId);

    return persona;
  }

  async fetchPersonas() {
    const request = await this.client.requester.request("https://plus.character.ai/chat/personas/?force_refresh=0", {
      method: 'GET',
      includeAuthorization: true
    });
    const response = await Parser.parseJSON(request);
    if (!request.ok) throw new Error(response);

    return response.personas.map((p: any) => new Persona(this.client, p));
  }

  async removePersona(personaId: string) {
    const persona = await this.fetchPersona(personaId);
    await persona?.remove();
  }

  async getLikedCharacters() {
    return this.client.getLikedCharacters();
  }

  constructor(client: CharacterAI) {
    super(client);
    // Avatar & Voice sudah dihapus
  }
}
