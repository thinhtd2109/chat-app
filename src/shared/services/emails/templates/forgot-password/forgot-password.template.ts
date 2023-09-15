import fs from 'fs';
import ejs from 'ejs';

class ForgotPasswordTemplate {
    public passwordForgotTemplate(username: string, resetLink: string) {
        return ejs.render(fs.readFileSync(__dirname + '/forgot-password-template.ejs', 'utf8'), {
            username,
            resetLink,
            image_url: 'https://w7.pngwing.com/pngs/399/325/png-transparent-padlock-animation-footage-lock-screen-privacy-rectangle-cartoon-4k-resolution.png'
        });
    }
}

export default new ForgotPasswordTemplate();