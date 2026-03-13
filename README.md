# spinal-service-mailer

Lightweight email service for SpinalCom projects. Wraps [nodemailer](https://nodemailer.com/) in a simple class you can instantiate with your SMTP config and call `.send()`.

Can be used for analytics, ticket statistic reports and many other stuff.

If you want to use your gmail you have to enable 2FA on google https://myaccount.google.com/security and 
generate a password for the app on https://myaccount.google.com/apppasswords.

Use the generated password in the auth config of this module.



## Installation

```bash
spinalcom-utils i git+https://github.com/spinalcom/spinal-service-mailer.git
```

## Usage

```js
import { SpinalMailer } from "spinal-service-mailer";

const mailer = new SpinalMailer({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "you@gmail.com",
    pass: "your-app-password",
  },
  defaultFrom: "noreply@spinalcom.com", // optional, defaults to auth.user
});

// Verify SMTP connection (optional)
await mailer.verify();

// Send a simple email
await mailer.send({
  to: "team@company.com",
  subject: "Daily ticket recap",
  text: "Here is your daily recap.",
});

// Send with HTML + attachments
await mailer.send({
  to: ["alice@company.com", "bob@company.com"],
  subject: "Weekly stats",
  html: "<h1>Report</h1><p>See attached CSV.</p>",
  attachments: [
    {
      filename: "stats.csv",
      content: "date,tickets\n2026-03-12,42",
      contentType: "text/csv",
    },
  ],
});
```

## API

### `new SpinalMailer(config)`

| Parameter | Type | Required | Description |
|---|---|---|---|
| `config.host` | string | yes | SMTP host |
| `config.port` | number | yes | SMTP port (465, 587, …) |
| `config.secure` | boolean | no | `true` for port 465 (auto-detected if omitted) |
| `config.auth` | object | yes | `{ user, pass }` |
| `config.defaultFrom` | string | no | Default sender address |

### `mailer.verify()`

Tests the SMTP connection. Resolves on success, rejects on failure.

### `mailer.send(options)`

| Option | Type | Required | Description |
|---|---|---|---|
| `to` | string \| string[] | yes | Recipient(s) |
| `subject` | string | yes | Subject line |
| `text` | string | no | Plain-text body |
| `html` | string | no | HTML body |
| `from` | string | no | Override `defaultFrom` |
| `cc` | string \| string[] | no | CC recipient(s) |
| `bcc` | string \| string[] | no | BCC recipient(s) |
| `attachments` | array | no | [Nodemailer attachment objects](https://nodemailer.com/message/attachments/) |

Returns the nodemailer result object (`messageId`, `envelope`, …).
