import nodemailer from 'nodemailer';

import { readFileSync } from 'fs';
import { Service } from 'typedi';
import { join } from 'path';
import { AppConfig } from "@config";
import { AppError } from "@infrastructure/errors/app.error";
import { IMailService } from "@domain/services/impl.mail.service";

const mailHtmlTemplate = readFileSync(
    join(process.cwd(), 'public', 'mail.template.html'), 'utf8'
);

@Service()
export class MailService implements IMailService {
    private transporter: nodemailer.Transporter;

    constructor(private readonly config: AppConfig) {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: config.email.user,
                pass: config.email.pass
            }
        });
    }

    async sendVerificationEmail(to: string, code: string): Promise<void> {
        try {
            await this.transporter.sendMail({
                from: this.config.email.user,
                to,
                subject: 'Email Verification',
                html: mailHtmlTemplate.replace('{{code}}', code)
            });
        } catch (error) {
            throw new AppError('MAIL_ERROR', 'Error sending verification email', 400);
        }
    }
}