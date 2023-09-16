import { Express, Response, Request } from 'express';
import * as cloudinary from '@global/helpers/cloudinary.upload';
import { IAuthMock, authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import signupController from '@auth/controllers/signup.controller';
import { CustomError } from '@global/helpers/error.handler';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/queues/auth.queue');
jest.mock('@service/queues/user.queue');
jest.mock('@global/helpers/cloudinary.upload')

describe('Signup', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.clearAllMocks();
    })
    it('should throw an error if user is not available', () => {
        const req = authMockRequest({}, {
            username: '',
            email: 'manny@test.com',
            password: 'qwertty',
            avatarColor: 'red',
            avatarImage: 'test'
        }) as unknown as Request;

        const res = authMockResponse();

        signupController.prototype.create(req, res).catch((error: CustomError) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Username is a required field');
        })
    });

    it('should throw an error if email is not available', () => {
        const req = authMockRequest({}, {
            username: 'thinhtd2109',
            email: '',
            password: 'qwertty',
            avatarColor: 'red',
            avatarImage: 'test'
        }) as unknown as Request;

        const res = authMockResponse();

        signupController.prototype.create(req, res).catch((error: CustomError) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Email is a required field');
        })
    })
})