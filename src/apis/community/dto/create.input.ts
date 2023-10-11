import { Community } from '@prisma/client';
import { IsString } from 'class-validator';

export class CreateCommunityDTO {
    @IsString()
    category: Community['category'];

    @IsString()
    title: Community['title'];

    @IsString()
    detail: Community['detail'];

    constructor(data: CreateCommunityDTO) {
        this.category = data.category;
        this.title = data.title;
        this.detail = data.detail;
    }
}
