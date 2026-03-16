import nodemailer from "nodemailer";
export class SpinalMailer {
    constructor(config) {
        if (!config?.host || !config?.port || !config?.auth) {
            throw new Error("SpinalMailer: host, port and auth are required in config.");
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
    async verify() {
        await this._transporter.verify();
    }
    /**
     * Send an email.
     */
    async send(options) {
        const { to, subject, text, html, from, cc, bcc, attachments } = options;
        if (!to)
            throw new Error("SpinalMailer.send(): 'to' is required.");
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
//# sourceMappingURL=SpinalMailer.js.map