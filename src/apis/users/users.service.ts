import { User } from '@prisma/client';
import prisma from '../../database/prismaConfig';
import { IUserCreateDTO } from './interfaces/user-service.interface';

export class UserService {
    // 유저 찾기
    async findUser(email: string): Promise<User | null> {
        const result = await prisma.user.findUnique({
            where: {
                // todo prisma 적용이 안된것
                email,
            },
        });
        console.log(result);
        return result;
    }

    // 회원가입하기
    createUser({ createDTO }: IUserCreateDTO): Promise<User> {
        return prisma.user.create({
            data: {
                ...createDTO,
            },
        });
    }
}
