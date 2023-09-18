import authMiddleware from '@global/middlewares/auth.middleware';
import express, { Router } from 'express';
import asyncHandler from 'express-async-handler';
import CreateFollower from '@follower/controllers/create.controller';

const createFollower: CreateFollower = new CreateFollower();

class PostRoutes {
    private router: Router;

    constructor() {
        this.router = express.Router();
    };

    public routes() {
        this.router.use(authMiddleware.verifyUser);
        this.router.use(authMiddleware.checkAuthentication);

        this.router.put('/user/:followerId', asyncHandler(createFollower.follower))
        return this.router;
    }
}

export default new PostRoutes();