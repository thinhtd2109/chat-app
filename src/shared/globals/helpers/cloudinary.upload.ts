import cloundinary from 'cloudinary';
import { BadRequestError } from './error.handler';

export async function uploads(file: string, public_id?: string, overwrite?: boolean, invalidate?: boolean): Promise<cloundinary.UploadApiResponse | cloundinary.UploadApiErrorResponse | undefined> {
    return await cloundinary.v2.uploader.upload(file, {
        public_id, overwrite, invalidate
    }).catch(err => { throw new BadRequestError(JSON.stringify(err)) })
};