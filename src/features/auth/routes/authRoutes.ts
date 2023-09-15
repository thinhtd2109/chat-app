import signinController from '@auth/controllers/signin.controller';
import signup from '@auth/controllers/signup.controller';
import express, { Router } from 'express';
import asyncHandler from 'express-async-handler';

class AuthRoutes {
    private router: Router;

    constructor() {
        this.router = express.Router();
    };

    public routes() {
        this.router.post('/signup', asyncHandler(signup.create));
        this.router.post('/signin', asyncHandler(signinController.signIn));

        return this.router;
    }
}

export default new AuthRoutes();