import { IsString } from 'class-validator';
import { User } from '@prisma/client';

export class ScrappingDTO {
    @IsString()
    id: User['id'];

    @IsString()
    path: string;

    @IsString()
    scrapId: string;

    constructor(data: ScrappingDTO) {
        this.id = data.id;
        this.path = data.path;
        this.scrapId = data.scrapId;
    }
}
