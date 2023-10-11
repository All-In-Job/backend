import { Service } from 'typedi';
import { UserService } from '../users/users.service';
import { Comment, CommentLike, Community, CommunityLike } from '@prisma/client';
import { CustomPrismaClient } from '../../database/prismaConfig';
import {
    ICommentLikeCommunity,
    ICommunityCreate,
    ICommunityToggleLike,
    ICreateCommunityComment,
} from './interfaces/community.interface';
import { idType } from '../../common/types';
import { FindManyCommunityDTO } from './dto/findMany.community';

@Service()
export class CommunityService {
    constructor(
        private readonly prisma: CustomPrismaClient, //

        private readonly userService: UserService, //
    ) {}

    async create({
        id: userId,
        createCommunity,
    }: ICommunityCreate): Promise<Community> {
        await this.userService.isUserByID(userId);

        return this.prisma.community.create({
            data: { userId, ...createCommunity },
        });
    }

    findeMany({
        category,
        title,
        nickName: nickname,
        content,
    }: FindManyCommunityDTO): Promise<Community[]> {
        return this.prisma.community.findMany({
            where: {
                ...(category && { category }),
                ...(title && { title: { contains: title } }),
                ...(nickname && { user: { nickname: { contains: nickname } } }),
                ...(content && {
                    OR: [
                        { title: { contains: content } },
                        { detail: { contains: content } },
                    ],
                }),
            },
            include: {
                user: true,
            },
        });
    }

    findOne({ id }: idType): Promise<Community> {
        return this.prisma.community.update({
            where: { id },
            data: {
                view: { increment: 1 },
            },
            include: {
                user: true,
                comments: {
                    include: {
                        user: true,
                    },
                },
                communitiyLikes: {
                    include: {
                        user: true,
                    },
                },
            },
        });
    }
    async toggleLike({
        userId,
        communityId,
    }: ICommunityToggleLike): Promise<CommunityLike[]> {
        await this.userService.isUserByID(userId);

        const likeCommunity = await this.prisma.communityLike.findFirst({
            where: { AND: [{ communityId, userId }] },
        });

        return this.prisma.community
            .update({
                where: { id: communityId },
                data: {
                    likeCount: likeCommunity
                        ? { decrement: 1 }
                        : { increment: 1 },
                    communitiyLikes: likeCommunity
                        ? { delete: { id: likeCommunity.id } }
                        : { create: { userId } },
                },
                include: {
                    communitiyLikes: {
                        include: {
                            user: true,
                        },
                    },
                },
            })
            .then((el) => el.communitiyLikes);
    }

    async createComment({
        userId,
        communityId,
        comment,
    }: ICreateCommunityComment): Promise<Comment[]> {
        await this.userService.isUserByID(userId);

        return await this.prisma.community
            .update({
                where: { id: communityId },
                data: {
                    commentCount: { increment: 1 },
                    comments: {
                        create: {
                            comment,
                            userId,
                        },
                    },
                },
                include: {
                    comments: {
                        include: {
                            user: true,
                        },
                        orderBy: {
                            createAt: 'desc',
                        },
                    },
                },
            })
            .then((el) => el.comments);
    }

    async commentLike({
        userId,
        commentId,
    }: ICommentLikeCommunity): Promise<CommentLike[]> {
        await this.userService.isUserByID(userId);

        const commentLike = await this.prisma.commentLike.findFirst({
            where: { AND: [{ commentId, userId }] },
        });

        return this.prisma.comment
            .update({
                where: { id: commentId },
                data: {
                    commentLike: commentLike
                        ? { delete: { id: commentLike.id } }
                        : { create: { userId } },
                },
                include: {
                    commentLike: {
                        include: {
                            user: true,
                        },
                    },
                },
            })
            .then((el) => el.commentLike);
    }
}
