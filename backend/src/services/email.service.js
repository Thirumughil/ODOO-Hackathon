import nodemailer from 'nodemailer';

const transporter = process.env.SMTP_HOST ? nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    } : undefined
}) : null;

export const sendStaffInvitationEmail = async (email, token) => {
    if (!transporter) throw new Error('SMTP service is not configured');
    const baseUrl = process.env.STAFF_ACTIVATION_URL || process.env.FRONTEND_URL;
    const activationLink = `${baseUrl}?token=${encodeURIComponent(token)}`;
    await transporter.sendMail({
        from: process.env.SMTP_FROM || 'SubscriptIQ <no-reply@example.com>',
        to: email,
        subject: 'Activate your SubscriptIQ staff account',
        text: `Use this link to activate your staff account: ${activationLink}\nThe link expires soon.`,
        html: `<p>Use this link to activate your staff account:</p><p><a href="${activationLink}">Activate staff account</a></p>`
    });
};

export const sendPasswordResetEmail = async (email, token) => {
    if (!transporter) {
        throw new Error('SMTP service is not configured');
    }

    const baseUrl = process.env.PASSWORD_RESET_URL;
    const resetLink = `${baseUrl}?token=${encodeURIComponent(token)}`;

    await transporter.sendMail({
        from: process.env.SMTP_FROM || 'SubscriptIQ <no-reply@example.com>',
        to: email,
        subject: 'Reset your SubscriptIQ password',
        text: `Use this link to reset your password: ${resetLink}\nThe link expires soon.`,
        html: `<p>Use this link to reset your password:</p><p><a href="${resetLink}">Reset password</a></p>`
    });
};
