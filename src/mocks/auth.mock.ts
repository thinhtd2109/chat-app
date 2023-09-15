import { AuthPayload, IAuthDocument } from '@auth/interfaces/auth.interface';
import { Response } from 'express';

export interface IJWT {
    jwt?: string;
}

export interface IAuthMock {
    _id?: string;
    username?: string;
    email?: string;
    password?: string;
    avatarColor?: string;
    avatarImage?: string;
    createdAt?: Date
}
export const authMockRequest = (sessionData?: IJWT, body?: IAuthMock, currentUser?: AuthPayload | null, params?: any) => {
    return {
        sessionData,
        body,
        params,
        currentUser
    }
}

export const authMockResponse = () => {
    const res: Response = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

export const authUserPayload: AuthPayload = {
    userId: '60263f14648fed5246e322d9',
    uId: '1621613119252066',
    username: 'Manny',
    email: 'manny@me.com',
    avatarColor: '#9c27b0',
    iat: 12345
};

export const authMock = {
    _id: '60263f14648fed5246e322d3',
    uId: '1621613119252066',
    username: 'Manny',
    email: 'manny@me.com',
    avatarColor: '#9c27b0',
    createdAt: '2022-08-31T07:42:24.451Z',
    save: () => { },
    comparePassword: () => false
} as unknown as IAuthDocument;
