declare class EmailService {
    private transporter;
    private initialized;
    private get smtpHost();
    private get smtpPort();
    private get smtpUser();
    private get smtpPass();
    private get smtpSecure();
    private get fromAddress();
    isConfigured(): boolean;
    private getTransporter;
    sendPasswordResetEmail(payload: {
        to: string;
        resetUrl: string;
        expiryMinutes: number;
    }): Promise<boolean>;
}
declare const _default: EmailService;
export default _default;
//# sourceMappingURL=emailService.d.ts.map