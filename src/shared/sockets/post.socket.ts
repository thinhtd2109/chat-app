import { ICommentDocument } from '@comment/interfaces/comment.interface';
import { IReactionDocument } from '@reaction/interfaces/reaction.interface';
import { config } from '@root/config';
import Logger from 'bunyan';
import { Server, Socket } from 'socket.io';
const log: Logger = config.createLogger('LogPostIO');

export let socketIOPostObject: Server;

export class SocketIOPostHandler {
    private io: Server;
    constructor(io: Server) {
        this.io = io;
        socketIOPostObject = io;
    };

    public listen(): void {
        this.io.on('connection', (socket) => {
            socket.on('reaction', (reaction: IReactionDocument) => {
                this.io.emit('update like', reaction);
            });

            socket.on('comment', (comment: ICommentDocument) => {
                this.io.emit('update comment', comment);
            })
        })
    }
}