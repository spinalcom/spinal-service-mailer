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
export declare class SpinalMailer {
    private _transporter;
    private _defaultFrom;
    constructor(config: SpinalMailerConfig);
    /**
     * Verify SMTP connection.
     * Resolves if the server is reachable, rejects otherwise.
     */
    verify(): Promise<void>;
    /**
     * Send an email.
     */
    send(options: SendOptions): Promise<SMTPTransport.SentMessageInfo>;
}
