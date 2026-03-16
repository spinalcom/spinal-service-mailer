"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpinalMailer = void 0;
const nodemailer_1 = require("nodemailer");
class SpinalMailer {
    constructor(config) {
        var _a;
        if (!(config === null || config === void 0 ? void 0 : config.host) || !(config === null || config === void 0 ? void 0 : config.port) || !(config === null || config === void 0 ? void 0 : config.auth)) {
            throw new Error("SpinalMailer: host, port and auth are required in config.");
        }
        this._defaultFrom = config.defaultFrom || config.auth.user;
        this._transporter = nodemailer_1.default.createTransport({
            host: config.host,
            port: config.port,
            secure: (_a = config.secure) !== null && _a !== void 0 ? _a : config.port === 465,
            auth: config.auth,
        });
    }
    /**
     * Verify SMTP connection.
     * Resolves if the server is reachable, rejects otherwise.
     */
    verify() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._transporter.verify();
        });
    }
    /**
     * Send an email.
     */
    send(options) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
}
exports.SpinalMailer = SpinalMailer;
//# sourceMappingURL=SpinalMailer.js.map