"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
class EmailService {
    constructor() {
        this.transporter = null;
        this.initialized = false;
    }
    get smtpHost() {
        return process.env.SMTP_HOST;
    }
    get smtpPort() {
        const parsed = Number(process.env.SMTP_PORT || 587);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 587;
    }
    get smtpUser() {
        return process.env.SMTP_USER;
    }
    get smtpPass() {
        return process.env.SMTP_PASS;
    }
    get smtpSecure() {
        const configured = (process.env.SMTP_SECURE || '').trim().toLowerCase();
        if (configured === 'true') {
            return true;
        }
        if (configured === 'false') {
            return false;
        }
        return this.smtpPort === 465;
    }
    get fromAddress() {
        return process.env.SMTP_FROM || this.smtpUser || 'no-reply@codemaster.local';
    }
    isConfigured() {
        return Boolean(this.smtpHost && this.smtpUser && this.smtpPass);
    }
    getTransporter() {
        if (!this.isConfigured()) {
            return null;
        }
        if (this.transporter) {
            return this.transporter;
        }
        this.transporter = nodemailer_1.default.createTransport({
            host: this.smtpHost,
            port: this.smtpPort,
            secure: this.smtpSecure,
            auth: {
                user: this.smtpUser,
                pass: this.smtpPass,
            },
        });
        return this.transporter;
    }
    async sendPasswordResetEmail(payload) {
        const transporter = this.getTransporter();
        if (!transporter) {
            return false;
        }
        try {
            await transporter.sendMail({
                from: this.fromAddress,
                to: payload.to,
                subject: 'CodeMaster Password Reset',
                text: [
                    'We received a request to reset your CodeMaster password.',
                    '',
                    `Use this link to set a new password: ${payload.resetUrl}`,
                    `This link expires in ${payload.expiryMinutes} minutes.`,
                    '',
                    'If you did not request this, you can safely ignore this email.',
                ].join('\n'),
                html: `
          <p>We received a request to reset your CodeMaster password.</p>
          <p><a href="${payload.resetUrl}">Reset your password</a></p>
          <p>This link expires in ${payload.expiryMinutes} minutes.</p>
          <p>If you did not request this, you can safely ignore this email.</p>
        `.trim(),
            });
            if (!this.initialized) {
                this.initialized = true;
                console.log('✓ SMTP password reset email delivery enabled');
            }
            return true;
        }
        catch (error) {
            console.error('✗ Failed to send password reset email:', error);
            return false;
        }
    }
}
exports.default = new EmailService();
//# sourceMappingURL=emailService.js.map