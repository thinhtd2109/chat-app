import authRoutes from "@auth/routes/authRoutes";
import currentUserRoutes from "@auth/routes/current.user";
import { serverAdapter } from "@service/queues/base.queue";
import { Application, NextFunction, Response } from "express";

const BASE_PATH = '/api/v1';

export default (app: Application) => {
    const routes = () => {
        app.use(`${BASE_PATH}/auth`, authRoutes.routes());
        app.use(`${BASE_PATH}/user`, currentUserRoutes.routes());
        app.use('/queues', serverAdapter.getRouter());
    };

    routes()
}