"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = void 0;
const mailer_1 = __importDefault(require("../config/mailer"));
const sendVerificationEmail = async (email, token) => {
    const frontendUrl = process.env.FRONTEND_URL;
    const verifyUrl = frontendUrl
        ? `${frontendUrl.replace(/\/$/, '')}/verify-email?token=${token}`
        : `http://localhost:${process.env.PORT || 5000}/api/auth/verify-email?token=${token}`;
    await mailer_1.default.sendMail({
        from: process.env.MAIL_FROM,
        to: email,
        subject: 'Verify your Blockvote account',
        html: `
      <h2>Welcome to Blockvote</h2>
      <p>Click the link below to verify your email address:</p>
      <a href="${verifyUrl}" style="
        background:#00d4c8;
        color:black;
        padding:12px 24px;
        border-radius:8px;
        text-decoration:none;
        font-weight:bold;
      ">Verify Email</a>
      <p>This link expires in 24 hours.</p>
    `,
    });
};
exports.sendVerificationEmail = sendVerificationEmail;
//# sourceMappingURL=sendEmail.js.map