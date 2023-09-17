import { IPostDocument } from '@post/interfaces/post.interface';
import postService from '@service/db/post.service';
import PostCache from '@service/redis/post.cache';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
const postCache = new PostCache();
const PAGE_SIZE = 10;

class GetPostController {
    public async posts(request: Request, response: Response) {
        let posts: IPostDocument[] = [];
        const { page } = request.params;
        const start: number = (parseInt(page) - 1) * PAGE_SIZE;
        const stop: number = start + PAGE_SIZE - 1;
        let totalPosts = 0;
        const cachedPosts: IPostDocument[] = await postCache.getPostFromCache('post', start, stop);

        if (cachedPosts.length > 0) {
            posts.push(...cachedPosts);
            totalPosts = await postCache.getTotalPostsFromCache();
        } else {
            posts = await postService.getPosts({}, start, PAGE_SIZE, { createdAt: -1 })
            totalPosts = await postService.postsCount();
        }

        response.status(HTTP_STATUS.OK).send({
            message: 'All posts',
            data: {
                posts,
                totalPosts
            }
        })
    };
    public async postWithImages(request: Request, response: Response) {
        let posts: IPostDocument[] = [];
        const { page } = request.params;
        const start: number = (parseInt(page) - 1) * PAGE_SIZE;
        const stop: number = start + PAGE_SIZE - 1;
        let totalPosts = 0;
        const cachedPosts: IPostDocument[] = await postCache.getPostFromCache('post', start, stop);

        if (cachedPosts.length > 0) {
            posts.push(...cachedPosts);
            totalPosts = await postCache.getTotalPostsFromCache();
        } else {
            posts = await postService.getPosts({ imgId: '$ne', gifUrl: '$ne' }, start, PAGE_SIZE, { createdAt: -1 })
            totalPosts = await postService.postsCount();
        }

        response.status(HTTP_STATUS.OK).send({
            message: 'All posts with image',
            data: {
                posts,
                totalPosts
            }
        })
    };
}

export default new GetPostController();