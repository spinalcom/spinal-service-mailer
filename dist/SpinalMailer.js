import nodemailer from "nodemailer";
// RFC 5322-lite: good enough to catch typos without rejecting valid addresses.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function normalizeRecipients(input, field) {
    if (input == null)
        return [];
    const raw = Array.isArray(input) ? input : [input];
    const seen = new Set();
    const out = [];
    for (const entry of raw) {
        if (typeof entry !== "string") {
            throw new Error(`SpinalMailer.send(): '${field}' must contain strings.`);
        }
        for (const part of entry.split(",")) {
            const addr = part.trim();
            if (!addr)
                continue;
            if (!EMAIL_RE.test(addr)) {
                throw new Error(`SpinalMailer.send(): '${field}' contains an invalid email address: "${addr}".`);
            }
            const key = addr.toLowerCase();
            if (seen.has(key))
                continue;
            seen.add(key);
            out.push(addr);
        }
    }
    return out;
}
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
        const toList = normalizeRecipients(to, "to");
        const ccList = normalizeRecipients(cc, "cc");
        const bccList = normalizeRecipients(bcc, "bcc");
        if (toList.length === 0)
            throw new Error("SpinalMailer.send(): 'to' must contain at least one valid address.");
        const seenAcross = new Set(toList.map((a) => a.toLowerCase()));
        const dedup = (list) => list.filter((a) => {
            const key = a.toLowerCase();
            if (seenAcross.has(key))
                return false;
            seenAcross.add(key);
            return true;
        });
        return this._transporter.sendMail({
            from: from || this._defaultFrom,
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
//# sourceMappingURL=SpinalMailer.js.map