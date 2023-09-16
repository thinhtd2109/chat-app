import authMiddleware from '@global/middlewares/auth.middleware';
import { CreatePostController } from '@post/controllers/create.post';
import deletePostController from '@post/controllers/delete.post';
import getPost from '@post/controllers/get.post';
import express, { Router } from 'express';
import asyncHandler from 'express-async-handler';

class PostRoutes {
    private router: Router;

    constructor() {
        this.router = express.Router();
    };

    public routes() {
        this.router.get('/all/image/:page', asyncHandler(getPost.postWithImages))
        this.router.get('/all/:page', asyncHandler(getPost.posts));
        this.router.use(authMiddleware.verifyUser);
        this.router.use(authMiddleware.checkAuthentication);

        this.router.post('/insert', asyncHandler(CreatePostController.prototype.post));
        this.router.post('/image/insert', asyncHandler(CreatePostController.prototype.postWithImage));
        this.router.delete('/delete/:postId', asyncHandler(deletePostController.deletePost));
        return this.router;
    }
}

export default new PostRoutes();