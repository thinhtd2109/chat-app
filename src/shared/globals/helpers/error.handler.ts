import HTTP_STATUS from 'http-status-codes';


export interface IErrorResponse {
    message: string;
    statusCode: number;
    status: string;
    serializeErrors(): IError
};

export interface IError {
    message: string;
    statusCode: number;
    status: string;
}

export abstract class CustomError extends Error {
    abstract statusCode: number;
    abstract status: string;

    constructor(message: string) {
        super(message);
    };

    serializeErrors(): IError {
        return {
            message: this.message,
            status: this.status,
            statusCode: this.statusCode
        }
    }
}

export class JoiValidateError extends CustomError {
    public statusCode: number = HTTP_STATUS.BAD_REQUEST;
    public status: string = 'error';

    constructor(message: string) {
        super(message)
    };
};

export class BadRequestError extends CustomError {
    public statusCode: number = HTTP_STATUS.BAD_REQUEST;
    public status: string = 'error';

    constructor(message: string) {
        super(message)
    };
};

export class NotFoundError extends CustomError {
    public statusCode: number = HTTP_STATUS.NOT_FOUND;
    public status: string = 'error';

    constructor(message: string) {
        super(message)
    };
}

export class AuthorizedError extends CustomError {
    public statusCode: number = HTTP_STATUS.UNAUTHORIZED;
    public status: string = 'error';

    constructor(message: string) {
        super(message)
    };
}

export class FileTooLargeError extends CustomError {
    public statusCode: number = HTTP_STATUS.REQUEST_TOO_LONG;
    public status: string = 'error';

    constructor(message: string) {
        super(message)
    };
}

export class ServerError extends CustomError {
    public statusCode: number = HTTP_STATUS.SERVICE_UNAVAILABLE;
    public status: string = 'error';

    constructor(message: string) {
        super(message)
    };
}  