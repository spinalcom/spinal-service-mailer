import nodemailer, { Transporter } from "nodemailer";
import type { Attachment } from "nodemailer/lib/mailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

export interface SpinalMailerConfig {
    host: string;
    port: number;
    secure?: boolean;
    auth: {
        user: string;
        pass: string;
    };
    defaultFrom?: string;
}

export interface SendOptions {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    from?: string;
    cc?: string | string[];
    bcc?: string | string[];
    attachments?: Attachment[];
}

export class SpinalMailer {
    private _transporter: Transporter;
    private _defaultFrom: string;

    constructor(config: SpinalMailerConfig) {
        if (!config?.host || !config?.port || !config?.auth) {
            throw new Error(
                "SpinalMailer: host, port and auth are required in config."
            );
        }

        this._defaultFrom = config.defaultFrom || config.auth.user;

        this._transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.secure ?? config.port === 465,
            auth: config.auth,
        });
    }

    /**
     * Verify SMTP connection.
     * Resolves if the server is reachable, rejects otherwise.
     */
    async verify(): Promise<void> {
        await this._transporter.verify();
    }

    /**
     * Send an email.
     */
    async send(options: SendOptions): Promise<SMTPTransport.SentMessageInfo> {
        const { to, subject, text, html, from, cc, bcc, attachments } = options;

        if (!to) throw new Error("SpinalMailer.send(): 'to' is required.");
        if (!subject)
            throw new Error("SpinalMailer.send(): 'subject' is required.");

        return this._transporter.sendMail({
            from: from || this._defaultFrom,
            to,
            subject,
            text,
            html,
            cc,
            bcc,
            attachments,
        });
    }
}
