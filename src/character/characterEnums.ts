export enum CharacterVote {
    None,
    Like,
    Dislike
};

export enum CharacterVisibility {
    Private = "PRIVATE",
    Unlisted = "UNLITSTED",
    Public = "PUBLIC",
};

export interface ICharacterCreationExtraOptions {
    tagline?: string;
    description?: string;

    definition?: string;
    keepCharacterDefintionPrivate?: boolean;

    allowDynamicGreeting?: boolean;
}

export interface ICharacterModificationOptions {
    newName?: string;
    newGreeting?: string;
    newVisbility?: CharacterVisibility;

    newTagline?: string;
    newDescription?: string;

    newDefinition?: string;
    keepCharacterDefintionPrivate?: boolean;
    enableDynamicGreeting?: boolean;
}
