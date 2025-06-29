import { Character } from "./character";
export declare enum CharacterTags {
    None = "",
    Anime = "0",
    Artist = "1",
    Boss = "2",
    Bully = "3",
    Coach = "4",
    Unknown5 = "5",
    Designer = "6",
    Family = "7",
    Famous = "8",
    Gaming = "9",
    Hero = "10",
    Kpop = "11",
    Lifestyle = "12",
    Mafia = "13",
    Maid = "14",
    Music = "15",
    Police = "16",
    Professor = "17",
    RPG = "18",
    Romance = "19",
    Solider = "20",
    Student = "21",
    Teacher = "22",
    Vampire = "23"
}
export declare class SearchCharacter extends Character {
    private document_id;
    private score?;
    private search_score?;
    get searchScore(): number;
    priority: number;
    private tag_id;
    get tagId(): CharacterTags;
    tag: string;
    private created_at;
    get createdAt(): number;
    private updated_at;
    get updatedAt(): number;
    private _distance;
    get distance(): any;
}
//# sourceMappingURL=searchCharacter.d.ts.map