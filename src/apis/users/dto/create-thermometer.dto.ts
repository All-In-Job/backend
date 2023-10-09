import { IsString } from 'class-validator';
import { paths } from '../../../common/crawiling/interface';

export class CreateThermometerDTO {
    @IsString()
    path: paths['path'];

    @IsString()
    pathId: string;

    constructor(data: CreateThermometerDTO) {
        this.path = data.path;
        this.pathId = data.pathId;
    }
}
