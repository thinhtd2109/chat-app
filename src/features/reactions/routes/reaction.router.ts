import authMiddleware from '@global/middlewares/auth.middleware';
import addReaction from '@reaction/controllers/add.reaction';
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


        return this.router;
    }
}

export default new PostRoutes();