import { IsString, ValidateIf } from 'class-validator';
import { Community, User } from '@prisma/client';

export class FindManyCommunityDTO {
    @IsString()
    @ValidateIf((_, value) => value)
    category?: Community['category'];

    @IsString()
    @ValidateIf((_, value) => value)
    title?: Community['title'];

    @IsString()
    @ValidateIf((_, value) => value)
    nickName?: User['nickname'];

    @IsString()
    @ValidateIf((_, value) => value)
    content?: string;

    constructor(data: FindManyCommunityDTO) {
        this.category = data.category;
        this.title = data.title;
        this.nickName = data.nickName;
        this.content = data.content;
    }
}
