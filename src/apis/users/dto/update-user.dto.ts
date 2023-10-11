import {
    IsEmail,
    IsString,
    Length,
    Matches,
    ValidateIf,
} from 'class-validator';

export interface Interests {
    [key: string]: string[];
}

export class UpdateUserDTO {
    @IsString()
    @ValidateIf((_, value) => value)
    profileImage?: string;

    @Length(2, 10)
    @Matches(/^[a-zA-Z가-힣]+$/)
    @ValidateIf((_, value) => value)
    nickname?: string;

    @ValidateIf((_, value) => value)
    interests?: Interests[];

    constructor(data: UpdateUserDTO) {
        this.profileImage = data.profileImage;
        this.nickname = data.nickname;
        this.interests = data.interests;
    }
}
