import nodemailer, { Transporter } from "nodemailer";
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
    auth?:
        | {
              user: string;
              pass: string;
          }
        | false;
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

// RFC 5322-lite: good enough to catch typos without rejecting valid addresses.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeRecipients(
    input: string | string[] | undefined,
    field: string
): string[] {
    if (input == null) return [];

    const raw = Array.isArray(input) ? input : [input];
    const seen = new Set<string>();
    const out: string[] = [];

    for (const entry of raw) {
        if (typeof entry !== "string") {
            throw new Error(
                `SpinalMailer.send(): '${field}' must contain strings.`
            );
        }
        for (const part of entry.split(",")) {
            const addr = part.trim();
            if (!addr) continue;
            if (!EMAIL_RE.test(addr)) {
                throw new Error(
                    `SpinalMailer.send(): '${field}' contains an invalid email address: "${addr}".`
                );
            }
            const key = addr.toLowerCase();
            if (seen.has(key)) continue;
            seen.add(key);
            out.push(addr);
        }
    }

    return out;
}

export class SpinalMailer {
    private _transporter: Transporter;
    private _defaultFrom: string | undefined;

    constructor(config: SpinalMailerConfig) {
        if (!config?.host || !config?.port) {
            throw new Error(
                "SpinalMailer: host and port are required in config."
            );
        }

        const auth = config.auth || undefined;

        this._defaultFrom = config.defaultFrom || auth?.user;

        this._transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.secure ?? config.port === 465,
            auth,
            tls: config.tls,
            name: config.name,
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

        const sender = from || this._defaultFrom;
        if (!sender)
            throw new Error(
                "SpinalMailer.send(): 'from' is required when no auth user or defaultFrom is configured."
            );

        const toList = normalizeRecipients(to, "to");
        const ccList = normalizeRecipients(cc, "cc");
        const bccList = normalizeRecipients(bcc, "bcc");

        if (toList.length === 0)
            throw new Error(
                "SpinalMailer.send(): 'to' must contain at least one valid address."
            );

        const seenAcross = new Set(toList.map((a) => a.toLowerCase()));
        const dedup = (list: string[]) =>
            list.filter((a) => {
                const key = a.toLowerCase();
                if (seenAcross.has(key)) return false;
                seenAcross.add(key);
                return true;
            });

        return this._transporter.sendMail({
            from: sender,
            to: toList,
            subject,
            text,
            html,
            cc: dedup(ccList),
            bcc: dedup(bccList),
            attachments,
        });
    }
}
