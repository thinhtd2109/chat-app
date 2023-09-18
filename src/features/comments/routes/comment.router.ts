import createComment from '@comment/controllers/create.comment';
import getComment from '@comment/controllers/get.comment';
import authMiddleware from '@global/middlewares/auth.middleware';
import { CreatePostController } from '@post/controllers/create.post';
import deletePostController from '@post/controllers/delete.post';
import getPost from '@post/controllers/get.post';
import updatePost from '@post/controllers/update.post';
import express, { Router } from 'express';
import asyncHandler from 'express-async-handler';

class PostRoutes {
    private router: Router;

    constructor() {
        this.router = express.Router();
    };

    public routes() {
        this.router.use(authMiddleware.verifyUser);
        this.router.use(authMiddleware.checkAuthentication);

        this.router.post('/', asyncHandler(createComment.comment));
        this.router.get('/post/:postId', asyncHandler(getComment.comments));
        this.router.get('/post/:postId/comment/:commentId', asyncHandler(getComment.singleComment))
        return this.router;
    }
}

export default new PostRoutes();