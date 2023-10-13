import { idType } from '../../../common/types';
import { CreateThermometerDTO } from '../dto/create-thermometer.dto';
import { CreateUserDTO } from '../dto/create-user.dto';

export interface IUserCreateDTO {
    createDTO: CreateUserDTO;
    qqq?: boolean;
}

export interface IUserFindOneUserByID {
    name: CreateUserDTO['name'];
    phone: CreateUserDTO['phone'];
}

export interface IUserCreateThermometer {
    id: idType['id'];
    path: CreateThermometerDTO['path'];
    pathId: CreateThermometerDTO['pathId'];
}

export interface IUserUpdateDTO {
    profileImage?: CreateUserDTO['profileImage'];
    nickname?: CreateUserDTO['nickname'];
    interests?: CreateUserDTO['interests'];
}
