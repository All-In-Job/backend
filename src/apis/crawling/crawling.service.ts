import { Language, QNet, SubCategory } from '@prisma/client';
import {
    CompetitionType,
    InternType,
    OutsideType,
    Path,
    createCrawiling,
    createLinkareerPaths,
    createQNet,
    findCrawling,
    findeDetail,
    findeDetailType,
    languagePath,
    paths,
} from '../../common/crawiling/interface';
import { CustomPrismaClient } from '../../database/prismaConfig';
import { Service } from 'typedi';
import { UserService } from '../users/users.service';
import { ElasitcClient } from '../../database/elasticConfig';

@Service()
export class CrawlingService {
    constructor(
        private readonly prisma: CustomPrismaClient, //
        private readonly elastic: ElasitcClient,
        private readonly userService: UserService,
    ) {}

    async findeCrawling({ ...data }: paths): Promise<any> {
        const { path, page, classify, ..._data } = data;

        const datas: { [key: string]: string } = { ..._data };
        const keywords: { [key: string]: object[] } = { must: [] };
        for (const key in _data) {
            const value = datas[key];
            if (key === 'scale') {
                const [start, end] = value.split(',');
                const scaleKeyword = !end
                    ? { gte: start }
                    : { gte: start || 0, lte: end || 0 };

                keywords.must.push({ range: { [key]: scaleKeyword } });
            } else if (classify) {
                keywords.must.push(
                    { term: { classify } },
                    {
                        bool: {
                            should: [
                                {
                                    match: {
                                        [key]: value.replace(',', ' '),
                                    },
                                },
                            ],
                        },
                    },
                );
            } else {
                keywords.must.push({
                    bool: {
                        should: [{ match: { [key]: value.replace(',', ' ') } }],
                    },
                });
            }
        }
        return this.elastic
            .search({
                index: path,
                _source_excludes: ['detail'],
                body: {
                    query: {
                        ...(Object.keys(keywords)
                            ? {
                                  bool: keywords,
                              }
                            : { match_all: {} }),
                    },
                    ...(page
                        ? { size: 12, from: +page * 12 }
                        : { size: 10000 }),
                },
            })
            .then((el) =>
                el.body.hits.hits.map((el: any) => ({
                    ...data,
                    id: el._id,
                    ...el._source,
                })),
            );
    }

    async myKeywordCrawling({ ...data }: paths): Promise<findCrawling> {
        const userKeyword = await this.userService.findUserKeyword({
            ...data,
        });
        const obj = {
            competition: 'interests',
            outside: 'field',
            intern: 'enterprise',
            qnet: 'mainCategory',
            language: 'test',
        };

        const params = {
            ...data,
            [obj[data.path]]: userKeyword,
        };

        return await this.findeCrawling(params);
    }

    async findeDetailCrawling({
        path,
        id,
    }: findeDetailType): Promise<findeDetail | null> {
        const obj = {
            outside: () =>
                this.prisma.outside.update({
                    where: { id },
                    data: { view: { increment: 1 } },
                }),
            intern: () =>
                this.prisma.intern.update({
                    where: { id },
                    data: { view: { increment: 1 } },
                }),
            competition: () =>
                this.prisma.competition.update({
                    where: { id },
                    data: { view: { increment: 1 } },
                }),
            language: () => this.prisma.language.findUnique({ where: { id } }),
            qnet: () =>
                this.prisma.qNet.update({
                    where: { id },
                    data: { view: { increment: 1 } },
                    include: {
                        examSchedules: true,
                    },
                }),
        };

        return (obj[path] || obj['language'])();
    }

    async createLanguageData({
        classify,
        test,
        homePage,
        dataObj,
    }: languagePath): Promise<boolean> {
        await this.elastic.index({
            index: 'language',
            body: {
                test,
                classify,
                homePage,
                ...dataObj,
            },
        });
        return true;
    }

    async createLinkareerData<T extends object>({
        data,
        path,
        month,
    }: {
        data: T;
        path: createLinkareerPaths;
        month: number;
    }): Promise<boolean> {
        const qqq = await this.elastic.index({
            index: path,
            body: {
                ...data,
                ...(month && { month }),
            },
        });
        console.log(qqq);
        return true;
    }

    async createQNetData({ data, categoryObj }: createQNet): Promise<boolean> {
        await this.elastic.index({
            index: 'qnet',
            body: {
                ...data,
                ...categoryObj,
            },
        });

        return true;
    }

    async bsetData({ path }: Path): Promise<findCrawling> {
        const dataDB = {
            outside: () =>
                this.prisma.outside.findMany({
                    select: {
                        id: true,
                        title: true,
                        view: true,
                        enterprise: true,
                        Dday: true,
                        mainImage: true,
                        applicationPeriod: true,
                    },
                    orderBy: { view: 'desc' },
                    take: 12,
                }),
            competition: () =>
                this.prisma.competition.findMany({
                    select: {
                        id: true,
                        title: true,
                        view: true,
                        enterprise: true,
                        Dday: true,
                        mainImage: true,
                        applicationPeriod: true,
                    },
                    orderBy: {
                        view: 'desc',
                    },
                    take: 12,
                }),
            intern: () =>
                this.prisma.intern.findMany({
                    select: {
                        id: true,
                        title: true,
                        view: true,
                        enterprise: true,
                        Dday: true,
                        mainImage: true,
                        applicationPeriod: true,
                        region: true,
                    },
                    orderBy: {
                        view: 'desc',
                    },
                    take: 12,
                }),
            qnet: () =>
                this.prisma.qNet.findMany({
                    select: {
                        jmNm: true,
                        engJmNm: true,
                        instiNm: true,
                        implNm: true,
                        view: true,
                        examSchedules: {
                            skip: 0,
                            take: 1,
                            orderBy: {
                                resultDay: 'desc',
                            },
                        },
                    },
                    take: 12,
                }),
            community: () =>
                this.prisma.community.findMany({
                    orderBy: {
                        view: 'desc',
                    },
                    include: {
                        user: true,
                    },
                    take: 12,
                }),
        };

        return dataDB[path]();
    }
}
