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
        const { path, page, classify, count, ..._data } = data;

        const datas: { [key: string]: string } = { ..._data };
        const must: object[] = [];
        for (const key in _data) {
            const value = datas[key];
            if (key === 'scale') {
                const [start, end] = value.split(',');
                const scaleKeyword = !end
                    ? { gte: +start }
                    : { gte: +start || 0, lte: +end };
                must.push({ range: { [key]: scaleKeyword } });
            } else {
                must.push({
                    match: { [key]: value.replace(',', ' ') },
                });
            }
        }

        return this.elastic
            .search({
                index: `${path}*`,
                _source_excludes: ['detail'],
                body: {
                    query: {
                        ...(must.length
                            ? {
                                  bool: { must },
                              }
                            : { match_all: {} }),
                    },
                    size: 12,
                    from: (+page - 1 || 0) * 12,
                },
            })
            .then((el) =>
                count
                    ? el.body.hits.total.value
                    : el.body.hits.hits.length
                    ? el.body.hits.hits.map((el: any) => ({
                          id: el._id,
                          ...el._source,
                      }))
                    : null,
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
    }: findeDetailType): Promise<any | null> {
        // 없는 id로 조회할시 error, status 400
        // ignore : [400]
        // 400일때 무시한다.
        // 결과값에 body.error가 표시
        // 정상작동일때는 error가 없음
        // language는 상세조회가 없지 않나? 있으면 로직 추가 예정

        return await this.elastic
            .update(
                {
                    index: path,
                    id,
                    body: {
                        script: {
                            source: 'ctx._source.view++',
                        },
                        _source: true,
                    },
                },
                { ignore: [404] },
            )
            .then((el) =>
                el.body.error ? el.meta.context : el.body.get._source,
            );
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
        scale,
    }: {
        data: T;
        path: createLinkareerPaths;
        month: number;
        scale?: number | undefined;
    }): Promise<boolean> {
        await this.elastic.index({
            index: path,
            body: {
                ...data,
                ...(scale && { scale }),
                ...(month && { month }),
            },
        });

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

    async bsetData({ path }: Path | { path: 'community' }): Promise<any> {
        if (path === 'community') {
            return this.prisma.community.findMany({
                orderBy: {
                    view: 'desc',
                },
                include: {
                    user: true,
                },
                take: 12,
            });
        }

        return this.elastic
            .search({
                index: path,
                _source_excludes: ['detail'],
                body: {
                    sort: { view: { order: 'desc' } },
                    query: {
                        match_all: {},
                    },
                },
                size: 12,
            })
            .then((el) =>
                el.body.hits.hits.map((el: any) => ({
                    id: el._id,
                    ...el._source,
                })),
            );
    }
}
