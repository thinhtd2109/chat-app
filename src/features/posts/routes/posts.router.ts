import signup from '@auth/controllers/signup.controller';
import authMiddleware from '@global/middlewares/auth.middleware';
import { CreatePostController } from '@post/controllers/create.post';
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
        this.router.post('/insert', asyncHandler(CreatePostController.prototype.post));
        this.router.post('/image/insert', asyncHandler(CreatePostController.prototype.postWithImage));
        return this.router;
    }
}

export default new PostRoutes();