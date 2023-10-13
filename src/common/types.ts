import { Community, Provider, User } from '@prisma/client';
import { CreateUserDTO } from '../apis/users/dto/create-user.dto';

export type email = {
    email: CreateUserDTO['email'];
};

export type idType = {
    id: string;
};

export type phoneType = {
    phone: CreateUserDTO['phone'];
};

export type pathIdtype = {
    path: string;
    scrapId: string;
};

export type pathType = {
    path: string;
};

export type categoryType = {
    category: string;
};

export type classifyType = {
    classify: string;
};

export type findOneUserByIDType = {
    name: CreateUserDTO['name'];
    phone: CreateUserDTO['phone'];
};

export type authorization = {
    authorization: string;
};

export type cookie = {
    cookie: string;
};

export type emailProviderType = {
    email: CreateUserDTO['email'];
    provider: Provider;
};
