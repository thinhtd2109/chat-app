import authMiddleware from '@global/middlewares/auth.middleware';
import addReaction from '@reaction/controllers/add.reaction';
import getReaction from '@reaction/controllers/get.reaction';
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
        this.router.post('/', asyncHandler(addReaction.reaction));
        this.router.get('/post/:postId', asyncHandler(getReaction.reaction))
        this.router.post('/post/post-username', asyncHandler(getReaction.getPostReactionByUsername))
        this.router.get('/post/username/:username', asyncHandler(getReaction.getReactionByUsername))
        return this.router;
    }
}

export default new PostRoutes();