import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import Logger from 'bunyan';
import sendGridMail from '@sendgrid/mail';
import { config } from '@root/config';
import { BadRequestError } from '@global/helpers/error.handler';

interface IMailOptions {
    from: string;
    to: string;
    subject: string;
    html: string;
}

const log: Logger = config.createLogger('Mail');

sendGridMail.setApiKey(config.SENDGRID_API_KEY);

class MailTransport {
    public async sendMail(receiverMail: string, subject: string, body: string): Promise<void> {
        if (config.NODE_ENV !== 'development') {
            return await this.developmentEmailSender(receiverMail, subject, body);
        } else {
            return await this.productionEmailSender(receiverMail, subject, body);
        }
    }
    private async developmentEmailSender(receiverMail: string, subject: string, body: string): Promise<void> {
        const transporter = nodemailer.createTransport({
            host: "smtp.forwardemail.net",
            port: 465,
            secure: true,
            auth: {
                user: config.SENDER_EMAIL,
                pass: config.SENDER_EMAIL_PASSWORD,
            },
        });

        const options: IMailOptions = {
            from: `Chat-APP <${config.SENDER_EMAIL}>`,
            to: receiverMail,
            subject,
            html: body
        };

        try {
            await transporter.sendMail(options);
            log.info('Send Mail Development Success');
        } catch (error: any) {
            throw new BadRequestError(error)
        }

    }
    private async productionEmailSender(receiverMail: string, subject: string, body: string): Promise<void> {
        const transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,

            auth: {
                user: config.SENDER_EMAIL,
                pass: config.SENDER_EMAIL_PASSWORD,
            },
        });

        const options: IMailOptions = {
            from: `Chat-APP <${config.SENDER_EMAIL}>`,
            to: receiverMail,
            subject,
            html: body
        };

        try {
            await transporter.sendMail(options);
            log.info('Send Mail Production Success');
        } catch (error: any) {
            throw new BadRequestError(error)
        }

    }
}

export default new MailTransport();