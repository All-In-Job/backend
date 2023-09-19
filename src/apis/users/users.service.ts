import { Provider, User } from '@prisma/client';
import { CustomPrismaClient } from '../../database/prismaConfig';
import {
    IUserCreateDTO,
    IUserFindOneUserByID,
} from './interfaces/user.interface';
import RedisClient from '../../database/redisConfig';
import CustomError from '../../common/error/customError';
import { Service } from 'typedi';

@Service()
export class UserService {
    constructor(
        private readonly prisma: CustomPrismaClient, //
        private readonly redis: RedisClient,
    ) {}

    findOneUserByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: {
                email,
            },
            include: {
                interests: {
                    include: {
                        interest: true,
                        keyword: true,
                    },
                },
            },
        });
    }

    async isUserByID(id: string): Promise<boolean> {
        return (await this.prisma.user.findUnique({
            where: {
                id,
            },
        }))
            ? true
            : false;
    }

    findOneUserByID({
        name,
        phone,
    }: IUserFindOneUserByID): Promise<{ email: string; provider: string }[]> {
        return this.prisma.user.findMany({
            where: {
                name,
                phone,
            },
            select: {
                email: true,
                provider: true,
            },
        });
    }

    async createUser({ createDTO }: IUserCreateDTO): Promise<string> {
        const { interests, ...userData } = createDTO;
        const provider = await this.redis.get(userData.email);

        if (!provider)
            throw new CustomError('로그인한 이메일과 일치하지 않습니다.', 400);

        return await this.prisma.$transaction(async (prisma) => {
            const user = await this.prisma.user.create({
                data: {
                    ...userData,
                    provider: provider as Provider,
                },
            });
            await Promise.all(
                interests.map(async (el) => {
                    const interest = Object.keys(el)[0];
                    const keywords = Object.values(el)[0];
                    const createdInterest = await this.prisma.interest.upsert({
                        where: { interest },
                        update: {},
                        create: { interest },
                    });

                    return Promise.all(
                        keywords.map(async (keyword) => {
                            const createdKeyword =
                                await this.prisma.keyword.upsert({
                                    where: { keyword },
                                    update: {},
                                    create: { keyword },
                                });
                            await this.prisma.userInterest.create({
                                data: {
                                    userId: user.id,
                                    interestId: createdInterest.id,
                                    keywordId: createdKeyword.id,
                                },
                            });
                        }),
                    );
                }),
            );
            this.redis.del(userData.email);
            return user.id;
        });
    }
}
