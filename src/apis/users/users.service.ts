import { Provider, User, UserInterest } from '@prisma/client';
import { CustomPrismaClient } from '../../database/prismaConfig';
import {
    IUserCreateDTO,
    IUserFindOneUserByID,
} from './interfaces/user.interface';
import RedisClient from '../../database/redisConfig';
import CustomError from '../../common/error/customError';
import { Service } from 'typedi';
import { FindUserKeywordDTO } from './dto/findUserKeyword.dto';

@Service()
export class UserService {
    constructor(
        private readonly prisma: CustomPrismaClient, //
        private readonly redis: RedisClient,
    ) {}

    async findUserKeyword({
        id,
        path,
        classify,
    }: FindUserKeywordDTO): Promise<string> {
        return await this.prisma.user
            .findUnique({
                where: {
                    id,
                },
                include: {
                    interests: {
                        include: {
                            interest: true,
                            keyword: true,
                        },
                    },
                },
            })
            .then(async (result) => {
                let keywords = result!.interests.map(
                    (interest) =>
                        interest.interest.interest === path &&
                        interest.keyword.keyword,
                );
                if (classify) {
                    keywords = await Promise.all(
                        keywords.map(async (test) => {
                            return test &&
                                (await this.prisma.language.findFirst({
                                    where: { test, classify },
                                }))
                                ? test
                                : false;
                        }),
                    );
                }
                return keywords.filter((el) => el).join(',');
            });
    }

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
                communities: true,
            },
        });
    }

    async isUserByID(id: string): Promise<User> {
        const isUser = await this.prisma.user.findUnique({
            where: {
                id,
            },
            include: {
                communities: true,
            },
        });
        if (!isUser)
            throw new CustomError('id가 일치하는 유저가 없습니다', 400);
        return isUser;
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
            const user = await prisma.user.create({
                data: {
                    ...userData,
                    provider: provider as Provider,
                },
            });
            await Promise.all(
                interests.map(async (el) => {
                    const interest = Object.keys(el)[0];
                    const keywords = Object.values(el)[0];
                    const createdInterest = await prisma.interest.upsert({
                        where: { interest },
                        update: {},
                        create: { interest },
                    });

                    return Promise.all(
                        keywords.map(async (keyword) => {
                            const createdKeyword = await prisma.keyword.upsert({
                                where: { keyword },
                                update: {},
                                create: { keyword },
                            });
                            await prisma.userInterest.create({
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
