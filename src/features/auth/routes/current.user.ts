import currentController from '@auth/controllers/current.controller';
import authMiddleware from '@global/middlewares/auth.middleware';
import express, { Router } from 'express';
import asyncHandler from 'express-async-handler';

class CurrentUserRoutes {
    private router: Router;

    constructor() {
        this.router = express.Router();
    };

    public routes() {
        this.router.use(authMiddleware.verifyUser);
        this.router.use(authMiddleware.checkAuthentication);
        this.router.get('/current-user', asyncHandler(currentController.read));
        return this.router;
    }
}

export default new CurrentUserRoutes();