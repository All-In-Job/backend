import { Container } from 'typedi';
import { CommunityService } from './community.service';
import { Request, Response, Router } from 'express';
import { asyncHandler } from '../../middleware/async.handler';
import accessGuard from '../../middleware/auth.guard/access.guard';
import { idType } from '../../common/types';
import Validate from '../../common/validator/validateDTO';
import { FindManyCommunityDTO } from './dto/findMany.community';

class CommunityController {
    router = Router();
    path = '/community';

    constructor(
        private readonly communityService: CommunityService, //
    ) {
        this.init();
    }
    init() {
        this.router.post(
            '/create',
            Validate.createCommunity,
            accessGuard.handle,
            asyncHandler(this.create.bind(this)),
        );
        this.router.get(
            '/',
            Validate.findManyCommunity,
            asyncHandler(this.fidneMany.bind(this)),
        );
        this.router.get(
            '/:id',
            Validate.findOneCommunity,
            asyncHandler(this.findeOne.bind(this)),
        );
        this.router.patch(
            '/like/:id',
            Validate.toggleLikeCommunity,
            accessGuard.handle,
            asyncHandler(this.toggleLike.bind(this)),
        );

        this.router.post(
            '/comment',
            Validate.createCommunityComment,
            accessGuard.handle,
            asyncHandler(this.createComment.bind(this)),
        );

        this.router.patch(
            '/comment/like/:id',
            Validate.commentLikeCommunity,
            accessGuard.handle,
            asyncHandler(this.commentLike.bind(this)),
        );
    }

    async create(req: Request, res: Response) {
        // #swagger.tags = ['Community']
        const { id } = req.user as idType;
        const createCommunity = req.body;

        res.status(200).json({
            data: await this.communityService.create({
                id,
                createCommunity,
            }),
        });
    }

    async fidneMany(req: Request, res: Response) {
        // #swagger.tags = ['Community']

        const data = await this.communityService.findeMany({
            ...(req.query as FindManyCommunityDTO),
        });

        res.status(200).json({
            data: data.length ? data : null,
        });
    }

    async findeOne(req: Request, res: Response) {
        // #swagger.tags = ['Community']
        const { id } = req.params as idType;

        res.status(200).json({
            data: await this.communityService.findOne({ id }),
        });
    }

    async toggleLike(req: Request, res: Response) {
        // #swagger.tags = ['Community']
        const { id: userId } = req.user as idType;
        const { id: communityId } = req.params as idType;

        const toggleLikes = await this.communityService.toggleLike({
            userId,
            communityId,
        });

        res.status(200).json({
            data: toggleLikes.length
                ? { count: toggleLikes.length, toggleLikes }
                : null,
        });
    }

    async createComment(req: Request, res: Response) {
        // #swagger.tags = ['Community']
        const { id: userId } = req.user as idType;
        const { comment, id: communityId } = req.body;

        const comments = await this.communityService.createComment({
            userId,
            communityId,
            comment,
        });

        res.status(200).json({
            data: comments.length ? { count: comments.length, comments } : null,
        });
    }

    async commentLike(req: Request, res: Response) {
        // #swagger.tags = ['Community']
        const { id: userId } = req.user as idType;
        const { id: commentId } = req.params as idType;

        const commentLike = await this.communityService.commentLike({
            userId,
            commentId,
        });

        res.status(200).json({
            data: commentLike.length
                ? { count: commentLike.length, commentLike }
                : null,
        });
    }
}

export default new CommunityController(Container.get(CommunityService));
