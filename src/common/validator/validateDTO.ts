import { validate } from 'class-validator';
import CustomError from '../error/customError';
import { NextFunction, Request, Response } from 'express';
import { CreateCommunityDTO } from '../../apis/community/dto/create.input';
import { asyncHandler } from '../../middleware/async.handler';
import { FindOneCommunityDTO } from '../../apis/community/dto/findOne.community';
import { FindManyCommunityDTO } from '../../apis/community/dto/findMany.community';
import { categoryType, idType, pathType } from '../types';
import { ToggleLikeCommunityDTO } from '../../apis/community/dto/create.community.toggleLike';
import { CreateCommunityCommentDTO } from '../../apis/community/dto/create.comment.input';
import { CommentLikeCommunityDTO } from '../../apis/community/dto/create.comment.like.input';

class Validate {
    constructor() {
        this.createCommunity = asyncHandler(this.createCommunity.bind(this));
        this.findOneCommunity = asyncHandler(this.findOneCommunity.bind(this));
        this.findManyCommunity = asyncHandler(
            this.findManyCommunity.bind(this),
        );
        this.toggleLikeCommunity = asyncHandler(
            this.toggleLikeCommunity.bind(this),
        );
        this.createCommunityComment = asyncHandler(
            this.createCommunityComment.bind(this),
        );
        this.commentLikeCommunity = asyncHandler(
            this.commentLikeCommunity.bind(this),
        );
    }

    async errors<T extends object>(dto: T) {
        const errors = await validate(dto);

        if (errors.length > 0) {
            const errorMessage = errors.map((error) => {
                const temp =
                    error.constraints && Object.values(error.constraints);
                return `${error.property} : ${temp}`;
            });

            throw new CustomError(errorMessage, 400);
        }
    }

    async createCommunity(req: Request, _: Response, next: NextFunction) {
        await this.errors(new CreateCommunityDTO(req.body));

        next();
    }

    async findManyCommunity(req: Request, _: Response, next: NextFunction) {
        await this.errors(new FindManyCommunityDTO(req.query as categoryType));

        next();
    }

    async findOneCommunity(req: Request, _: Response, next: NextFunction) {
        await this.errors(new FindOneCommunityDTO(req.params as idType));

        next();
    }

    async toggleLikeCommunity(req: Request, _: Response, next: NextFunction) {
        const { id: communityId } = req.params as idType;
        await this.errors(new ToggleLikeCommunityDTO({ communityId }));

        next();
    }
    async createCommunityComment(
        req: Request,
        _: Response,
        next: NextFunction,
    ) {
        const { comment, id: communityId } = req.body;
        await this.errors(
            new CreateCommunityCommentDTO({ communityId, comment }),
        );

        next();
    }

    async commentLikeCommunity(req: Request, _: Response, next: NextFunction) {
        const { id: commentId } = req.params as idType;
        await this.errors(new CommentLikeCommunityDTO({ commentId }));

        next();
    }
}
export default new Validate();

export const validateDTO = async <T extends object>(dto: T) => {
    const errors = await validate(dto);

    if (errors.length > 0) {
        const errorMessage = errors.map((error) => {
            const temp = error.constraints && Object.values(error.constraints);
            return `${error.property} : ${temp}`;
        });

        throw new CustomError(errorMessage, 400);
    }
};
