import fs from 'fs';
import ejs from 'ejs';
import { IResetPasswordParams } from '@user/interfaces/user.interface';

class ResetPasswordTemplate {
    public passwordResetTemplate(templateParams: IResetPasswordParams) {
        return ejs.render(fs.readFileSync(__dirname + '/reset-password-template.ejs', 'utf8'), {
            ...templateParams,
            image_url: 'https://w7.pngwing.com/pngs/399/325/png-transparent-padlock-animation-footage-lock-screen-privacy-rectangle-cartoon-4k-resolution.png'
        });
    }
}

export default new ResetPasswordTemplate();