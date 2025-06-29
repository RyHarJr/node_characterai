import { CharacterAI } from "../client";
import { CAIImage as CAIImage } from '../utils/image';
import { CAIVoice } from '../voice';
import { Character } from '../character/character';
export declare class PublicProfile {
    characters: Character[];
    username: string;
    private name;
    get displayName(): string;
    set displayName(value: string);
    private num_following;
    get followingCount(): number;
    set followingCount(value: number);
    private num_followers;
    get followersCount(): number;
    set followersCount(value: number);
    avatar: CAIImage;
    subscriptionType: string;
    bio: string | null;
    creatorInformation: any;
    protected client: CharacterAI;
    follow(): Promise<void>;
    unfollow(): Promise<void>;
    getFollowers(page?: number): Promise<void>;
    getFollowing(page?: number): Promise<void>;
    protected loadFromInformation(information: any): void;
    protected loadCharacters(characters: any[]): void;
    getVoices(): Promise<CAIVoice[]>;
    refreshProfile(): Promise<void>;
    constructor(client: CharacterAI, options?: any);
}
//# sourceMappingURL=publicProfile.d.ts.map