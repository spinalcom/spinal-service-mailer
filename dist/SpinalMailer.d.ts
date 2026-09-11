import type { Attachment } from "nodemailer/lib/mailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
export interface SpinalMailerConfig {
    host: string;
    port: number;
    secure?: boolean;
    /**
     * SMTP credentials. Omit or set to `false` for relays that authenticate
     * by IP address (e.g. Google Workspace smtp-relay).
     */
    auth?: {
        user: string;
        pass: string;
    } | false;
    /** TLS socket options (e.g. `{ rejectUnauthorized: true }`). */
    tls?: SMTPTransport.Options["tls"];
    /** Hostname sent in EHLO/HELO. Defaults to the machine hostname. */
    name?: string;
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
//# sourceMappingURL=SpinalMailer.d.ts.map