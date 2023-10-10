import { Request, Router, Response } from 'express';
import { CrawlingService } from './crawling.service';
import { Container } from 'typedi';
import {
    Path,
    createLinkareerPaths,
    createPaths,
    fidneCrawlingType,
    findeDetailType,
} from '../../common/crawiling/interface';
import { asyncHandler } from '../../middleware/async.handler';
import { PathCrawling } from '../../common/crawiling/path.crwaling';
import AccessGuard from '../../middleware/auth.guard/access.guard';
import { idType } from '../../common/types';

class CrawlingController {
    router = Router();
    path = '/crawling';

    constructor(
        private readonly crawlingService: CrawlingService,
        private readonly pathCrawling: PathCrawling,
    ) {
        this.init();
    }

    init() {
        this.router.get('/finde', asyncHandler(this.findeCrawling.bind(this)));
        this.router.get(
            '/findeDetail',
            asyncHandler(this.findeDetailCrawling.bind(this)),
        );
        this.router.get('/data', asyncHandler(this.crawling.bind(this)));
        this.router.get('/main/:path', asyncHandler(this.bestData.bind(this)));
        this.router.get(
            '/myKeywordCrawling',
            AccessGuard.handle,
            asyncHandler(this.myKeywordCrawling.bind(this)),
        );
    }

    async findeCrawling(req: Request, res: Response) {
        // #swagger.tags = ['Crawling']
        const { ...data } = req.query as fidneCrawlingType;

        res.status(200).json({
            data: await this.crawlingService.findeCrawling({
                ...data,
            }),
        });
    }

    async findeDetailCrawling(req: Request, res: Response) {
        // #swagger.tags = ['Crawling']
        const { path, id } = req.query as findeDetailType;
        res.status(200).json({
            data: await this.crawlingService.findeDetailCrawling({ path, id }),
        });
    }

    async crawling(req: Request, res: Response) {
        const { path, test } = req.query as createPaths;

        const linkareer = ['outside', 'intern', 'competition'];

        const data = linkareer.includes(path)
            ? await this.pathCrawling.linkareerData(
                  path as createLinkareerPaths,
              )
            : path === 'language'
            ? await this.pathCrawling.languageData({ path, test })
            : await this.pathCrawling.QNetData();

        res.status(data.length ? 200 : 400).json({
            data: data.length ? '성공' : '실패',
        });
    }

    async bestData(req: Request, res: Response) {
        // #swagger.tags = ['Crawling']
        const { path } = req.params as Path;
        const result = await this.crawlingService.bsetData({ path });

        res.status(200).json({
            data: result.length ? result : null,
        });
    }

    async myKeywordCrawling(req: Request, res: Response) {
        // #swagger.tags = ['Crawling']
        const { ...data } = req.query as fidneCrawlingType;
        const { id } = req.user as idType;
        const result = await this.crawlingService.myKeywordCrawling({
            ...data,
            id,
        });

        res.status(200).json({
            data: result,
        });
    }
}
export default new CrawlingController(
    Container.get(CrawlingService),
    Container.get(PathCrawling),
);
