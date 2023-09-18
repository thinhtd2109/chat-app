import { IFollower } from '@follower/interfaces/follower.interface';
import { config } from '@root/config';
import Logger from 'bunyan';
import { Server, Socket } from 'socket.io';
const log: Logger = config.createLogger('LogPostIO');

export let socketIOFollowerObject: Server;

export class SocketIOFollowHandler {
    private io: Server;
    constructor(io: Server) {
        this.io = io;
        socketIOFollowerObject = io;
    };

    public listen(): void {
        this.io.on('connection', (socket) => {
            socket.on('unfollow user', (data: IFollower) => {
                this.io.emit('remove follower', data);
            });
        })
    }
}