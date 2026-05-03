import { getMailer } from '../config/mailer'

export const sendVerificationEmail = async (email: string, token: string) => {
  const transporter = await getMailer()
  const frontendUrl = process.env.FRONTEND_URL
  const verifyUrl = frontendUrl
    ? `${frontendUrl.replace(/\/$/, '')}/verify-email?token=${token}`
    : `http://localhost:${process.env.PORT || 5000}/api/auth/verify-email?token=${token}`

  await transporter.sendMail({
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
  })
}
