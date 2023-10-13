import {
    Provider,
    User,
    UserInterest,
    PrismaClient,
    Prisma,
} from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { CustomPrismaClient } from '../../database/prismaConfig';
import {
    IUserCreateDTO,
    IUserCreateThermometer,
    IUserFindOneUserByID,
    IUserUpdateDTO,
} from './interfaces/user.interface';
import RedisClient from '../../database/redisConfig';
import CustomError from '../../common/error/customError';
import { Service } from 'typedi';
import { FindUserKeywordDTO } from './dto/findUserKeyword.dto';
import { ScrappingDTO } from './dto/scrapping.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { Path } from '../../common/crawiling/interface';
import { ElasitcClient } from '../../database/elasticConfig';

@Service()
export class UserService {
    constructor(
        private readonly prisma: CustomPrismaClient, //
        private readonly redis: RedisClient,
        private readonly elastic: ElasitcClient,
    ) {}

    async findUserKeyword({
        id,
        path,
        classify,
    }: FindUserKeywordDTO): Promise<string> {
        const result = await this.prisma.user.findUnique({
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
        });

        let keywords: string[] = [];

        result!.interests.forEach(
            (el) =>
                el.interest.interest === path &&
                keywords.push(el.keyword.keyword),
        );

        if (classify) {
            keywords = await Promise.all(
                keywords.map(async (test) => {
                    return this.elastic
                        .search({
                            index: path,
                            _source: 'test',
                            size: 1,
                            body: {
                                query: {
                                    bool: {
                                        must: [
                                            { match: { classify } },
                                            { match: { test } },
                                        ],
                                    },
                                },
                            },
                        })
                        .then((data) => {
                            const hits = data.body.hits.hits[0];
                            return hits && hits._source.test;
                        });
                }),
            );
        }

        return keywords.filter((el) => el).join(' ');
    }

    saveInterestKeyword(
        prisma: Omit<
            PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
            | '$connect'
            | '$disconnect'
            | '$on'
            | '$transaction'
            | '$use'
            | '$extends'
        >,
        interests: object[],
        id: string,
    ) {
        return Promise.all(
            interests.map(async (el) => {
                const [interest, keywords] = Object.entries(el)[0];
                const createdInterest = await prisma.interest.upsert({
                    where: { interest },
                    update: {},
                    create: { interest },
                });

                return Promise.all(
                    keywords.map(async (keyword: string) => {
                        const createdKeyword = await prisma.keyword.upsert({
                            where: { keyword },
                            update: {},
                            create: { keyword },
                        });
                        await prisma.userInterest.create({
                            data: {
                                userId: id,
                                interestId: createdInterest.id,
                                keywordId: createdKeyword.id,
                            },
                        });
                    }),
                );
            }),
        );
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
                interests: true,
            },
        });
        if (!isUser) {
            throw new CustomError('id가 일치하는 유저가 없습니다', 400);
        }

        return isUser;
    }

    async isNickname(id: string, nickname: string): Promise<void> {
        const isNickname = await this.prisma.user.findUnique({
            where: {
                nickname,
            },
        });
        if (isNickname)
            throw new CustomError('이미 존재하는 닉네임입니다', 400);
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

    async createUser({ createDTO, qqq }: IUserCreateDTO): Promise<string> {
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

            await this.saveInterestKeyword(prisma, interests, user.id);
            this.redis.del(userData.email);
            return user.id;
        });
    }

    async createThermometer({
        path,
        pathId,
        id,
    }: IUserCreateThermometer): Promise<User> {
        console.log(path, pathId, id, '@@@@');

        const obj: { [key: string]: () => { id: string; column: string } } = {
            outside: () => ({ id: 'outsideId', column: 'outsides' }),
            intern: () => ({ id: 'internId', column: 'interns' }),
            competition: () => ({
                id: 'competitionId',
                column: 'competitions',
            }),
            language: () => ({ id: 'languageId', column: 'languages' }),
            qnet: () => ({ id: 'qNetId', column: 'qnets' }),
        };

        return this.prisma.user.update({
            where: { id },
            data: {
                [obj[path]().column]: {
                    create: {
                        [obj[path]().id]: pathId,
                    },
                },
            },
        });
    }
}
