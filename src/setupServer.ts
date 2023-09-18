import { Application, json, urlencoded, Response, Request, NextFunction } from 'express';
import { Server } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import cookieSession from 'cookie-session';
import HTTP_STATUS from 'http-status-codes';
import compression from 'compression';
import { config } from '@root/config';
import socket from 'socket.io';
import * as redis from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import applicationRoutes from '@root/routes';
import { CustomError, IErrorResponse } from '@global/helpers/error.handler';
import Logger from 'bunyan';
import { SocketIOPostHandler } from '@socket/post.socket';
import { SocketIOFollowHandler } from '@socket/follower.socket';

const log: Logger = config.createLogger('server');

export class ChattyServer {
    private app: Application;
    constructor(app: Application) {
        this.app = app;
    };

    public start(): void {
        this.securityMiddleware(this.app);
        this.standardMiddleware(this.app);
        this.routeMiddleware(this.app);
        this.globalErrorHandler(this.app);
        this.startServer(this.app);
    };

    public securityMiddleware(app: Application): void {
        app.use(
            cookieSession({
                name: 'session',
                keys: [config.SECRET_KEY_ONE, config.SECRET_KEY_TWO],
                maxAge: 24 * 7 * 3600000,
                secure: config.NODE_ENV !== 'development'
            })
        );
        app.use(hpp());
        app.use(helmet());
        app.use(
            cors({
                origin: '*',
                credentials: true,
                optionsSuccessStatus: 200
            })
        );
    }

    public standardMiddleware(app: Application): void {
        app.use(compression());
        app.use(json({ limit: '50mb' }));
        app.use(urlencoded({ extended: true }));
    }

    public routeMiddleware(app: Application): void {
        applicationRoutes(app);
    }

    private globalErrorHandler(app: Application): void {
        app.all('*', (req: Request, res: Response) => {
            res.status(HTTP_STATUS.NOT_FOUND).send({ message: `${req.originalUrl} not found.` })
        })
        app.use((err: IErrorResponse, req: Request, res: Response, next: NextFunction) => {
            log.error(err);
            if (err instanceof CustomError) {
                return res.status(err.statusCode).send(err.serializeErrors())
            }
            next()
        })
    }

    private async startServer(app: Application): Promise<void> {
        try {
            const httpServer = new Server(app);
            const socketIO: socket.Server = await this.createSocketIO(httpServer);
            this.startHttpServer(httpServer);
            this.socketIOConnections(socketIO);
        } catch (error) {
            log.error(error);
        }
    }

    private async createSocketIO(httpServer: Server): Promise<socket.Server> {
        const io: socket.Server = new socket.Server(httpServer, {
            cors: {
                origin: config.CLIENT_URL
            }
        });
        const pubClient = redis.createClient({ url: config.REDIS_HOST });
        const subClient = pubClient.duplicate();

        await Promise.all([pubClient.connect(), subClient.connect()]);

        io.adapter(createAdapter(pubClient, subClient));

        return io;
    }

    private startHttpServer(httpServer: Server): void {
        httpServer.listen(config.PORT, () => {
            log.info(`Server running on port ${config.PORT}`)
        });
    };

    private socketIOConnections(io: socket.Server) {
        const postSocketHandler: SocketIOPostHandler = new SocketIOPostHandler(io);
        const followerSocketHandler: SocketIOFollowHandler = new SocketIOFollowHandler(io);
        postSocketHandler.listen();
        followerSocketHandler.listen();
    }

}