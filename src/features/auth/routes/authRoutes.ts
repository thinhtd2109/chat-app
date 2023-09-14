import signup from '@auth/controllers/signup';
import express, { Router } from 'express';
import asyncHandler from 'express-async-handler';

class AuthRoutes {
    private router: Router;

    constructor() {
        this.router = express.Router();
    };

    public routes() {
        this.router.post('/signup', asyncHandler(signup.create))

        return this.router;
    }
}

export default new AuthRoutes();